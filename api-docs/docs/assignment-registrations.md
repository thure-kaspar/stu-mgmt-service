# Assignment registrations
Students can solve assignments collaboratively with their group. A student can only be member of one group at a time, but is "free" (depending on course configuration) to switch groups between assignments. In order to track the groups compositions that actually apply to a specific assignment, the Student-Management-System's API uses **assignment registrations**. Due to this explicit management of group memberships (in the context of a assignment), it is possible to change a student's group even after the assignment is no longer in progress. 

Normally, when an assignment is started (`IN_PROGRESS` state), the current groups are automatically registered for this assignment. The following articles explains how groups of an assignment can be determined and edited.

## Creating registrations manually
### All groups
The system should handle the registrations automatically once an assignment starts, but in case there are any problems with the automatic creation or this process needs to be repeated, the [[POST] /courses/{courseId}/assignments/{assignmentId}/registrations](http://147.172.178.30:3000/api/#/assignment-registration/_registerAllGroups) and `AssignmentRegistrationService._registerAllGroups` can be used. This will register all groups with their current members for the assignment.

### Registering a participant
In order to add a participant to a group retroactively, the [[POST] /courses/{courseId}/assignments/{assignmentId}/registrations/groups/{groupId}/members/{userId}](http://147.172.178.30:3000/api/#/assignment-registration/registerParticipantAsGroupMember) and `AssignmentRegistrationService.registerParticipantAsGroupMember` endpoint can be used. A student can only be registered once, so prior registrations must be removed beforehand.

## Removing registrations
### Removing all
To remove all registrations for a specific assignments, you can use the [[DELETE] /courses/{courseId}/assignments/{assignmentId}/registrations](http://147.172.178.30:3000/api/#/assignment-registration/unregisterAll) and `AssignmentRegistrationService.unregisterAll` endpoint.

### Remove group
To remove the registration of a group and its members for a specific assignments, you can use the [[DELETE] /courses​/{courseId}​/assignments​/{assignmentId}​/registrations​/groups​/{groupId}](http://147.172.178.30:3000/api/#/assignment-registration/unregisterGroup) and `AssignmentRegistrationService.unregisterAll` endpoint.

### Remove participant
To unregister a participant from a specific assignments, you can use the [[DELETE] /courses/{courseId}/assignments/{assignmentId}/registrations/users/{userId}](http://147.172.178.30:3000/api/#/assignment-registration/unregisterUser) and `AssignmentRegistrationService.unregisterAll` endpoint.

## Retrieving groups of assignment
### All groups
Retrieving the registered groups (including their members) can be done via [[GET] /courses/{courseId}/assignments/{assignmentId}/registrations/groups](http://147.172.178.30:3000/#/assignment-registration/getRegisteredGroups) and `AssignmentRegistrationService.getRegisteredGroups` endpoint. Additionally, the result can be filtered by `groupname` and pagination is also supported.

### Specific group
A specific group (including its members) can be retrieved with the [[GET] /courses/{courseId}/assignments/{assignmentId}/registrations/groups/{groupId}](http://147.172.178.30:3000/#/assignment-registration/getRegisteredGroup) and `AssignmentRegistrationService.getRegisteredGroup` endpoint.

### Group of participant
The group of a specific participant for an assignment can be retrieved with [[GET] /courses/{courseId}/assignments/{assignmentId}/registrations/users/{userId}](http://147.172.178.30:3000/#/assignment-registration/getRegisteredGroupOfUser) and `AssignmentRegistrationService.getRegisteredGroupOfUser` endpoint.

Alternatively: [[GET] /users/{userId}/courses/{courseId}/assignments/{assignmentId}/group](http://147.172.178.30:3000/api/#/users/getGroupOfAssignment).

### All groups of participant
To map all assignments to the user's registered group for this assignment, [[GET] /users/{userId}/courses/{courseId}/assignments/groups](http://147.172.178.30:3000/api/#/users/getGroupOfAllAssignments) and `UsersService.getGroupOfAllAssignments` exists. This returns a list of objects containing the assignment and group. Only assignments with a registered group including the user will be returned.
```json
[
	{
		"assignment": ...,
		"group": ...
	},
	...
]
```
