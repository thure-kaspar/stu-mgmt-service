pipeline {
  agent any
    
  tools {nodejs "NodeJS 12.14"}
    
  stages {
        
    stage('Cloning Git') {
      steps {
        git 'https://github.com/Student-Management-System/StudentMgmt-Backend.git'
      }
    }
        
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }
    
    /*
    stage('Test') {
      steps {
         sh 'npm run test'
         sh 'npm run test:e2e'
         sh 'npm run test:cov'
      }
    }
    */
    
    
    stage('Build') {
      steps {
         sh 'npm run build'
         sh 'rm -f Backend.tar.gz'
         sh 'tar czf Backend.tar.gz dist src test config package.json ormconfig.ts tsconfig.json'
      }
    }
    
    stage('Deploy') {
      steps {
         sshagent(credentials: ['Stu-Mgmt_Demo-System']) {
             sh '''
                [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                ssh-keyscan -t rsa,dsa example.com >> ~/.ssh/known_hosts
                ssh -i ~/.ssh/id_rsa_student_mgmt_backend elscha@147.172.178.30 <<EOF
                  cd ~/StudentMgmt-Backend
                  git reset --hard
                  git pull
                  npm install
                  rm ~/.pm2/logs/npm-error.log
                  pm2 restart 0 --wait-ready # requires project intialized with: pm2 start npm -- run start:demo
                  cd ..
                  sleep 30
                  ./chk_logs_for_err.sh
                  exit
                EOF'''
         }
      }
    }
    
    stage('Report') {
        steps {
            findText(textFinders: [textFinder(regexp: '(- error TS\\*)|(Cannot find module.*or its corresponding type declarations\\.)', alsoCheckConsoleOutput: true, buildResult: 'FAILURE')])
        }
    }
    
    stage('Publish Results') {
        steps {
            archiveArtifacts artifacts: '*.tar.gz'
        }
    }
    
    stage("Trigger Downstream Projects") {
        steps {
            build job: 'Teaching_StuMgmtDocker', wait: false
            build job: 'Teaching_StudentMgmt-Backend-API-Gen', wait: false
        }
    }
     
  }
}