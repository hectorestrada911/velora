# Velora: Cursor Prompt — Build "TalkNotes"

> **Voice-First Productivity App** - Capture ideas and tasks with your voice. Get searchable notes, smart reminders, and a weekly recap—automatically.

## 🎯 Project Overview

Velora is a sophisticated voice-first productivity application that transforms how you capture and organize your thoughts. Unlike traditional voice apps that failed due to poor UX and limited functionality, Velora focuses on:

- **Comfortable Voice Experience** - One-tap recording with intelligent auto-stop
- **Smart Content Processing** - AI-powered transcription + automatic task/reminder extraction
- **Actionable Organization** - Searchable notes, smart tags, and calendar integration
- **Privacy-First Design** - Audio deleted after transcription by default

## 🚀 Key Features

### Core Functionality
- **Voice Recording** - Browser-based recording with MediaRecorder API
- **AI Transcription** - OpenAI Whisper integration for accurate speech-to-text
- **Smart Parsing** - Automatic extraction of reminders, dates, and entities
- **Search & Organization** - Full-text search with tags and filters
- **Reminder System** - Email + Web Push notifications with calendar sync

### User Experience
- **Modern UI/UX** - Sophisticated design system with smooth animations
- **Cross-Platform** - Web-first with mobile-responsive design
- **Real-time Feedback** - Live transcription status and smart suggestions
- **Export Options** - Markdown, text, and CSV export capabilities

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Next.js API routes, Node.js 18+
- **Database**: Firebase Firestore
- **Storage**: Firebase Cloud Storage
- **Authentication**: Firebase Auth
- **Payments**: Stripe Checkout
- **AI**: OpenAI Whisper API
- **Email**: Resend
- **Push Notifications**: Web Push API

### Data Models
```typescript
// Core entities
User: { uid, email, plan, settings }
Note: { id, uid, text, tags, entities, createdAt }
Reminder: { id, uid, dueAt, status, channel, summary }
Usage: { uid, monthKey, transcriptionsCount, reminderCount }
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- OpenAI API key
- Stripe account
- Resend account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd velora-cursor-prompt
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your API keys and configuration:
   ```env
   OPENAI_API_KEY=your_openai_key
   FIREBASE_PROJECT_ID=your_project_id
   STRIPE_SECRET_KEY=sk_test_...
   RESEND_API_KEY=re_...
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Download service account key
   - Update environment variables

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Firebase Security Rules
```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
        resource.data.uid == request.auth.uid;
    }
  }
}
```

### Stripe Webhooks
Configure webhooks for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 📱 Usage

### Recording Voice Notes
1. **Start Recording** - Tap the microphone button
2. **Speak Naturally** - Talk about your thoughts, tasks, or ideas
3. **Auto-Processing** - AI transcribes and extracts actionable items
4. **Review & Edit** - Edit transcription and confirm suggestions
5. **Save & Organize** - Save with tags and set reminders

### Smart Features
- **Automatic Reminder Detection** - "Call John tomorrow at 3pm" → Creates reminder
- **Entity Extraction** - People, projects, and topics automatically tagged
- **Context-Aware Suggestions** - Smart recommendations based on content
- **Search & Filter** - Find notes by content, tags, or date

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
- Parser logic for reminder extraction
- Voice recorder functionality
- API endpoint validation
- Authentication flows

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables
Ensure all required environment variables are set in production:
- API keys for external services
- Firebase configuration
- Stripe webhook secrets
- VAPID keys for push notifications

## 🔒 Security & Privacy

### Data Protection
- **Encryption**: AES-256 at rest, TLS in transit
- **Privacy**: Audio deleted after transcription (configurable)
- **Access Control**: User-specific data isolation
- **GDPR Compliance**: Data export and deletion capabilities

### Best Practices
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure authentication flows
- Regular security audits

## 📊 Analytics & Monitoring

### User Metrics
- Recording session duration
- Transcription accuracy rates
- Feature adoption rates
- User retention metrics

### Technical Monitoring
- API response times
- Error rates and types
- Database performance
- Service health checks

## 🎨 Design System

### Color Palette
- **Primary**: Sophisticated blues (#1e40af, #3b82f6)
- **Accent**: Teal/cyan (#06b6d4)
- **Neutral**: Clean grays (#f8fafc, #1e293b)

### Components
- **Buttons**: Rounded with hover states and shadows
- **Cards**: Elevated with subtle shadows and borders
- **Forms**: Clean inputs with focus states
- **Animations**: Smooth transitions and micro-interactions

## 🔮 Roadmap

### Phase 2 (Post-MVP)
- [ ] Streaming dictation with partial results
- [ ] Semantic search with embeddings
- [ ] Notion/Obsidian integration
- [ ] Mobile PWA with offline support
- [ ] Team collaboration features

### Phase 3 (Advanced Features)
- [ ] AI-powered note summarization
- [ ] Voice command interface
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Enterprise features

## 🤝 Contributing

### Development Guidelines
1. **Code Style** - Follow TypeScript and React best practices
2. **Testing** - Write tests for new features
3. **Documentation** - Update docs for API changes
4. **Code Review** - All changes require review

### Getting Help
- **Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share ideas
- **Documentation**: Check the docs first

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for Whisper API
- **Firebase** for backend infrastructure
- **Stripe** for payment processing
- **Tailwind CSS** for the design system
- **Framer Motion** for animations

---

**Built with ❤️ by the Velora team**

*Transform your voice into organized, actionable productivity.*
