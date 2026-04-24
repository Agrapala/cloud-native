# 🚀 Cloud-Native Course Platform – DevOps Project Documentation

## 1. 📌 Project Overview

This project demonstrates a full cloud-native microservices architecture built on AWS with DevOps best practices.

### 🎯 Objectives

* Build scalable microservices
* Implement event-driven architecture
* Use caching for performance
* Automate deployment with CI/CD

## 2. 🧱 Architecture Summary

### Core Flow

User → Frontend → Backend → SQS → Worker → RDS → SNS

### Components

* Frontend (HTML/JS)
* Backend (Node.js)
* Worker Service
* PostgreSQL Database
* Redis Cache
* AWS SQS (Queue)
* AWS SNS (Notifications)

---

## 3. 🖥️ Frontend

### Features

* Display course list
* Fetch from backend API
* Register for courses

### API Used

* GET /courses
* POST /register

---

## 4. ⚙️ Backend Service

### Responsibilities

* Serve course data
* Handle caching using Redis
* Send registration data to SQS

### Key Features

* Redis caching (TTL 10 min)
* Input validation
* Async processing via queue

---

## 5. 👷 Worker Service

### Responsibilities

* Poll messages from SQS
* Store registrations in DB
* Send notifications via SNS

### Benefits

* Decoupled architecture
* Handles traffic spikes

---

## 6. 🗄️ Database (PostgreSQL)

### Tables

#### courses

* id
* title
* description
* image_url

#### registrations

* id
* course_id
* student_name
* email

---

## 7. ⚡ Redis Cache

### Purpose

* Reduce DB load
* Improve response time

### Strategy

* Cache key: courses
* TTL: 600 seconds

---

## 8. 📬 AWS SQS

### Purpose

* Queue registration requests
* Enable asynchronous processing

---

## 9. 📣 AWS SNS

### Purpose

* Notify admin on new registration
* Email/SMS alerts

---

## 10. 🐳 Docker

### Services Containerized

* frontend
* backend
* worker
* postgres
* redis

### Tool Used

* docker-compose

---

## 11. ☸️ Kubernetes (EKS)

### Resources

* Deployments
* Services (ClusterIP, LoadBalancer)

### Benefits

* Auto scaling
* High availability

---

## 12. 🔄 CI/CD Pipeline (Jenkins)

### Flow

1. Code push
2. Jenkins builds Docker images
3. Push to ECR
4. Deploy to EKS

---

## 13. ☁️ Future Improvements

### Infrastructure

* AWS RDS (PostgreSQL)
* AWS ElastiCache (Redis)

### DevOps Enhancements

* Terraform (IaC)
* Monitoring (CloudWatch)
* Ingress Controller

---

## 14. 🎯 Key Learnings

* Microservices architecture
* Event-driven design
* Containerization with Docker
* Kubernetes deployment
* CI/CD pipeline automation

---

## 15. 📌 Conclusion

This project demonstrates a production-ready DevOps workflow integrating AWS services, containerization, and automation. It showcases scalability, performance optimization, and modern cloud architecture design.
