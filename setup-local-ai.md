# Local AI Setup Guide

This project has been configured to use Ollama (local open-source AI) instead of Google Gemini.

## Prerequisites

1. **Install Ollama**
   ```bash
   # On Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # On macOS
   brew install ollama
   
   # Or download from: https://ollama.com/download
   ```

2. **Start Ollama Service**
   ```bash
   ollama serve
   ```

3. **Pull a Model** (in a new terminal)
   ```bash
   # Recommended: Llama 3.2 (3B parameters - good balance of speed/quality)
   ollama pull llama3.2
   
   # Alternative options:
   # ollama pull llama3.2:1b    # Faster, smaller model
   # ollama pull llama3.1:8b    # Larger, more capable model
   # ollama pull codellama       # Specialized for code tasks
   ```

## Running the Application

1. **Start Ollama** (if not already running)
   ```bash
   ollama serve
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:5173`

## Configuration

The application is configured via `.env.local`:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Model Options

- `llama3.2` - Default, good balance (3B parameters)
- `llama3.2:1b` - Faster, smaller model (1B parameters)
- `llama3.1:8b` - More capable, slower (8B parameters)
- `codellama` - Specialized for code analysis
- `mistral` - Alternative general-purpose model

## Features Supported

All AI features from the original Gemini integration are supported:

- ✅ Risk Analysis & Insights
- ✅ Board Report Generation
- ✅ Regulatory Impact Assessment
- ✅ Action Risk Prediction
- ✅ Policy Document Analysis
- ✅ Asset Health Monitoring
- ✅ Vulnerability Analysis
- ✅ Incident Analysis
- ✅ Audit Response Drafting
- ✅ Document Management
- ✅ Bulk Data Ingestion

## Troubleshooting

### Ollama Not Running
```
Error: Ollama is not running. Please start Ollama service first.
```
**Solution:** Run `ollama serve` in a terminal

### Model Not Found
```
Error: model 'llama3.2' not found
```
**Solution:** Pull the model with `ollama pull llama3.2`

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```
**Solution:** Ensure Ollama is running on port 11434

### Slow Performance
- Try a smaller model: `ollama pull llama3.2:1b`
- Update OLLAMA_MODEL in `.env.local`
- Ensure sufficient RAM (8GB+ recommended)

## Performance Notes

- **RAM Usage:** Models require 2-8GB RAM depending on size
- **CPU:** Modern multi-core CPU recommended
- **GPU:** Optional but significantly improves performance
- **Response Time:** 2-10 seconds depending on model and hardware

## Privacy Benefits

- ✅ All data stays on your machine
- ✅ No API keys or external services required
- ✅ No data sent to third parties
- ✅ Full offline capability
- ✅ Complete control over AI model and data