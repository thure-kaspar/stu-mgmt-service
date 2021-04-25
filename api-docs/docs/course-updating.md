# Editing a course

While creating a course allows us to create nested objects along side the basic course data,
editing the course requires us to update these objects individually. The following article explains how each
part of the course and its configuration can be updated. Doing so requires the `ADMIN` or `LECTURER` role.

## Basic data

Updating the basic course data can be done with [[PATCH] /courses/{courseId}](http://147.172.178.30:3000/api/#/courses/updateCourse)
and `CourseService.updateCourse`. Currently, this route does not support partial updates, therefore you'll need to include the complete
`CourseDto` in the request body. Changing the Course-ID is not possible. The request could look like this:

```json
{
	"shortname": "java",
	"semester": "wise2021",
	"title": "Programmierpraktikum I: Java",
	"isClosed": false,
	"link": "http://example.url"
}
```

If the request was successful, you'll receive the updated `CourseDto` as a response.

## Course configuration

Updating the course configuration can be done partially, meaning you only need to specify the fields that you want to change.
The course configuration contains some native properties as well as nested objects (i.e. Group settings). To update a nested objects,
you'll need to refer to the corresponding update method for this resource.

To update native properties of the configuration you can use [[PATCH] /courses/{courseId}/config](http://147.172.178.30:3000/api/#/course-config/updateCourseConfig)
and `CourseConfigService.updateCourseConfig`.

You can use the `CourseConfigUpdateDto`, which only contains editable properties or use an object containing any of these properties:

```json
{
	"password": "new_password"
}
```

If the request was successful, you'll receive the updated `CourseConfigurationDto` as a response.

## Group settings

Updating the group settings of a course can also be done partially via [[PATCH] /courses/{courseId}/config/group-settings](http://147.172.178.30:3000/api/#/course-config/updateGroupSettings)
and `CourseConfigService.updateGroupSettings`.
You can use the properties of `GroupSettingsDto`, which has the following schema:

```json
{
	"allowGroups": true,
	"nameSchema": "JAVA_GROUP",
	"sizeMin": 2,
	"sizeMax": 4,
	"selfmanaged": true
}
```

If the request was successful, you'll receive the updated `GroupSettingsDto` as a response.

## Admission criteria

It's possible to update the admission criteria of a course. See [this](TODO) article to learn more.

## Assignment templates

Assignment templates are a part of the course configuration. You can read more about them [here](TODO).
