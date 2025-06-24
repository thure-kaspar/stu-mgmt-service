#!/bin/bash
docker run -e RUN_AS_DEMO=true --network=host -p 3000:3000 stud-mngmt-backend
