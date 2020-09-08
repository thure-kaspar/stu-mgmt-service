# Events

The following article lists all events that are send out by the Student-Management-System.

After receiving an event notification, the `NotificationDto` should contain at least the Ids of relevant entities that have been affected by the event.
It also contains the event name. An enum of event names is also exported with the API specification.

```typescript
class NotificationDto {
	event: Event;
	courseId: CourseId;
	assignmentId?: AssignmentId;
	groupId?: GroupId;
	userId?: UserId;
	payload?: object;
}
```

## Assignment-related events

### AssignmentCreated
Published when a new assignment has been created.
```
{
	event: Event.ASSIGNMENT_CREATED,
	courseId: event.courseId,
	assignmentId: event.assignmentId
}
```

### AssignmentRemoved
Published when an assignment has been removed.
```
{
	event: Event.ASSIGNMENT_REMOVED,
	courseId: event.courseId,
	assignmentId: event.assignmentId
}
```

### AssignmentStateChanged
Published when the assignment has been updated with a new state (i.e. `INVISIBLE` to `IN_PROGRESS`). It will be triggered by manual updates as well as by scheduled start/stops of assignments.
```
{
	event: Event.ASSIGNMENT_STATE_CHANGED,
	courseId: event.courseId,
	assignmentId: event.assignmentId,
	payload: {
		state: event.assignment.state // The new state
	}
}
```

### RegistrationsCreated
If the assignment uses `collaboration`-type `GROUP` or `GROUP_OR_SINGLE`, starting the assignment will cause the current groups to become registered with their members for this assignment. This will trigger the `RegistrationsCreated` event. It can also be triggered manually by [[POST] /courses/{courseId}/assignments/{assignmentId}/registrations](http://147.172.178.30:3000/api/#/assignment-registration/_registerAllGroups) (Delete existing registrations before doing so!). 
```
{
	event: Event.REGISTRATIONS_CREATED,
	courseId: event.courseId,
	assignmentId: event.assignmentId
}
```

### RegistrationsRemoved
If for some reason, all registrations should be removed, this can be done via [[DELETE] http://147.172.178.30:3000/api/#/assignment-registration/unregisterAll](/courses/{courseId}/assignments/{assignmentId}/registrations). Doing so will trigger the `RegistrationsRemoved` event.
```
{
	event: Event.REGISTRATIONS_REMOVED,
	courseId: event.courseId,
	assignmentId: event.assignmentId
}
```

### GroupRegistered
Triggered when a group is registered for an assignment after the initial registrations have already been created (see [RegistrationsCreated](#registrationscreated)).
```
{
	event: Event.GROUP_REGISTERED,
	courseId: event.courseId,
	assignmentId: event.assignmentId,
	groupId: event.groupId
}
```

### GroupUnregistered
Triggered when an individual group's registration gets removed, meaning it won't be triggered together with [RegistrationsRemoved](#registrationsremoved).
```
{
	event: Event.GROUP_UNREGISTERED,
	courseId: event.courseId,
	assignmentId: event.assignmentId,
	groupId: event.groupId
}
```

### UserRegistered
Triggered when an participant is added to a registered group, after the initial registrations have already been created (see [RegistrationsCreated](#registrationscreated)).
```
{
	event: Event.USER_REGISTERED,
	courseId: event.courseId,
	assignmentId: event.assignmentId,
	userId: event.userId,
	groupId: event.groupId
}
```

### UserUnregistered
Triggered when an individual user's registration gets removed (user is removed from the group). It won't be triggered together with [RegistrationsRemoved](#registrationsremoved).
```
{
	event: Event.USER_REGISTERED,
	courseId: event.courseId,
	assignmentId: event.assignmentId,
	userId: event.userId
}
```

## Participant-related events

### CourseJoined
Triggered when a user joins a course.
```
{
	event: Event.COURSE_JOINED,
	courseId: event.courseId,
	userId: event.userId
}
```

## Group-related events
These events are about the "global" group list and not related to the assignment registrations!

### UserJoinedGroup
Triggered when a user joins a group or is added to it.
```
{
	event: Event.USER_JOINED_GROUP,
	courseId: event.courseId,
	userId: event.userId,
	groupId: event.groupId
}
```

### UserLeftGroup
Triggered when a user leaves his current group or is removed from it.
```
{
	event: Event.USER_LEFT_GROUP,
	courseId: event.courseId,
	userId: event.userId,
	groupId: event.groupId
}
```
