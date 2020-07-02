# Authentication

Most API operations require you to be authenticated, hence you will probably need an account for your application 
or provide users with the ability to authenticate themselves.

## Login with university credentials

The Student-Management-System does not accept or store any passwords. Instead login has to be performed with the 
[Sparkyservice](http://147.172.178.30:8080/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config) as described [here](https://github.com/Student-Management-System/Sparkyservice-Project/wiki/Authentication-Process).

Upon a successful login with the Sparkyservice, you will receive a [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token) (JWT) inside of the response body
(see [this](http://147.172.178.30:8080/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#/auth-controller/authenticate)).
This JWT can then be used to login into the Student-Management-System via [this route](http://147.172.178.30:3000/api/#/authentication/loginWithToken).
As you can see, the system expects an object with the property `token` as the request body for this route.
```json
{
  "token": "your.jwt.token"
}
```
If the supplied token was valid, you will receive a HTTP-Status 200 (OK) and the response body will contain an object, which most importantly contains
a new JWT inside of the `accessToken` property. This token must be used in future requests to the system to enable authentication.
```json
{
  "accessToken": "new.jwt.token",
  "userId": "id_of_logged_in_user",
  "username": "username_of_logged_in_user",
  "role": "STUDENT"
}
```

## Login for verified systems

Please contact us [here]() about obtaining an account for your system.
TODO: Explain

## Authenticated requests

Once you have obtained a JWT from the Student-Managment-System, you can use it for authentication.
You can either set the Authorization-Header for outgoing requests to the system manually or you set it by using 
the generated API-client's methods.

#### Manually setting the Authorization-Header

The System uses Bearer Authentication, therefore you must configure the Authorization-Header like so:
```typescript
Authorization: "Bearer " + yourToken;
```

#### Setting Authorization-Header with client

You can use the provided methods of the generated client to configure the Authorization-Header.
The client provides methods to set headers explicitly or you can use the `configuration` property of any service like so:
```typescript
someService.defaultHeaders.set("Authorization", yourToken);
// or
someService.configuration.accessToken = yourToken;
```
You can also set it globally for all services:

=== "Angular"
	```typescript
	// app.module.ts
	imports: [
		// ...
		ApiModule.forRoot(() => new Configuration({
			accessToken: // bind some function to this to retrieve the token
		}))
	]
	```

=== "Java"
	```java
	// TODO
	```
