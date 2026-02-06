# Firebase Storage Security Rules Setup

## Problem
Users are getting `storage/unauthorized` errors when trying to upload files. This is because Firebase Storage security rules are not configured or are too restrictive.

## Solution
Configure Firebase Storage security rules to allow authenticated users to upload files to their own folder.

## Steps to Fix

### 1. Go to Firebase Console
1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `velora-9e54d`
3. Go to **Storage** in the left sidebar
4. Click on the **Rules** tab

### 2. Update Storage Rules
Copy and paste the following rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the file path
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users can only access files in their own folder
    match /users/{userId}/{fileName=**} {
      // Allow read/write if user owns the folder
      allow read, write: if isOwner(userId);
      
      // Allow create if user is authenticated and owns the folder
      allow create: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

### 3. Publish Rules
1. Click **Publish** button
2. Rules will be deployed immediately

## How It Works

- **Path Structure**: Files are stored at `users/{userId}/{filename}`
- **Security**: Users can only read/write files in their own `users/{userId}/` folder
- **Authentication**: Only authenticated users can upload files
- **Isolation**: Users cannot access other users' files

## Testing

After updating the rules:
1. Try uploading a file again
2. The upload should succeed
3. Check the browser console - no more `storage/unauthorized` errors

## Alternative: Deploy via Firebase CLI

If you have Firebase CLI installed, you can also deploy the rules file:

```bash
firebase deploy --only storage
```

Make sure you have a `firebase.json` file with:
```json
{
  "storage": {
    "rules": "storage.rules"
  }
}
```
