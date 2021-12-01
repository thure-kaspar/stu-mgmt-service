# Event notifications

The Student Management System is capable of notifying other systems when certain events are triggered.
This might be the start of a homework assignment, a participant joining a course, a user leaving their group and many more.
A full list of available events is specified at the end of this article.

The receiving system must implement an endpoint that accepts HTTP **POST** messages.

After receiving an event notification, the `NotificationDto`, which is included in the **request body**,
should contain at least the Ids of relevant entities that have been affected by the event.
It also specifies the event name. An enum of event names is also exported with the API specification.

```typescript
class NotificationDto {
	event: Event;
	courseId: string;
	assignmentId?: string;
	groupId?: string;
	userId?: string;
	payload?: object;
}
```

## Subscribing to notifications

Subscribing to events allows you to receive notifications when an event is triggered inside of a course.
There are several ways to register a subscriber for event notifications, which will be discussed in the following sections

### Using the API

The Student Management System's API allows you to (un)subscribe to events dynamically at runtime.
This can be done by using the
[[PUT] /notifications/courses/{courseId}/subscribers/{name}]("http://147.172.178.30:3000/api/#/notification/subscribe")
endpoint or the `NotificationService.subscribe` function in the generated API client.
As implied the use of **PUT** as HTTP request method, it is safe to call this function multiple times, meaning
you won't begin to receive duplicated messages when already subscribed. Using this endpoints requires
one of the following roles: `SYSTEM_ADMIN`, `MGMT_ADMIN` or `ADMIN_TOOL`

In the request body, the following properties must be specified:

```json
{
  "name": "myApp", // Name of your application
  "url": "http://myApp.url/notifications" // URL to the endpoint that accepts POST requests
  "events": {
    "USER_JOINED_GROUP": true,
    "ASSIGNMENT_STATE_CHANGED": true,
	...
  }
}
```

The `events` property is a map with event names as key and a boolean indicating whether notifications
should be sent for this event. You only have to include events where this value is set to `true`.

If you are interested in all events, you may also use the following value:

```json
{
  ...
  "events": {
    "ALL": true
  }
}
```

Using `ALL` will also ensure that you receive notifications for events that might be added in the
future.

### Using the Config

Instead of using the API, registration of subscribers can also be done through the system's configuration file.

```yaml
notifications:
    enabled: true
    subscribers:
        - courseId: java-wise1920
          name: myApp
          url: http://myApp.url
          events:
              ALL: true

        - courseId: java-wise1920
          name: myOtherApp
          url: http://myOtherApp.url
          events:
              COURSE_JOINED: true
              ASSIGNMENT_STATE_CHANGED: true
```

Using `ALL` will also ensure that you receive notifications for events that might be added in the
future.

### Using the Client (UI)

Adding and removing subscribers can also be done in the **Course Settings** within the Student Management System Client.

## Events

The following sections describe all events that are send out by the Student-Management-System.

For reference, the `Event` enumeration can be see below:

```typescript
export enum Event {
	COURSE_JOINED = "COURSE_JOINED",
	ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED",
	ASSIGNMENT_UPDATED = "ASSIGNMENT_UPDATED",
	ASSIGNMENT_REMOVED = "ASSIGNMENT_REMOVED",
	ASSIGNMENT_STATE_CHANGED = "ASSIGNMENT_STATE_CHANGED",
	GROUP_REGISTERED = "GROUP_REGISTERED",
	GROUP_UNREGISTERED = "GROUP_UNREGISTERED",
	USER_REGISTERED = "USER_REGISTERED",
	USER_UNREGISTERED = "USER_UNREGISTERED",
	USER_JOINED_GROUP = "USER_JOINED_GROUP",
	USER_LEFT_GROUP = "USER_LEFT_GROUP",
	REGISTRATIONS_CREATED = "REGISTRATIONS_CREATED",
	REGISTRATIONS_REMOVED = "REGISTRATIONS_REMOVED"
}
```

## Assignment-related events

### AssignmentCreated

Published when a new assignment has been created.

```json
{
	"event": Event.ASSIGNMENT_CREATED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId
}
```

### AssignmentUpdated

Published when an assignment has been updated.

```json
{
	"event": Event.ASSIGNMENT_UPDATED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId
}
```

### AssignmentRemoved

Published when an assignment has been removed.

```json
{
	"event": Event.ASSIGNMENT_REMOVED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId
}
```

### AssignmentStateChanged

Published when the assignment has been updated with a new state (i.e. `INVISIBLE` to `IN_PROGRESS`). It will be triggered by manual updates as well as by scheduled start/stops of assignments.

```json
{
	"event": Event.ASSIGNMENT_STATE_CHANGED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId,
	"payload": {
		"state": event.assignment.state // The new state
	}
}
```

### RegistrationsCreated

If the assignment uses `collaboration`-type `GROUP` or `GROUP_OR_SINGLE`, starting the assignment will cause the current groups to become registered with their members for this assignment. This will trigger the `RegistrationsCreated` event. It can also be triggered manually by [[POST] /courses/{courseId}/assignments/{assignmentId}/registrations](http://147.172.178.30:3000/api/#/assignment-registration/_registerAllGroups) (Delete existing registrations before doing so!).

```json
{
	"event": Event.REGISTRATIONS_CREATED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId
}
```

### RegistrationsRemoved

If for some reason, all registrations should be removed, this can be done via [[DELETE] http://147.172.178.30:3000/api/#/assignment-registration/unregisterAll](/courses/{courseId}/assignments/{assignmentId}/registrations). Doing so will trigger the `RegistrationsRemoved` event.

```json
{
	"event": Event.REGISTRATIONS_REMOVED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId
}
```

### GroupRegistered

Triggered when a group is registered for an assignment after the initial registrations have already been created (see [RegistrationsCreated](#registrationscreated)).

```json
{
	"event": Event.GROUP_REGISTERED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId,
	"groupId": event.groupId
}
```

### GroupUnregistered

Triggered when an individual group's registration gets removed, meaning it won't be triggered together with [RegistrationsRemoved](#registrationsremoved).

```json
{
	"event": Event.GROUP_UNREGISTERED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId,
	"groupId": event.groupId
}
```

### UserRegistered

Triggered when an participant is added to a registered group, after the initial registrations have already been created (see [RegistrationsCreated](#registrationscreated)).

```json
{
	"event": Event.USER_REGISTERED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId,
	"userId": event.userId,
	"groupId": event.groupId
}
```

### UserUnregistered

Triggered when an individual user's registration gets removed (user is removed from the group). It won't be triggered together with [RegistrationsRemoved](#registrationsremoved).

```json
{
	"event": Event.USER_UNREGISTERED,
	"courseId": event.courseId,
	"assignmentId": event.assignmentId,
	"userId": event.userId
}
```

## Participant-related events

### CourseJoined

Triggered when a user joins a course.

```json
{
	"event": Event.COURSE_JOINED,
	"courseId": event.courseId,
	"userId": event.userId
}
```

## Group-related events

These events are about the "global" group list and not related to the assignment registrations!

### UserJoinedGroup

Triggered when a user joins a group or is added to it.

```json
{
	"event": Event.USER_JOINED_GROUP,
	"courseId": event.courseId,
	"userId": event.userId,
	"groupId": event.groupId
}
```

### UserLeftGroup

Triggered when a user leaves his current group or is removed from it.

```json
{
	"event": Event.USER_LEFT_GROUP,
	"courseId": event.courseId,
	"userId": event.userId,
	"groupId": event.groupId
}
```
