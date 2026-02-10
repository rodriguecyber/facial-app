pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/rodriguecyber/facial-app.git']])
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'PSWD', usernameVariable: 'UNAME')]) {
                    sh 'docker build -t $UNAME/my-facial-recognition-app .'
                    sh 'echo $PSWD | docker login -u $UNAME --password-stdin'
                    sh 'docker push $UNAME/my-facial-recognition-app'
                }
            }
        }
        // cd pipelines
        stage('ssh into target sever') {
            steps {
                sshagent(['ec2-ssh']) {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'PSWD', usernameVariable: 'UNAME')]) {
                     
                        sh """
                      
                     ssh -o StrictHostKeyChecking=no  ubuntu@'${EC2_PUBLIC_IP}' "
                    echo '${PSWD}' | docker login -u '${UNAME}' --password-stdin
                    docker pull ${UNAME}/my-facial-recognition-app
                    docker stop my-app || true
                    docker rm my-app || true
                    docker run -d --name my-app -p 3008:4000 ${UNAME}/my-facial-recognition-app
                "
                """
                    }}
                }
            }
        }
    }
