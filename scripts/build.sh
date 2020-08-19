#!/bin/bash

# Build
npm install
ng build --base-href=/Backend-APP/ --deploy-url=/Backend-APP/ --prod

# Unit tests
#npm run test

# End to End tests
#npm run test:e2e Disabled until sqlite issue is fixed

# test coverage
#npm run test:cov

# Deploy on demo server
#scripts/deploy.sh
scripts/deployAPP.sh