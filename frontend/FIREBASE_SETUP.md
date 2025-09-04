# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "Velora"
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save

## 3. Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Done

## 4. Get Firebase Config

1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (</>)
4. Register app with name "Velora Web"
5. Copy the config object

## 5. Set Environment Variables

Create `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 6. Firestore Security Rules

In Firebase Console, go to "Firestore Database" > "Rules" and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection
    match /events/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Reminders collection
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 7. Test the Setup

1. Run the app: `npm run dev`
2. Go to `/auth` page
3. Create an account
4. Try adding events and reminders
5. Check Firebase Console to see data being saved

## Features Now Available

✅ **User Authentication** - Sign up, sign in, sign out
✅ **Persistent Data** - Events and reminders saved to Firestore
✅ **Real-time Sync** - Data syncs across devices
✅ **User Isolation** - Each user only sees their own data
✅ **Secure** - Firestore rules protect user data

## Next Steps

- Add real-time listeners for live updates
- Implement data migration from local storage
- Add user profile management
- Set up production Firestore rules
