# Searching courses

This article explains how to search for courses and how to request a single course with the Student-Management-System's API.

## Filtering courses

If you want to retrieve a list of courses matching the specified filter, you can use the
[/courses/getCourses](http://147.172.178.30:3000/api/#/courses/getCourses) endpoint. The generated client provides 
this method through the `CourseService.getCourses`. You can filter the results with the following parameters:
```
shortname - Exact match
semester - Exact match
title - Matches courses that include the title
```

=== "Angular"
	```typescript
	const shortname = undefined;
	const semester = "sose2020";
	const title = undefined;
	// Find all courses in summer semester 2020 
	this.courseService.getCourses(shortname, semester, title).subscribe(
		result => {
			const courses: CourseDto[] = result;
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
    "id": "java-sose2020",
    "shortname": "java",
    "semester": "sose2020",
    "title": "Programmierpraktikum I: Java",
    "isClosed": false,
    "link": "http://example.url"
  },
  {
    "id": "info2-sose2020",
    "shortname": "info2",
    "semester": "sose2020",
    "title": "Informatik II: Algorithmen und Datenstrukturen",
    "isClosed": true,
    "link": "http://example.url"
  }
]
```

## Finding a specific course

#### Using shortname and semester

You might want to retrieve a specific course, but not know its Course-ID. In this case, you can use 
[[GET] /courses/{name}/semester/{semester}](http://147.172.178.30:3000/api/#/courses/getCourseByNameAndSemester), which is provided by the 
client through `CourseService.getCourseByNameAndSemester`. Since, `shortname` of courses should remain consistent for every iteration of
the course, this endpoint can help you to find out the ID of a course, which will be required to retrieve more information about this course.

#### Using the Course-ID

If you know the ID of the course you want to retrieve, you can use [[GET] /courses/getCourseById](http://147.172.178.30:3000/api/#/courses/getCourseById),
which is provided by the client through `CourseService.getCourseById`.

The response could look like this:

```json
{
  "id": "java-sose2020",
  "shortname": "java",
  "semester": "sose2020",
  "title": "Programmierpraktikum I: Java",
  "isClosed": false,
  "link": "http://example.url"
}
```

Note, that the response does not contain relations.
