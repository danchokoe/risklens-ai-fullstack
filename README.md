# RiskLens AI - Local AI Edition

Enterprise GRC (Governance, Risk & Compliance) platform powered by local open-source AI models.

## 🚀 Quick Start with Local AI

**Prerequisites:** Node.js and Ollama

### Option 1: Automated Setup
```bash
./start-local.sh
```

### Option 2: Manual Setup

1. **Install Ollama**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Start Ollama & Pull Model**
   ```bash
   ollama serve
   ollama pull llama3.2
   ```

3. **Install Dependencies & Run**
   ```bash
   npm install
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

Edit `.env.local` to customize:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## 📚 Documentation

- [Local AI Setup Guide](setup-local-ai.md) - Detailed setup instructions
- [Model Options](setup-local-ai.md#model-options) - Available AI models
- [Troubleshooting](setup-local-ai.md#troubleshooting) - Common issues

## ✨ Features

- **Risk Management** - AI-powered risk analysis and insights
- **Policy Intelligence** - Automated policy gap analysis
- **Audit Co-Pilot** - Smart audit response drafting
- **Asset Registry** - Health monitoring with AI recommendations
- **Regulatory Monitoring** - Impact assessment automation
- **Document Management** - AI-assisted document creation
- **Vulnerability Scanner** - Intelligent threat analysis
- **Incident Management** - Crisis analysis and response

## 🔒 Privacy First

- ✅ All AI processing happens locally
- ✅ No data sent to external services
- ✅ Complete offline capability
- ✅ Full control over your data

## 🎯 Original AI Studio Version

View the original Gemini-powered version: https://ai.studio/apps/drive/1_Pplf99vwvg4qEla31SR_vCt3pEi_Qf2
