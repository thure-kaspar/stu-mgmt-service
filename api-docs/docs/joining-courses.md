# Joining courses

In order to access a course without admin permissions you need to join it.
This article explains how you can join courses with Student-Management-System's API.

The corresponding endpoint for joining a course is [[POST] /courses/{courseId}/users/{userId}](http://147.172.178.30:3000/api/#/courses/addUser),
which is provided by the client through `CourseService.addUser`.

## Check if joining is possible

Before trying to join a course, we might want to check, wether joining is possible and if we're required to provide a passwort.
For this purpose, we can use [[GET] /courses/{courseId}/users/{userId}/canJoin](http://147.172.178.30:3000/api/#/courses/canUserJoinCourse)
or `CourseService.canUserJoinCourse`. This query will return a `CanJoinCourseDto`, which contains the following schema:

```javascript
class CanJoinCourseDto {
	canJoin: boolean; // Indicates, wether joining is possible.
	requiresPassword?: boolean; // Indicates, wether password is required.
	reason?: "CLOSED" | "IS_MEMBER"; // Reason why we can't join.
}
```

## Joining a course

If the course requires a password, we need to provide it within the request body. Otherwise, we can just leave it empty.
You can use a `PasswordDto` or create an object yourself that matches this schema:

```json
{
	"password": "super_secret_password"
}
```

A successful join-request might not return any data. Receiving a HTTP-Status 200 (OK) indicates, that the operation was successful.
