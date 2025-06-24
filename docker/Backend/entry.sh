#!/bin/bash

# Wait until DB is running (only if a host was specified)
if [[ ! -z "${DB_HOST}" ]]; then
    printf "Waiting for DB at %s" "${DB_HOST} "
    while ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; do
        sleep 1
        printf "."
    done
    printf " done.\n"
fi

# Start the App
if [ ! -z "${RUN_AS_DEMO}" ]; then
    npm run start:main
else
    npm run start:prod
fi
