# FAQ

#### Specifying a semester

Sometimes you might want to filter data by semester, i.e. when you want to retrieve all courses that are taking place in the
current semester. The Student-Management-System describes semesters with the following format:

Winter semesters will be represented as "wise" followed by the last two digits of the years that the semester will take place in.
Summer semesters will be represented as "sose" followed by the corresponding year.

```typescript
"wise1920"; // winter semester 2019/2020
"sose2021"; // summer semester 2021
```

Summer semesters span from april to september.
Winter semesters span from october to march.

#### Pagination

Most queries allow limiting the returned results while still including the amount of total elements that matched your filter.
To confirm that a route supports pagination, check the Swagger UI or API-Client for the `skip` and `take` parameters.

```
take - Amount of elements that should be included in the response
skip - Amount of elements that should be skipped => (currentPage - 1) * pageSize
```

The total element count can be accessed through a custom `X-TOTAL-COUNT` header in the HTTP response.

=== "Angular"

    ```typescript
    // Find courses in summer semester 2020 (first 20 results)
    const skip = 0;
    const take = 20;
    this.courseService
    	.getCourses(undefined, "sose2020", undefined, skip, take, "response")
    	.subscribe(response => {
    		const totalCount = response.headers.get("x-total-count");
    		const courses = response.body;
    	});
    ```

=== "Java"

    ```java
    // TODO
    ```
