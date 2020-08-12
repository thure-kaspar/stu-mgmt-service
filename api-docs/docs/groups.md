# Groups
If group creation is enabled in a course, participants can form groups. When creating assessments, groups can be used to assign the assessment to all members of a group instead of having to create multiple assessments.

## Creating a group
The endpoint for creating groups is [[POST] /courses/{courseId/groups}](http://147.172.178.30:3000/api/#/groups/createGroup) and `GroupsService.createGroup`. In the request body a `GroupDto` with the following schema is expected. However, the validity of some options depends on the requesting user's course role.
```json
{
	"name": "JAVA-GROUP 1",
	"password": "top_secret",
	"isClosed": false
}
```

The group's `name` must be unique in this course.
The `isClosed` flag determines, if participants are able to enter the group.

### As Student
Once the group has been created, the student will automatically join the group. This is not the case with `LECTURER` and `TUTOR`. 

The following rules apply:

1. When participants with the `STUDENT` role want to create a group, they cannot be member of another group. 
2. The group's `name` can only be set freely, if the course does not enforce a `nameSchema`. If the course is using a `nameSchema`, the group's name will be chosen automatically. 
3. If the course's required minimum group size is greater than 1, the `isClosed` flag will be automatically set to false.

### As Lecturer or Tutor
For lecturers and tutors, the rules from above don't apply and the user will not be added to the group.

## Creating multiple groups
Lecturers have the ability to create multiple groups at once by using [[POST] /courses/{courseId}/groups/bulk](http://147.172.178.30:3000/api/#/groups/createMultipleGroups) and `GroupsService.createMultipleGroups`.

There are two options. You can either create groups from a list of names like so:
```json
{
	"names": [
		"JAVA-GROUP 1",
		"JAVA-GROUP 2",
		"JAVA-GROUP 3"
	]
}
```

... or define a prefix and count like so: 
```json
{
	"nameSchema": "JAVA-GROUP",
	"count": 3
}
```
Both requests would yield the same result.

## Updating a group
The properties of a group can be updated via [[PATCH] /courses/{courseId}/groups/{groupId}](http://147.172.178.30:3000/api/#/groups/updateGroup) and `GroupsService.updateGroup`. This endpoint allows partial updated, meaning you only have to include changed properties in the request body. The request body uses the `GroupUpdateDto` schema, which only consists of optional properties.

### Changing the name
You can change the name like so, but keep in mind that the group name must be unique in this course. Setting the group name to an empty string is also not allowed.
```json
{
	"name": "New Name"
}
```

### Changing the password
In order to change the password, you must include the `password` field in your request.
If you'd like to remove the password, simply set it to an empty string.
```json
{
	"password": "top_secret" // "" removes the password
}
```

### Closing the group
Setting `isClosed` to true as `STUDENT`, is only allowed, if the group's size has reached the course's required minimum group size.
```json
{
	"isClosed": "true"
}
```
