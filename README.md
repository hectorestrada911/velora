# Velora - Voice-First Productivity App

A sophisticated voice-first productivity application with dual-input interface (voice + text), smart parsing, and beautiful dark theme.

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

## ✨ Features

- 🎤 **Voice Recording** - High-quality audio capture with transcription
- ⌨️ **Text Input** - Alternative input method for quick notes
- 🎨 **Dark Theme** - Sophisticated UI with electric blue accents
- 🧠 **Smart Parsing** - AI-powered reminder and tag extraction
- 💳 **Pricing Plans** - Freemium model with Stripe integration
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Firebase** - Authentication and database
- **Stripe** - Payment processing
- **OpenAI Whisper** - Speech-to-text transcription

## 📁 Directory Details

### Frontend (`/frontend`)
Contains the complete Next.js application ready for Vercel deployment:
- React components and pages
- Tailwind CSS styling
- TypeScript definitions
- All UI logic and state management

### Backend (`/backend`)
Contains API routes and backend logic:
- `/api/transcribe` - Audio transcription
- `/api/parse` - Natural language understanding
- `/api/stripe/checkout` - Payment processing

## 🚀 Deployment

### Frontend to Vercel
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Deploy automatically on push to main branch

### Backend Options
- Deploy as separate Vercel project
- Deploy to other platforms (Railway, Render, etc.)
- Integrate with frontend deployment

## 🔧 Development

Each folder has its own `package.json` and dependencies. Work in the appropriate directory for your changes:

- **UI/UX changes** → `frontend/`
- **API/Backend changes** → `backend/`

## 📝 Environment Variables

Copy `env.example` to `.env.local` in each directory and fill in your API keys:
- OpenAI API key for transcription
- Firebase configuration
- Stripe keys for payments
- Resend API key for emails

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in the appropriate directory
4. Submit a pull request

## 📄 License

This project is private and proprietary.
# Trigger deployment for commit d5dce43
