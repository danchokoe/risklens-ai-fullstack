#!/bin/bash

echo "🚀 Starting RiskLens AI Full-Stack Application"
echo "=============================================="

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first:"
    echo "   curl -fsSL https://ollama.com/install.sh | sh"
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🔄 Starting Ollama service..."
    ollama serve &
    OLLAMA_PID=$!
    
    # Wait for Ollama to start
    echo "⏳ Waiting for Ollama to start..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "✅ Ollama is running!"
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "❌ Failed to start Ollama"
        exit 1
    fi
else
    echo "✅ Ollama is already running"
fi

# Check if model exists
MODEL_NAME=${OLLAMA_MODEL:-llama3.2}
if ! ollama list | grep -q "$MODEL_NAME"; then
    echo "📥 Downloading model: $MODEL_NAME"
    echo "   This may take a few minutes..."
    ollama pull "$MODEL_NAME"
    
    if [ $? -eq 0 ]; then
        echo "✅ Model downloaded successfully!"
    else
        echo "❌ Failed to download model"
        exit 1
    fi
else
    echo "✅ Model $MODEL_NAME is available"
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Initialize database if it doesn't exist
if [ ! -f "server/database/risklens.db" ]; then
    echo "🗄️ Initializing database..."
    cd server && npm run init-db && npm run seed-db && cd ..
    echo "✅ Database initialized with sample data"
    echo "   Login: admin@risklens.ai / admin123"
fi

echo ""
echo "🎯 Starting full-stack application..."
echo "   Backend API: http://localhost:3001"
echo "   Frontend:    http://localhost:3000"
echo "   Local AI:    http://localhost:11434"
echo ""
echo "Press Ctrl+C to stop all services"

# Start both frontend and backend
npm run start:full