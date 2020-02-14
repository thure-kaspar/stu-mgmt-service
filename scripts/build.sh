#!/bin/bash

# Build
npm install

# Unit tests
#npm run test

# End to End tests
npm run test:e2e

# test coverage
#npm run test:cov

# Fill demo database with data
npm run script:demodb

# Deploy on demo server
scripts/deploy.sh