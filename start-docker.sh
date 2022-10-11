#!/bin/bash
docker run -d -p 80:3000 -e DB_HOST=192.168.2.138 -e DB_PORT=5435 -e DB_USERNAME=postgres -e DB_PASSWORD=admin -e DB_DATABASE=competence-repository-db -e RUN_AS_DEMO=true std-mgmt-backend
