# Assignments

Assignments are exercises, tests or exams that should be completed by the students. They can also be used to track a student's admission status by defining the amount of achievable points and creating assessments for their submission.
This article explains how assignments can be created and managed with the Student-Management-System's API.

## Stages of an assignment

First of all, we should introduce the stages (or states) of an assignment and explain their meaning:

-   **INVISIBLE**: Assingment is only visible for the teaching staff.
-   **CLOSED**: Assignment is visible, but has not started yet (i.e. submissions are not possible).
-   **IN_PROGRESS**: Students can submit their solutions until the deadline.
-   **IN_REVIEW**: Submission is no longer possible. Assessments can now be created, but they will only be visible for the teaching staff.
-   **EVALUATED**: Assessment will be published to the students.

If start dates and/or end dates are defined, the assignment will automatically switch into the `IN_PROGRESS` and `IN_REVIEW` state. To switch between these states manually, see [Updating an assessment](#updating-an-assignment).

## Creating an assignment

The endpoint for the creation of assignments is [[POST] /courses/{courseId}/assignments](http://147.172.178.30:3000/api/#/assignments/createAssignment) and `AssignmentsService.createAssignment`. The expected payload inside the request body uses the schema of `AssignmentDto` and might look like this:

```json
{
	"courseId": "java-wise1920",
	"name": "Exercise 01 - Hello world",
	"state": "INVISIBLE",
	"startDate": "2020-10-01T08:00:00.000Z",
	"endDate": "2020-10-01T23:59:59.000Z",
	"type": "HOMEWORK",
	"collaboration": "GROUP", // Alternatively: GROUP_OR_SINGLE or SINGLE
	"points": 10,
	"bonusPoints": 0,
	"comment": "Create your first JAVA program. Good luck!",
	"link": "www.example.url"
}
```

## Updating an assignment

Assignments can be updated partially. The corresponding endpoint is [[PATCH] /courses​/{courseId}​/assignments​/{assignmentId}](<(http://147.172.178.30:3000/api/#/assignments/updateAssignment)>) and `AssignmentsService.updateAssignment`. The `AssignmentUpdateDto` contains all properties that can be updated.

If we wanted to start an assignment manually, we could issue a request with the following request body:

```json
{
	"state": "IN_PROGRESS"
}
```

## Retrieving assignments

### All assignments of a course

Assignments can be retrieved via [[GET /courses/{courseId}/assignments]](http://147.172.178.30:3000/api/#/assignments/getAssignmentsOfCourse) and `AssignmentsService.getAssignmentOfCourse`.
If the requesting user is a `LECTURER` or `TUTOR` the returned data will also include `INVISIBLE` assignments.

### Specific assignment

The endpoint for retrieving a specific assignment is [[GET /courses/{courseId}/assignments/{assignmentId}]](http://147.172.178.30:3000/api/#/assignments/getAssignmentById) and `AssignmentsService.getAssignmentById`.

## Deleting an assignment

Assignments can be deleted via [[DELETE] /courses​/{courseId}​/assignments​/{assignmentId}](http://147.172.178.30:3000/api/#/assignments/deleteAssignment) and `AssignmentsService.deleteAssignment`.
