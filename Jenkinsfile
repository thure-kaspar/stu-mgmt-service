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
                git 'https://github.com/thure-kaspar/stu-mgmt-service.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            environment {
                POSTGRES_DB = 'StudentMgmtDb'
                POSTGRES_USER = 'postgres'
                POSTGRES_PASSWORD = 'admin'
                PORT = '5432'
            }
            steps {
                script {
                    // Sidecar Pattern: https://www.jenkins.io/doc/book/pipeline/docker/#running-sidecar-containers
                    docker.image('postgres:14.1-alpine').withRun("-e POSTGRES_USER=${env.POSTGRES_USER} -e POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD} -e POSTGRES_DB=${env.POSTGRES_DB} -p ${env.PORT}:${env.PORT}") { c ->
                        sh 'npm run test:jenkins'
                    }
                }
                step([
                    $class: 'CloverPublisher',
                    cloverReportDir: 'output/test/coverage/',
                    cloverReportFileName: 'clover.xml',
                    healthyTarget: [methodCoverage: 70, conditionalCoverage: 80, statementCoverage: 80],   // optional, default is: method=70, conditional=80, statement=80
                    unhealthyTarget: [methodCoverage: 50, conditionalCoverage: 50, statementCoverage: 50], // optional, default is none
                    failingTarget: [methodCoverage: 0, conditionalCoverage: 0, statementCoverage: 0]       // optional, default is none
                ])
            }
            post {
                always {
                    junit 'output/**/junit*.xml'
               }
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
    }
}
