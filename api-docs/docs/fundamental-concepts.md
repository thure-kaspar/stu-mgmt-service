# Fundamental concepts

The Student-Management-System provides a REST-API. While implementing and using basic REST-APIs is relatively easy,
they usually suffer from over- and/or under-fetching, meaning clients requesting data receive either too much
data or not enough for their use case. Likewise, this API also has to find a balance between comfort (simply sending everything)
and performance (only sending the minimal amount of information). 
The following sections explain the common behavior of the API that you should expect when creating requests.

Wherever possible, we'll try to provide accurate information in the corresponding articles about the shape of returned data
and accepted nested objects inside of request objects. Take a look into the supplied example responses and ideally log
received data when using endpoints for the first time to confirm that you receive the expected information.
If you find any irregularities in the documentation, please inform us by creating an issue in the
[GitHub repository](https://github.com/Student-Management-System/StudentMgmt-Backend/issues) or contact us directly [here](TODO).

## Querying collections

If you request a collection of entities, i.e. courses or participants, you should expect that the returned objects only contain their
primitive properties, meaning their relations are not included. An obvious explanation for this behavior is the fact that including relations 
would often times end up in repetition of data (i.e. an assessment includes its assignment; Loading all assessments of an assignment would 
cause the assignment to be replicated for every assessment). As described above, this might change for certain use cases.
For example, when requesting group compositions you'll receive a collection of groups, which include their members. In such cases,
the corresponding articles should tell you about this behavior.

## Querying a single entity

If you request a single entity, i.e. a group, you will receive the primitive properties of said entity and also
the first level of relations. That means most relations will be included, but relations of relations won't be included.

## Creating and updating an entity

Not all properties of an entity can be edited. In some cases, the API provides DTOs named like so `EntityUpdateDto`.
These DTOs will give a better indication about the editable properties compared to their base versions.
Concrete information about updating entities can be found in the respective articles, but a usual rule is this:
Creating or modifying nested objects (relations) is not supported in most cases. The reason for this decision has to do with 
avoiding unintentional manipulations and single point of failures. We don't want to risk breaking entire features (i.e. editing course configuration),
just because there is an issue with a nested object.

## Partial updates

Some entities allow partial updates, meaning you don't have to provide all properties when trying to update them.
That means, you only need to include properties that you want to change in your request.
To find out, if partial updates are enabled, refer to the documentation, Swagger UI descriptions or check the method tooltips in the generated API-client. 

## Dealing with errors

Producing an error - either due to invalid requests or server failures - will yield a 4XX/5XX HTTP status code.
This will cause the API-client or your native HTTP-library to throw an Exception, so be ready to catch these errors
and deal with them accordingly. Invalid requests (status 4XX) also include an error message in the response, which should
tell you why your request failed. Additionally, the Student-Management-System API-Specification includes and exports an enum
containing the names of existing domain exceptions (i.e. `NotACourseMemberException`). This enum can be found in the client 
as `StudentMgmtException`. TODO: Refine exception handling with custom exceptions.

Requests that don't return data (return type `void`), such as DELETE requests, use errors to indicate the success of their
operation.



