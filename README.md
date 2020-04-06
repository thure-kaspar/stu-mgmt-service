## Description
![Build Status](https://jenkins-2.sse.uni-hildesheim.de/buildStatus/icon?job=Teaching_StudentMgmt-Backend "Build Status")

Backend of the student management system.

## Requirements
* npm
* postgresql

## Installation

```bash
$ npm install
```

## Configuration
The following environment variables can be set. Environment variables will take precedence over those specified in [/config](https://github.com/SSEHUB/StudentMgmt-Backend/tree/master/config).

| Environment variable | Description |
|----------------------|-------------|
| SERVER_PORT | The port, which the application is listening to. |
| DB_TYPE | Specifies the database engine (i. e "postgres", "mysql", [etc.](https://typeorm.io/#/connection-options/common-connection-options)). |
| DB_HOST | Database host. |
| DB_PORT | Port of the database. |
| DB_USERNAME | Database username.  |
| DB_PASSWORD | Database password. |
| DB_DATABASE | Name of the database. |
| TYPEORM_SYNC | Indicates if database schema should be auto created on every application launch (true or false). Should not be used in production. |
| SMTP_SERVER | The SMTP-Server used for sending email notifications. |
| SMTP_PORT | Port of the SMTP -Server. |
| SMTP_SECURE | If true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false. |
| SMTP_USERNAME | Username for the SMTP-Server. |
| SMTP_PASSWORD | Password for the SMTP-Server. |

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

