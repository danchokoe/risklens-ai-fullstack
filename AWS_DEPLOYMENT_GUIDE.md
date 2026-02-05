# 🚀 AWS Deployment Guide for RiskLens AI

## 🚨 Current Issue Resolution

Your current deployment at https://main.d1d0157ro1m0ox.amplifyapp.com/ shows a login error because:

1. ✅ **Frontend deployed** on AWS Amplify
2. ❌ **Backend API missing** (not deployed)
3. ❌ **Database missing** (SQLite not available)
4. ❌ **AI service missing** (Ollama not running)

## 🔧 Quick Fix - Demo Mode (Immediate Solution)

I've updated the application to work in **demo mode** when the backend is not available:

### Step 1: Update Your Amplify Deployment

```bash
# Commit the new changes with mock backend
git add .
git commit -m "Add demo mode with mock backend for AWS Amplify deployment"
git push origin main
```

Your Amplify deployment will automatically update and the login should now work with:
- **Email**: admin@risklens.ai
- **Password**: admin123

### Step 2: Verify Demo Mode

The application will now:
- ✅ Show "Demo Mode" indicators
- ✅ Allow login with mock authentication
- ✅ Display sample GRC data
- ✅ Simulate AI responses
- ⚠️ Data won't persist (no real database)

## 🏗️ Full Production Deployment Options

### Option 1: AWS ECS Fargate (Recommended for Production)

**Cost**: ~$50-100/month
**Features**: Auto-scaling, managed infrastructure, full AI capabilities

```bash
# 1. Build and push Docker images
docker build -t risklens-backend ./server
docker build -t risklens-frontend -f aws-deploy/Dockerfile.frontend .

# 2. Push to ECR
aws ecr create-repository --repository-name risklens-backend
aws ecr create-repository --repository-name risklens-frontend

# 3. Deploy ECS service
aws ecs create-service --cli-input-json file://aws-deploy/ecs-task-definition.json
```

### Option 2: AWS EC2 Instance (Full Control)

**Cost**: ~$20-50/month
**Features**: Complete control, full AI processing, persistent storage

```bash
# 1. Launch EC2 instance (t3.large or larger for AI)
# 2. SSH into instance
# 3. Run deployment script
curl -sSL https://raw.githubusercontent.com/danchokoe/risklens-ai-fullstack/main/aws-deploy/deploy-ec2.sh | bash
```

### Option 3: AWS App Runner (Simplest)

**Cost**: ~$30-60/month
**Features**: Managed deployment, auto-scaling, container-based

```bash
# 1. Create apprunner.yaml
# 2. Connect to GitHub
# 3. Deploy automatically
```

### Option 4: AWS Lambda + RDS (Serverless)

**Cost**: ~$10-30/month
**Features**: Pay-per-use, managed database, no AI (would need external service)

## 🎯 Recommended Deployment Strategy

### For Demo/Testing: Current Amplify + Demo Mode ✅
- **Cost**: Free
- **Setup**: Already done
- **Features**: Frontend demo with mock data
- **Limitations**: No data persistence, simulated AI

### For Production: ECS Fargate + RDS + EFS
- **Cost**: ~$80-150/month
- **Setup**: 2-3 hours
- **Features**: Full functionality, scalable, managed
- **Benefits**: Production-ready, auto-scaling, secure

## 📋 Step-by-Step Production Deployment

### Prerequisites
```bash
# Install AWS CLI
aws configure

# Install Docker
docker --version

# Clone repository
git clone https://github.com/danchokoe/risklens-ai-fullstack.git
cd risklens-ai-fullstack
```

### Step 1: Create AWS Resources

```bash
# Create VPC and subnets
aws cloudformation create-stack \
  --stack-name risklens-infrastructure \
  --template-body file://aws-deploy/infrastructure.yaml

# Create ECR repositories
aws ecr create-repository --repository-name risklens-backend
aws ecr create-repository --repository-name risklens-frontend
aws ecr create-repository --repository-name risklens-ollama
```

### Step 2: Build and Push Images

```bash
# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build images
docker build -t risklens-backend ./server
docker build -t risklens-frontend -f aws-deploy/Dockerfile.frontend .

# Tag and push
docker tag risklens-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/risklens-backend:latest
docker tag risklens-frontend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/risklens-frontend:latest

docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/risklens-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/risklens-frontend:latest
```

### Step 3: Deploy ECS Service

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name risklens-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://aws-deploy/ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster risklens-cluster \
  --service-name risklens-service \
  --task-definition risklens-ai-fullstack:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Step 4: Configure Load Balancer

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name risklens-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Create target group
aws elbv2 create-target-group \
  --name risklens-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxx \
  --target-type ip
```

## 🔒 Security Configuration

### Environment Variables
```bash
# Set in AWS Systems Manager Parameter Store
aws ssm put-parameter --name "/risklens/jwt-secret" --value "your-production-secret" --type "SecureString"
aws ssm put-parameter --name "/risklens/db-password" --value "your-db-password" --type "SecureString"
```

### Security Groups
```bash
# Frontend (port 80)
aws ec2 create-security-group --group-name risklens-frontend-sg --description "RiskLens Frontend"
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 80 --cidr 0.0.0.0/0

# Backend (port 3001)
aws ec2 create-security-group --group-name risklens-backend-sg --description "RiskLens Backend"
aws ec2 authorize-security-group-ingress --group-id sg-yyy --protocol tcp --port 3001 --source-group sg-xxx

# Ollama (port 11434)
aws ec2 create-security-group --group-name risklens-ollama-sg --description "RiskLens Ollama"
aws ec2 authorize-security-group-ingress --group-id sg-zzz --protocol tcp --port 11434 --source-group sg-yyy
```

## 📊 Monitoring & Logging

### CloudWatch Setup
```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/risklens-ai

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "RiskLens-HighCPU" \
  --alarm-description "High CPU usage" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## 💰 Cost Optimization

### Resource Sizing
- **Frontend**: t3.micro (sufficient for static content)
- **Backend**: t3.small (API server)
- **Ollama**: t3.large or larger (AI processing needs 4GB+ RAM)
- **Database**: RDS t3.micro (for small datasets)

### Cost Estimates
| Component | Instance Type | Monthly Cost |
|-----------|---------------|--------------|
| Frontend | Fargate 0.25 vCPU | $5-10 |
| Backend | Fargate 0.5 vCPU | $10-20 |
| Ollama | Fargate 2 vCPU, 8GB | $40-60 |
| RDS | t3.micro | $15-25 |
| Load Balancer | ALB | $20-25 |
| **Total** | | **$90-140/month** |

## 🚀 Quick Start Commands

### Deploy Demo Mode (Current - Free)
```bash
# Already deployed at: https://main.d1d0157ro1m0ox.amplifyapp.com/
# Login: admin@risklens.ai / admin123
```

### Deploy Full Production (ECS)
```bash
git clone https://github.com/danchokoe/risklens-ai-fullstack.git
cd risklens-ai-fullstack
./aws-deploy/deploy-production.sh
```

### Deploy Simple EC2 (Budget Option)
```bash
# Launch t3.large EC2 instance
# SSH into instance
curl -sSL https://raw.githubusercontent.com/danchokoe/risklens-ai-fullstack/main/aws-deploy/deploy-ec2.sh | bash
```

## 🆘 Troubleshooting

### Common Issues

**1. Login Still Fails**
```bash
# Check browser console for errors
# Verify Amplify deployment updated
# Clear browser cache and cookies
```

**2. Demo Mode Not Working**
```bash
# Ensure latest code is deployed
git push origin main
# Wait for Amplify auto-deployment (2-3 minutes)
```

**3. Production Deployment Issues**
```bash
# Check ECS service status
aws ecs describe-services --cluster risklens-cluster --services risklens-service

# Check logs
aws logs tail /ecs/risklens-ai --follow
```

## 📞 Support

- **GitHub Issues**: https://github.com/danchokoe/risklens-ai-fullstack/issues
- **Documentation**: See repository README.md
- **Demo Site**: https://main.d1d0157ro1m0ox.amplifyapp.com/

---

## ✅ Next Steps

1. **Immediate**: Your Amplify deployment should now work in demo mode
2. **Short-term**: Consider EC2 deployment for full functionality
3. **Long-term**: Move to ECS Fargate for production scalability

The demo mode will give you a fully functional preview of all GRC features while you decide on the production deployment strategy.