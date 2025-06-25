pipeline {
    agent any

    tools {nodejs "NodeJS 16.13"}

    options {
        ansiColor('xterm')
    }

    environment {
        DEMO_SERVER = '147.172.178.30'
        DEMO_SERVER_PORT = '3000'
        API_FILE = 'api-json'
        API_URL = "http://${env.DEMO_SERVER}:${env.DEMO_SERVER_PORT}/${env.API_FILE}"
    }

    stages {

        stage('Git') {
            steps {
                cleanWs()
                git 'https://github.com/Student-Management-System/StudentMgmt-Backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }


        stage('Build') {
            steps {
                sh 'npm run build'
                sh 'rm -f Backend.tar.gz'
                sh 'tar czf Backend.tar.gz dist src test config package.json package-lock.json ormconfig.ts tsconfig.json'
            }
        }

        stage('Build Docker') {
            steps {
                // Use build Dockerfile instead of Test-DB Dockerfile to build image
                sh 'cp -f docker/Dockerfile Dockerfile'
				script {
                    // Based on:
                    // - https://e.printstacktrace.blog/jenkins-pipeline-environment-variables-the-definitive-guide/
                    // - https://stackoverflow.com/a/16817748
                    // - https://stackoverflow.com/a/51991389
                    env.API_VERSION = sh(returnStdout: true, script: 'grep -Po \'(?<=export const VERSION = ")[^";]+\' src/version.ts').trim()
                    echo "API: ${env.API_VERSION}"
                    dockerImage = docker.build 'e-learning-by-sse/qualityplus-student-management-service'
                    docker.withRegistry('https://ghcr.io', 'github-ssejenkins') {
                        dockerImage.push("${env.API_VERSION}")
                        dockerImage.push('latest')
                    }
                }
            }
        }


        // Based on: https://medium.com/@mosheezderman/c51581cc783c
        stage('Deploy') {
            steps {
                sshagent(credentials: ['Stu-Mgmt_Demo-System']) {
                    sh """
                        # [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                        # ssh-keyscan -t rsa,dsa example.com >> ~/.ssh/known_hosts
                        ssh -i ~/.ssh/id_rsa_student_mgmt_backend elscha@${env.DEMO_SERVER} <<EOF
                            cd /staging/qualityplus-student-management-system
                            ./recreate.sh
                            exit
                        EOF"""
                }
                //findText(textFinders: [textFinder(regexp: '(- error TS\\*)|(Cannot find module.*or its corresponding type declarations\\.)', alsoCheckConsoleOutput: true, buildResult: 'FAILURE')])
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint:ci'
            }
        }

        stage('Publish Results') {
            steps {
                archiveArtifacts artifacts: '*.tar.gz'

                sleep(time:40, unit:"SECONDS")
                sh "wget ${env.API_URL}"
                archiveArtifacts artifacts: "${env.API_FILE}"
            }
        }

        stage("Trigger Downstream Projects") {
            steps {
                build job: 'Teaching_StuMgmtDocker', wait: false
                build job: 'Teaching_StudentMgmt-Backend-API-Gen', wait: false
            }
        }

        stage('Trigger API Client') {
            // Execute this step only if Version number was changed
            // Based on: https://stackoverflow.com/a/57823724
            when { changeset "src/version.ts"}
            steps {
                build job: 'Teaching_StudentMgmt-API-Client', parameters: [string(name: 'API', value:'STU-MGMT')], wait: false
            }
        }
    }
}