# Migrations

This directory contains migration files.

[https://typeorm.io/#/migrations](https://typeorm.io/#/migrations)

### Automatically generate a migration

```
$ npm run typeorm migration:generate -n MigrationName
```

### Generate an empty migration

```
$ npm run typeorm migration:create -n MigrationName
```

### Run migrations

```
$ npm run typeorm migration:run
```

### Revert latest migration

```
$ npm run typeorm migration:revert
```
