#!/bin/bash

echo "🧪 Testing RiskLens AI Full-Stack Application"
echo "============================================="

# Test 1: Check if all files exist
echo "1. Checking project structure..."
if [ -f "package.json" ] && [ -f "server/package.json" ] && [ -f "server/database/schema.sql" ]; then
    echo "   ✅ Project structure is complete"
else
    echo "   ❌ Missing critical files"
    exit 1
fi

# Test 2: Check dependencies
echo "2. Checking dependencies..."
if [ -d "node_modules" ] && [ -d "server/node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Dependencies missing - run npm install"
    exit 1
fi

# Test 3: Build frontend
echo "3. Testing frontend build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Frontend builds successfully"
else
    echo "   ❌ Frontend build failed"
    exit 1
fi

# Test 4: Test database initialization
echo "4. Testing database..."
cd server
if [ -f "database/risklens.db" ]; then
    echo "   ✅ Database exists"
else
    echo "   🔄 Initializing database..."
    npm run init-db > /dev/null 2>&1
    npm run seed-db > /dev/null 2>&1
    if [ -f "database/risklens.db" ]; then
        echo "   ✅ Database initialized successfully"
    else
        echo "   ❌ Database initialization failed"
        exit 1
    fi
fi
cd ..

# Test 5: Check Ollama (optional)
echo "5. Checking Ollama (optional)..."
if command -v ollama &> /dev/null; then
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "   ✅ Ollama is running"
    else
        echo "   ⚠️  Ollama not running (start with: ollama serve)"
    fi
else
    echo "   ⚠️  Ollama not installed (install from: https://ollama.com)"
fi

echo ""
echo "🎉 Full-stack application is ready!"
echo ""
echo "📋 Next Steps:"
echo "   1. Start Ollama: ollama serve"
echo "   2. Download model: ollama pull llama3.2"
echo "   3. Start application: ./start-local.sh"
echo ""
echo "🌐 Access Points:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend:  http://localhost:3001"
echo "   • Login:    admin@risklens.ai / admin123"
echo ""
echo "📚 Documentation:"
echo "   • Setup Guide: setup-local-ai.md"
echo "   • Deployment:  DEPLOYMENT.md"
echo "   • GitHub:      https://github.com/danchokoe/risklens-ai-fullstack"