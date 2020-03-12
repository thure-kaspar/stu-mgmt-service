#!/bin/bash

# Deploy via ssh, see: https://medium.com/@mosheezderman/how-to-set-up-ci-cd-pipeline-for-a-node-js-app-with-jenkins-c51581cc783c
ssh -i ~/.ssh/id_rsa_student_mgmt_backend elscha@147.172.178.30 <<EOF
 cd ~/StudentMgmt-Backend
 git reset --hard
 git pull
 npm install -production
 rm ~/.pm2/logs/npm-error.log
 pm2 restart 0 --wait-ready # requires project intialized with: pm2 start npm -- run start:demo
 cd ..
 sleep 30
 ./chk_logs_for_err.sh
EOF
