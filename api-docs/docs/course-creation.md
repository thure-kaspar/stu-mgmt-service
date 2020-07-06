# Creating a course

This article explains how you can create a new course with the Student-Management-System's API.
Unlike with most entities, course creation allows you to create nested objects along side the course entity.
This is due to the fact, that some configuration must be stated explicitly and because the frontend client 
allows copying an entire course's configuration in order to make admins lives easier.

#### Endpoint

The corresponding endpoint for this operation is [[POST] /courses](http://147.172.178.30:3000/api/#/courses/createCourse).
The data expected request body is defined in `CourseCreateDto`.
A generated client will provide this method through `CourseService.createCourse`.
Requires `ADMIN` role.

## Mandatory properties 

First of all, let's take a look at the minimal configuration that we must provide to create a course.   
```json
{
	"shortname": "java",
	"semester": "wise2021",
	"title": "Programmierpraktikum I: Java",
	"isClosed": false,
	"config": {
		"groupSettings": {
			"allowGroups": "true",
			"sizeMin": 2,
			"sizeMax": 3,
			"selfmanaged": true
		}
	}
}
```
The combination of `shortname` and `semester` must be unique, meaning it can only exists once in the system.
Iterations of a course should always use the same `shortname`. This enables better discoverability when
a user searches for iterations of a course and allows admins of the platform to easily assign the
responsibility of managing course (incl. past semesters) to a member of the teaching staff.
By default, the created course will be assigned an ID formatted like so: 

`shortname-semester => java-wise2021`

This ID will be used to identify the course in requests and URLs of the Student-Management-System's frontend client.
You can also provide a custom ID as shown in the following section.

#### Closing a course

The `isClosed` property determines, wether users are able to join the course.

#### Allowing group creation

The `groupSettings.allowGroups` property determines, wether participants group creation is enabled.
The `sizeMin` and `sizeMax` properties define the allowed amount of members.

## Advanced configuration

In the following sections, we'll introduce additional configurable properties.

#### Customizing the Course-ID

The Course-ID will be used to identify the course in requests and URLs of the Student-Management-System's frontend client.
If you'd like to customize the ID, you can do so by setting the `id` property. Currently, changing the ID of an existing course
is not supported. The ID must be unique, meaning it can only exist once in the system.

```json
{
	// ...
	"id": "java-2021"
}
```

#### Protecting a course with a password

It is possible to protect a course by setting a password.
Users that want to join the course, must then include the correct password in their requests.
```json
{
	// ...
	"config": {
		// ...
		"password": "top_secret"
	}
}
```

#### Subscribing to events

Subscribing to a course allows you to receive notifications when an event is triggered inside of the course.
This might be the joining of a participant, activities inside of a group, closing of assignment submission and more.
The topic of course events is covered in depth in this article [here](TODO).

To subscribe to a course, you are required to provide a URL to a system that can listen to HTTP-POST events. 
```json
{
	// ...
	"config": {
		// ...
		"subscriptionUrl": "http://example.com/api"
	}
}
```

## Group settings

Most group setting properties are mandatory when creating a course.

#### Selfmanaged groups

TODO: Define selfmanaged

#### Forcing consistent group names

If you want to prevent students from creating groups with custom names, you can define a prefix that defines group names.
All created groups will be named like so: `prefix INDEX`;
```json
{
	// ...
	"config": {
		// ...
		"groupSettings": {
			// ...
			"nameSchema": "Java-Group" // results in "Java-Group 1", ...
		}
	}
}
```

## Lecturers

You can assign the responsible lecturers when creating a course. To do so, you need to specify an array containing the usernames
of your selected lecturers.
```json
{
	// ...
	"lecturers": [
		"mustermann",
		"mueller"
	]
}
```

## Admission criteria

The Student-Management-System's API allows you to specify admission criteria, which can be used by students and the teaching staff, i.e.
to determine which student is allowed to participate in the final exam and to see how well students are performing.
A detailed description can be found [here](TODO).

## Assignment templates

The Student-Management-System's API allows you to create templates for assignments. Templates provide the teaching staff with a way 
to easily create assignments with predefined settings. A detailed description can be found [here](TODO).





