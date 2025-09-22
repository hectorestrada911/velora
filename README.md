# Velora AI - Personal Knowledge Engine

**Never lose a thought with Velora AI** - Your intelligent AI assistant that remembers everything so you can focus on what matters most.

A sophisticated AI-powered personal knowledge management system that combines voice-first interaction, intelligent document analysis, and seamless Google Workspace integration to create your personal second brain.

## 🧠 What is Velora AI?

Velora AI is your **Personal Knowledge Engine** - an AI assistant that:
- **Remembers everything** you tell it, creating a persistent memory bank
- **Analyzes your documents** and emails to extract insights and action items
- **Integrates with Google Workspace** to understand your calendar, emails, and documents
- **Provides intelligent responses** tailored to your personal context and history
- **Works across all your devices** with a beautiful, responsive interface

## 🏗️ Project Structure

This project is organized into two main parts:

```
Velora/
├── frontend/          # Next.js frontend application
├── backend/           # API routes and backend logic
└── README.md          # This file
```

## 🚀 Quick Start

### Frontend (Vercel Deployment Ready)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Backend (API Routes)
```bash
cd backend
npm install
npm run dev
```
API routes available at `/api/*`

## ✨ Core Features

### 🧠 **AI-Powered Memory Bank**
- **Persistent Memory**: Velora AI remembers your preferences, important details, and context across conversations
- **Smart Categorization**: Automatically organizes memories into Personal, Work, and Life categories
- **Intelligent Recall**: Ask questions about your past conversations and get relevant information instantly

### 📧 **Google Workspace Integration**
- **Gmail Analysis**: Automatically extracts tasks, deadlines, and important information from your emails
- **Calendar Intelligence**: Understands your schedule and provides context-aware responses
- **Document Analysis**: Analyzes Google Docs, Sheets, and PDFs to extract key insights
- **Seamless Connection**: One-click integration with your Google account

### 🎤 **Voice-First Interface**
- **High-Quality Transcription**: Powered by advanced speech-to-text technology
- **Natural Conversations**: Speak naturally and get intelligent responses
- **Voice Commands**: Control Velora AI with voice commands for hands-free operation

### 📄 **Document Intelligence**
- **PDF Analysis**: Upload and analyze PDFs to extract contacts, action items, and key information
- **Smart Suggestions**: Get memory suggestions based on document content
- **Cross-Reference**: Connect related documents and information automatically

### 💬 **Intelligent Chat Interface**
- **Context-Aware Responses**: AI understands your personal context and history
- **Proactive Suggestions**: Get helpful suggestions based on your current situation
- **Beautiful UI**: Modern, responsive design that works on all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Firebase** - Authentication, database, and file storage

### Backend & AI
- **OpenAI GPT-5** - Advanced AI for intelligent responses and analysis
- **Google APIs** - Gmail, Calendar, Drive, and Docs integration
- **Firebase Firestore** - Real-time database for conversations and memories
- **Firebase Storage** - File storage for documents and audio

### Integrations
- **Google OAuth 2.0** - Secure Google Workspace connection
- **Gmail API** - Email analysis and task extraction
- **Google Calendar API** - Calendar event management
- **Google Drive API** - Document access and analysis

## 📁 Directory Details

### Frontend (`/frontend`)
Complete Next.js application with:
- **Chat Interface** - Main AI conversation interface
- **Memory Dashboard** - View and manage your personal memory bank
- **Google Workspace Integration** - Connect and manage Google services
- **Document Management** - Upload and analyze documents
- **Voice Interface** - Voice recording and transcription
- **Responsive Design** - Mobile-first, works on all devices

### Backend (`/backend`)
API routes and backend logic:
- **`/api/analyze`** - Main AI analysis endpoint with full context
- **`/api/google/*`** - Google Workspace integration endpoints
- **`/api/pdf-analyze`** - Document analysis and processing
- **Authentication** - User management and security

## 🚀 Deployment

### Frontend to Vercel
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Configure environment variables
4. Deploy automatically on push to main branch

### Backend Options
- Deploy as separate Vercel project
- Deploy to Railway, Render, or other platforms
- Integrate with frontend deployment

## 🔧 Development

Each folder has its own `package.json` and dependencies. Work in the appropriate directory for your changes:

- **UI/UX changes** → `frontend/`
- **API/Backend changes** → `backend/`

## 📝 Environment Variables

Copy `env.example` to `.env.local` in each directory and fill in your API keys:

### Frontend Environment Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Backend Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for GPT-5
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase service account JSON

## 🎯 Use Cases

### For Knowledge Workers
- **Email Management**: Extract action items and deadlines from emails
- **Document Analysis**: Quickly understand and summarize long documents
- **Meeting Preparation**: Get context about upcoming meetings and related documents
- **Task Organization**: Automatically categorize and prioritize tasks

### For Students
- **Research Organization**: Keep track of research papers and key insights
- **Study Notes**: Create and organize study materials with AI assistance
- **Assignment Management**: Track deadlines and requirements across courses
- **Knowledge Retention**: Build a personal knowledge base for long-term learning

### For Entrepreneurs
- **Client Management**: Track client preferences and project details
- **Business Intelligence**: Analyze business documents and extract insights
- **Schedule Optimization**: Understand calendar patterns and optimize time
- **Decision Support**: Get AI-powered insights based on your business context

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in the appropriate directory
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ for productivity enthusiasts who want to never lose a thought again.**