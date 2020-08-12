# Assessments
This article explains how you can create, update and find assessments using the Student-Management-System's API.

## Creating assessments
Creating assessment allows you to grade assignments. By doing so, you award points to students, which will then be counted towards the fulfillment of the specified [Admission criteria](TODO).

The appropriate endpoint for the assessment creation is [[POST] /courses/{courseId}/assignments/{assignmentId}/assessments](http://147.172.178.30:3000/api/#/assessments/createAssessment) and `AssessmentsService.createAssessment`.
As payload for this request an `AssessmentCreateDto` is expected, which fortunately only includes properties that can be set at creation. 

You're expected to specify either a `userId` or `groupId` as target of the assessment. When using a `groupId` all users that were members of the group at the end of the assignment will be connected with the assessment and awarded with the points.

You can also include partial assessments in the request inside the `partialAssessments` array. Partial assessment can be used to add additional comments to an assessment, as well as describing the breakdown of
achieved points. Here is an example of a possible request body:
```json
{
  "assignmentId": "INSERT_ASSIGNMENT_ID", // might get removed, since already specified in route
  "creatorId": "string", // very likely to get removed, since server can determine user
  "achievedPoints": 42,
  "comment": "Good job!",
  "groupId": "INSERT_GROUP_ID",
  "partialAssessments": [
	{
  		"title": "Task 1a",
  		"type": "???", // Unsure how this will be used
  		"severity": "INFORMATIONAL",
  		"points": 5,
  		"comment": "Well done :)"
	}
  ]
}
```

## Adding partial assessments
 While it is possible to add partial assessments directly when creating a new assessment, it can also be done in other ways. This section explains how this can be achieved.

### Endpoint for creating partial assessments
If you're only interested in adding partial assessments and don't want to update the assessment itself,
you can use [[POST] /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId}](http://147.172.178.30:3000/api/#/assessments/addPartialAssessment) and `AssessmentsService.addPartialAssessment`.

The request body could look like this:
```json
{
  "assessmentId": "INSERT_ASSESSMENT_ID", // TODO: remove, because already included in URL ?
  "title": "Task 1a",
  "type": "???", // Unsure how this will be used
  "severity": "INFORMATIONAL",
  "points": 5,
  "comment": "Well done :)"
}
```

### Adding partial assessments in the update

You can also add partial assessments when updating the assessment itself. See [Updating assessment](#updating-assessments).

## Updating assessments

### Updating native properties
The [[PATCH] /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId}](http://147.172.178.30:3000/api/#/assessments/updateAssessment) endpoint and `AssessmentService.updateAssessment` allow you to update an assessment. An `AssessmentUpdateDto` is expected as the request body, which fortunately only exposes editable properties. All properties are optional and the endpoint enables you to update the assessment partially, meaning you only need to specify properties that you want to change. An update request might look this:
```json
{
  "achievedPoints": 42,
  "comment": "Some comment..."
}
```
If the score of an assessment changes, the system will also store this event, including the old and new score.
The change events can be retrieved using [[GET] /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId}/events](http://147.172.178.30:3000/api/#/assessments/getEventsOfAssessment) and `AssessmentsService.getEventsOfAssessment`.

### Updating partial assessments
In order to perform updates to partial assessments, you need to explicitly assign them to the `AssessmentUpdateDto`.
You only need to include partial assessments, that should be either added, updated or removed. Others will remain unchanged. In the `updatePartialAssignments` array you can include the updated partial assessments. Keep in mind, that you can't change the `id` or `assignmentId`.
As mentioned above, all of these properties are optional.
```json
{
	// Array containing partial assessment that should be ...
	"addPartialAssessments": [], // added
	"updatePartialAssignments": [], // updated
	"removePartialAssignments": [],// removed
}
```

## Searching assessments
This sections explains how you can find assessments with the Student-Management-System's API.

### Assessments of an assignment
The [[GET] /courses/{courseId}/assignments/{assignmentId}/assessments](http://147.172.178.30:3000/api/#/assessments/getAssessmentsForAssignment) endpoint and `AssessmentsService.getAssessmentsForAssignment` allow you to query the assessments of a specific assignment. You can also filter the returned data with the following query parameters (incl. pagination):
```
groupId - Only returns the assessment of the group
userId - Only returns the assessment of the user
minScore - Only includes assessments, where achievedPoints >= minScore
creatorId - Only includes assessments, that have been created by the specified user.
```
The returned data should always include partial assessments, if they exist, the creator (`UserDto`) of the assessment
and the group (including members), if it was a group-assessment. Here is an example:
```json
[
  {
    "id": "680dd44a-93b0-4d1c-a947-9b50a4bbb68e",
    "assignmentId": "993b3cd0-6207-11ea-bc55-0242ac130003",
    "achievedPoints": 50,
    "comment": "A comment...",
    "creatorId": "8330300e-9be7-4a70-ba7d-8a0139311343",
    "creator": {
      "id": "8330300e-9be7-4a70-ba7d-8a0139311343",
      "email": "john.doe@test.com",
      "username": "John Doe",
      "rzName": "jdoe",
      "role": "USER"
	},
	"partialAssessments": [
      {
        "id": 1,
        "assessmentId": "680dd44a-93b0-4d1c-a947-9b50a4bbb68e",
        "title": "Task 1",
        "type": "???",
        "severity": "INFORMATIONAL",
        "comment": "Very good",
        "points": 10
      },
      {
        "id": 2,
        "assessmentId": "680dd44a-93b0-4d1c-a947-9b50a4bbb68e",
        "title": "Task 2",
        "type": "???",
        "severity": "CRITICAL",
        "comment": "Very bad",
        "points": 0
      }
    ],
  },
  // ...
]
```

### Specific assessment
Retrieving a specific assessment can be done via [[GET] /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId}](http://147.172.178.30:3000/api/#/assessments/getAssessmentById) and `AssessmentsService.getAssessmentById`. The returned data should also contain partials assessments, the creator and the group.

### All assessments of a group
TODO: Specific endpoint  
Currently, using `GroupsService.getGroupById` includes assessments, but this is likely to change in the future.

### All assessment of a course participant
The [[GET] /users/{userId}/courses/{courseId}/assessments](http://147.172.178.30:3000/api/#/users/getAssessmentsOfUserForCourse) endpoint and `UsersService.getAssessmentsOfUserForCourse` can be used.
> **Warning: Route will likely change soon!**
