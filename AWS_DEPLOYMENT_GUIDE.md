# AWS Deployment Guide: Next-Gen AI Student Management System

This guide outlines how to take the locally developed React + Flask (Python) stack and deploy it to a production-ready AWS environment.

## 1. Architecture Overview

### Frontend (React.js) -> AWS S3 + CloudFront
The React frontend is a static Single Page Application (SPA).
1. Run `npm run build` locally to generate the `/dist` folder.
2. Upload the contents of `/dist` to an **AWS S3 Bucket** configured for static website hosting.
3. Put an **AWS CloudFront Distribution** in front of the S3 bucket to provide CDN caching, HTTPS (via AWS Certificate Manager), and low latency globally.

### Backend (Flask REST API) -> AWS Elastic Beanstalk / ECS
The Python backend handles the core logic, database communication, and AI heuristics.
1. Dockerize the backend using a standard `python:3.11-slim` Dockerfile.
2. Deploy the container using **AWS Elastic Container Service (ECS)** with AWS Fargate (serverless containers), or use **AWS Elastic Beanstalk** for a simpler PaaS deployment.
3. Place an **Application Load Balancer (ALB)** in front of the backend instances to handle traffic and SSL termination.

### Database -> Amazon RDS (PostgreSQL)
The local SQLite database must be migrated to a robust, scalable PostgreSQL database for production.
1. Provision an **Amazon RDS** instance running PostgreSQL.
2. Ensure the RDS instance is placed in private subnets, accessible only by the Backend ECS/Elastic Beanstalk instances.
3. Update the `SQLALCHEMY_DATABASE_URL` environment variable in the backend to point to the RDS connection string.

## 2. CI/CD Pipeline (GitHub Actions -> AWS)

To automate deployments:
1. **Frontend Workflow**: On push to `main`, run `npm run build`, use the `aws-actions/configure-aws-credentials` action, and run `aws s3 sync ./dist s3://your-bucket-name`. Finally, invalidate the CloudFront cache.
2. **Backend Workflow**: On push to `main`, build the Docker image, push it to **Amazon Elastic Container Registry (ECR)**, and trigger an ECS service update to pull the new image.

## 3. Security Considerations
- **JWT Secrets**: Never hardcode the `SECRET_KEY`. Use **AWS Secrets Manager** to inject the secret into the backend environment variables.
- **CORS**: Update `app.py` CORS settings to only allow the domain of your CloudFront distribution (e.g., `https://smartuni.com`), rejecting all other origins.
- **VPC Configuration**: Ensure your database is in a private subnet. The backend should be in a private subnet with a NAT Gateway if it needs outbound internet access, and the ALB should sit in the public subnet.
