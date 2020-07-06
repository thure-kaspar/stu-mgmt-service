# Course participants

The following article explains how you can manage the participants of a course.

## Searching participants

First of all, you might be interested in retrieving the course participants. 
[[GET] courses/{courseId}/users](http://147.172.178.30:3000/api/#/courses/getUsersOfCourse) and `CourseService.getUsersOfCourse`
allow you do just that. You can filter the results with the following parameters:
```
username - Only include participants that match this username (%username%)
courseRole - Array of CourseRoles (i.e. ["STUDENT"])
```

If we were to search for all participants that have the permission to create assessments (lecturers and tutors),
we could perform a request like this:

=== "Angular"
	```typescript
	const courseId = "java-wise1920";
	const roles = [UserDto.CourseRoleEnum.LECTURER, UserDto.CourseRoleEnum.TUTOR];
	const skip = undefined; // No pagination 
	const take = undefined; // No pagination

	// Find all lecturers and tutors
	this.courseService.getUsersOfCourse(courseId, undefined, undefined, roles]
		.subscribe(
			result => {
				const evaluators = result;
			}
	);
	```

=== "Java"
	```java
	// TODO
	```

The response could look like this:
```json
[
  {
    "id": "a019ea22-5194-4b83-8d31-0de0dc9bca53",
    "email": "max.mustermann@test.com",
    "username": "mmustermann",
    "role": "USER",
    "courseRole": "LECTURER"
  },
  {
    "id": "40f59aad-7473-4455-a3ea-1214f19b2565",
    "email": "hans.peter@test.com",
    "username": "hpeter",
    "role": "USER",
    "courseRole": "TUTOR"
  }
]
```

## Change participants role

Let's say we want to promote a participant to the Tutor role. For this purpose, we can use 
[[PATCH] /courses/{courseId}/users/{userId}/role](http://147.172.178.30:3000/api/#/courses/updateUserRole) and
`CourseService.updateUserRole`. The request requires the `LECTURER` role.
We need to specify the new role inside of the request body by using `ChangeCourseRoleDto` or
creating an object with the following schema:
```typescript
{
	"role": "TUTOR" // Alternatively: "STUDENT", "LECTURER"
}
```
If the request was successful, you'll receive a HTTP-Status 200 without a reponse body.

## Removing a participant

If you need to remove a participant from the course, you can do so by using [[DELETE] /courses/{courseId}/users/{userId}](http://147.172.178.30:3000/api/#/courses/removeUser)
and `CourseService.removeUser`.
The request requires the `LECTURER` role.

If the request was successful, you'll receive a HTTP-Status 200 without a reponse body.
