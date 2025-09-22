# Velora Backend API

This is the backend API for the Velora voice-first productivity app.

## API Routes

- `/api/transcribe` - Audio transcription using OpenAI Whisper
- `/api/parse` - Natural language understanding for reminders and tags
- `/api/stripe/checkout` - Stripe payment processing

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp env.example .env.local
   # Fill in your API keys
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for Whisper
- `FIREBASE_*` - Firebase configuration
- `STRIPE_SECRET_KEY` - Stripe secret key
- `RESEND_API_KEY` - Resend email service key
# Google Workspace Integration - Sun Sep 21 19:26:33 PDT 2025
