## Description
![Build Status](https://jenkins-2.sse.uni-hildesheim.de/buildStatus/icon?job=Teaching_StudentMgmt-Backend "Build Status")

Backend of the student management system.

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

