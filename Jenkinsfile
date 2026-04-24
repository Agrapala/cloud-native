pipeline {
  agent any

  environment {
    AWS_REGION = "ap-south-1"
    ECR_URL = "632813643911.dkr.ecr.ap-south-1.amazonaws.com"
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Agrapala/cloud-native.git'
      }
    }

    stage('Build Images') {
      steps {
        sh '''
        docker build -t backend ./backend
        docker build -t worker ./worker
        docker build -t frontend ./frontend
        '''
      }
    }

    stage('Login to ECR') {
  steps {
    withCredentials([
      string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'),
      string(credentialsId: 'AWS_SECRET_KEYS', variable: 'AWS_SECRET_ACCESS_KEY')
    ]) {
      sh '''
      export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
      export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
      export AWS_DEFAULT_REGION=ap-south-1

      aws ecr get-login-password --region ap-south-1 | \
      docker login --username AWS --password-stdin 632813643911.dkr.ecr.ap-south-1.amazonaws.com
      aws eks update-kubeconfig --region ap-south-1 --name devops-project
      '''
    }
  }
}

    stage('Tag Images') {
      steps {
        sh '''
        docker tag backend:latest $ECR_URL/backend:latest
        docker tag worker:latest $ECR_URL/worker:latest
        docker tag frontend:latest $ECR_URL/frontend:latest
        '''
      }
    }

    stage('Push Images') {
      steps {
        sh '''
        docker push $ECR_URL/backend:latest
        docker push $ECR_URL/worker:latest
        docker push $ECR_URL/frontend:latest
        '''
      }
    }

    stage('Deploy to EKS') {
      steps {
        withCredentials([
          string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'AWS_SECRET_KEYS', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
          sh '''
          export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
          export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
          export AWS_DEFAULT_REGION=ap-south-1

          # Configure kubeconfig
          aws eks update-kubeconfig --region ap-south-1 --name devops-project

          # Deploy
          kubectl apply -f k8s/

          # Restart pods to pull latest image
          kubectl rollout restart deployment backend
          kubectl rollout restart deployment frontend
          kubectl rollout restart deployment worker
          '''
        }
      }
    }
  }
}