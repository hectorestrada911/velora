# Google Workspace Integration Setup Guide

This guide will help you set up the Google Workspace integration for Velora, enabling Gmail and Google Calendar connectivity.

## Prerequisites

- A Google Cloud Platform account
- A Google Workspace domain (or personal Gmail account)
- Velora project with backend and frontend running

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Enable the following APIs:
   - **Gmail API**
   - **Google Calendar API**
   - **Google Drive API** (optional, for future file integration)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add the following authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://your-domain.com/auth/google/callback` (for production)
5. Save and download the credentials JSON file

## Step 4: Configure Environment Variables

### Backend Environment Variables

Add to your `backend/.env.local`:

```env
# Google Workspace Integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
APP_URL=http://localhost:3000
```

### Frontend Environment Variables

Add to your `frontend/.env.local`:

```env
# Google Workspace Integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: OAuth Consent Screen Configuration

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in the required fields:
   - **App name**: Velora
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/drive.readonly`
5. Add test users (for development)

## Step 6: Test the Integration

1. Start your Velora application
2. Go to the Dashboard
3. Look for the "Google Workspace Integration" section
4. Click "Connect Google Workspace"
5. Complete the OAuth flow
6. Test email analysis and calendar event creation

## Features Available

Once connected, users can:

### Email Analysis
- **Automatic task extraction** from emails
- **Deadline detection** and reminder creation
- **Meeting request parsing** and calendar integration
- **Contact information extraction**

### Calendar Integration
- **Automatic event creation** from email content
- **Smart scheduling** based on email context
- **Reminder setup** for important events

### AI-Powered Processing
- **GPT-5 analysis** of email content
- **Context-aware task creation**
- **Intelligent priority assignment**

## Security Considerations

### Data Privacy
- **Read-only access** to Gmail (cannot send or delete emails)
- **Encrypted token storage** in Firebase
- **User-controlled permissions** (can revoke access anytime)
- **No data sharing** with third parties

### Token Management
- **Secure token refresh** handling
- **Automatic token expiration** management
- **Error handling** for expired credentials

## Troubleshooting

### Common Issues

1. **"Access blocked" error**
   - Ensure OAuth consent screen is properly configured
   - Add your domain to authorized domains
   - Check if you're using a test account

2. **"Invalid redirect URI" error**
   - Verify redirect URIs in OAuth credentials
   - Ensure URLs match exactly (including http/https)

3. **"API not enabled" error**
   - Enable required APIs in Google Cloud Console
   - Wait a few minutes for changes to propagate

4. **"Insufficient permissions" error**
   - Check OAuth scopes in consent screen
   - Ensure user has granted all required permissions

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG_GOOGLE_API=true
```

## Production Deployment

### Environment Variables
Update your production environment with:
- Production redirect URIs
- Production domain URLs
- Secure token storage configuration

### Security Checklist
- [ ] OAuth consent screen published
- [ ] Production redirect URIs configured
- [ ] HTTPS enabled for all endpoints
- [ ] Token storage secured
- [ ] Rate limiting implemented

## API Rate Limits

### Gmail API
- **1 billion quota units per day**
- **250 quota units per user per 100 seconds**

### Calendar API
- **1 million quota units per day**
- **1,000 quota units per user per 100 seconds**

## Future Enhancements

Planned features for future releases:
- **Google Drive file analysis**
- **Slack integration**
- **Microsoft 365 support**
- **Advanced email categorization**
- **Team collaboration features**

## Support

For technical support or questions:
- Check the [Google APIs documentation](https://developers.google.com/gmail/api)
- Review the [OAuth 2.0 guide](https://developers.google.com/identity/protocols/oauth2)
- Contact: support@velora.com

---

**Note**: This integration requires careful handling of user data and OAuth tokens. Ensure you follow Google's API Terms of Service and implement proper security measures.
