pipeline {
  agent any

  environment {
    AWS_REGION = "ap-south-1"
    ECR_URL = "<your-account-id>.dkr.ecr.ap-south-1.amazonaws.com"
  }

  stages {

    stage('Checkout') {
      steps {
        git '<your-github-repo-url>'
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
        sh '''
        aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_URL
        '''
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
        sh '''
        kubectl apply -f k8s/
        '''
      }
    }

  }
}