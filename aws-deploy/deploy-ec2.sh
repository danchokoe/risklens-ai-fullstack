#!/bin/bash

echo "🚀 Deploying RiskLens AI to AWS EC2"
echo "=================================="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/danchokoe/risklens-ai-fullstack.git
cd risklens-ai-fullstack

# Set up environment
cp aws-deploy/.env.production .env
cp aws-deploy/.env.production server/.env

# Build and start services
docker-compose -f aws-deploy/docker-compose.yml up -d

# Wait for Ollama to start
echo "⏳ Waiting for Ollama to start..."
sleep 30

# Download AI model
docker-compose -f aws-deploy/docker-compose.yml exec ollama ollama pull llama3.2

echo "✅ Deployment complete!"
echo "🌐 Access your application at: http://$(curl -s http://checkip.amazonaws.com)"
echo "🔐 Login: admin@risklens.ai / admin123"