# RiskLens AI - Full-Stack Deployment Guide

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Local AI      │
│   React/Vite    │◄──►│   Node.js       │◄──►│   Ollama        │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 11434   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Database      │
                       │   SQLite        │
                       │   Local File    │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Ollama (for AI features)

### One-Command Setup
```bash
./start-local.sh
```

This script will:
1. Install Ollama if needed
2. Download AI model (llama3.2)
3. Install all dependencies
4. Initialize database with sample data
5. Start all services

## 📋 Manual Setup

### 1. Install Ollama
```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Or download from: https://ollama.com/download
```

### 2. Start Ollama & Download Model
```bash
# Start Ollama service
ollama serve

# In another terminal, download model
ollama pull llama3.2
```

### 3. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install && cd ..
```

### 4. Initialize Database
```bash
cd server
npm run init-db
npm run seed-db
cd ..
```

### 5. Start Services

**Option A: Start both services together**
```bash
npm run start:full
```

**Option B: Start services separately**
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend  
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Ollama**: http://localhost:11434

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@risklens.ai | admin123 |
| CRO | john.smith@company.com | password123 |
| Risk Manager | sarah.johnson@company.com | password123 |
| Compliance Officer | mike.chen@company.com | password123 |

## 🗄️ Database Schema

The SQLite database includes:
- **Users**: Authentication and role management
- **Risks**: Risk register with scoring
- **Policies**: Policy management and compliance
- **Assets**: Digital asset inventory
- **Vulnerabilities**: Security vulnerability tracking
- **Audits**: Audit findings and responses
- **Incidents**: Incident management
- **Actions**: Action item tracking
- **Documents**: Document lifecycle management
- **AI Audit Logs**: AI interaction logging

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
REACT_APP_API_URL=http://localhost:3001/api
```

**Backend (server/.env)**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### AI Model Options

| Model | Size | RAM | Speed | Quality |
|-------|------|-----|-------|---------|
| llama3.2:1b | 1B | 2GB | Fast | Good |
| llama3.2 | 3B | 4GB | Medium | Better |
| llama3.1:8b | 8B | 8GB | Slower | Best |
| codellama | 7B | 8GB | Medium | Code-focused |

Change model:
```bash
ollama pull llama3.1:8b
# Update OLLAMA_MODEL in .env files
```

## 🧪 Testing

### Health Checks
```bash
# Check AI service
npm run check-ai

# Check backend API
curl http://localhost:3001/health

# Check AI integration
curl http://localhost:3001/api/ai/health
```

### Database Operations
```bash
cd server

# Reset database
rm database/risklens.db
npm run init-db
npm run seed-db

# View database
sqlite3 database/risklens.db ".tables"
```

## 🚢 Production Deployment

### 1. Build Frontend
```bash
npm run build
```

### 2. Environment Setup
```bash
# Update environment variables
NODE_ENV=production
JWT_SECRET=your-production-secret-key
```

### 3. Process Management
```bash
# Use PM2 for production
npm install -g pm2

# Start backend
cd server && pm2 start server.js --name risklens-api

# Serve frontend (nginx recommended)
# Point nginx to ./dist folder
```

### 4. Database Backup
```bash
# Backup SQLite database
cp server/database/risklens.db backups/risklens-$(date +%Y%m%d).db
```

## 🔍 Troubleshooting

### Common Issues

**Ollama Not Running**
```
Error: Ollama is not running
Solution: ollama serve
```

**Model Not Found**
```
Error: model 'llama3.2' not found
Solution: ollama pull llama3.2
```

**Port Already in Use**
```
Error: EADDRINUSE :::3000
Solution: Kill process or change port
lsof -ti:3000 | xargs kill -9
```

**Database Locked**
```
Error: database is locked
Solution: Close all connections and restart
```

### Performance Optimization

**Frontend**
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting

**Backend**
- Add Redis for session storage
- Implement connection pooling
- Add request caching

**AI Performance**
- Use GPU acceleration if available
- Optimize model size for hardware
- Implement response caching

## 📊 Monitoring

### Logs
```bash
# Backend logs
cd server && npm run dev

# Frontend logs
npm run dev

# Ollama logs
ollama logs
```

### Metrics
- API response times
- Database query performance
- AI model response times
- Memory usage
- Disk space (database growth)

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default JWT secret
- [ ] Update default passwords
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Regular database backups
- [ ] Monitor AI audit logs
- [ ] Implement proper logging

### Data Privacy
- All AI processing happens locally
- No data sent to external services
- Complete offline capability
- Encrypted database storage (optional)

## 📈 Scaling

### Horizontal Scaling
- Load balancer for multiple backend instances
- Database clustering (PostgreSQL migration)
- Distributed AI processing

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use faster AI models

## 🆘 Support

### Documentation
- [Setup Guide](setup-local-ai.md)
- [API Documentation](server/routes/)
- [Migration Summary](MIGRATION_SUMMARY.md)

### Health Monitoring
```bash
# Full system health check
./start-local.sh --health-check
```