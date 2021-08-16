#!/bin/bash

# Build
npm install

# Unit tests
#npm run test

# End to End tests
#npm run test:e2e Disabled until sqlite issue is fixed

# test coverage
#npm run test:cov

# Create pre-compiled distribution package
npm run build
rm -f Backend.tar.gz
tar czf Backend.tar.gz dist config package.json ormconfig.ts

# Deploy on demo server
scripts/deploy.sh