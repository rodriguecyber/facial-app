pipeline {
    agent any

    stages {
        stage('install dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
            
        }
        
        stage('Test') {
            steps {
                echo 'Running Tests...'
                sh 'npm test'
            }
        } 
       stage('Build') {
            steps {
                echo 'Building the docker image...'
                sh 'docker build -t rwigaara/my-facial-recognition-app  .'

            }
            steps {
               withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
             echo 'Logging in to Docker Hub...'
                    sh "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD"
      
}
            }
            steps {
                echo 'Pushing the docker image to Docker Hub...'
                sh 'docker push rwigaara/my-facial-recognition-app'
            }
        }
    
    }

} 