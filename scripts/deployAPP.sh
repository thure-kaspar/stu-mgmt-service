#!/bin/bash

# Deploy via ssh
ssh -i ~/.ssh/id_rsa_student_mgmt_backend elscha@147.172.178.30 <<EOF
 cd /var/www/html2/Backend-APP
 rm -f -r *
EOF
scp -i ~/.ssh/id_rsa_student_mgmt_backend -r dist/student-mgmt-client/* elscha@147.172.178.30:/var/www/html2/Backend-APP