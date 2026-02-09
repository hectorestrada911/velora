# Google OAuth Setup Checklist

## 🚨 CRITICAL: You need to verify these settings in Google Cloud Console

### 1. **Google Cloud Console Setup**

Go to: https://console.cloud.google.com/

#### A. Create/Select Project
- [ ] Create a new project or select existing one
- [ ] Note your Project ID

#### B. Enable Required APIs
Go to "APIs & Services" > "Library" and enable:
- [ ] **Gmail API**
- [ ] **Google Calendar API** 
- [ ] **Google Drive API**

#### C. Create OAuth 2.0 Credentials
Go to "APIs & Services" > "Credentials":
- [ ] Click "Create Credentials" > "OAuth 2.0 Client IDs"
- [ ] Choose "Web application"
- [ ] **CRITICAL**: Add these EXACT redirect URIs:
  ```
  https://velora-production.up.railway.app/api/google/callback
  https://velora-beta-one.vercel.app/api/google/callback
  ```
- [ ] Save and copy your Client ID and Client Secret

#### D. OAuth Consent Screen
Go to "APIs & Services" > "OAuth consent screen":
- [ ] Choose "External" user type
- [ ] Fill required fields:
  - App name: `Velora AI`
  - User support email: Your email
  - Developer contact: Your email
- [ ] Add these scopes:
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/drive.readonly`
- [ ] Save and publish (if needed)

### 2. **Environment Variables**

#### Backend (Railway)
Set these in your Railway backend environment:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
APP_URL=https://velora-production.up.railway.app
```

#### Frontend (Vercel)
Set these in your Vercel frontend environment:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_APP_URL=https://velora-beta-one.vercel.app
```

### 3. **Common Issues & Solutions**

#### Issue: "500 Server Error" from Google
**Cause**: Wrong redirect URI in Google Cloud Console
**Solution**: Make sure redirect URI is exactly:
```
https://velora-production.up.railway.app/api/google/callback
```

#### Issue: "Invalid client" error
**Cause**: Client ID/Secret mismatch
**Solution**: Double-check environment variables match Google Cloud Console

#### Issue: "Access blocked" error
**Cause**: OAuth consent screen not configured
**Solution**: Complete OAuth consent screen setup

#### Issue: "Redirect URI mismatch"
**Cause**: URI in code doesn't match Google Console
**Solution**: Update Google Console with correct URI

### 4. **Testing Steps**

1. [ ] Verify environment variables are set in Railway/Vercel
2. [ ] Test OAuth URL generation: `https://velora-production.up.railway.app/api/google/auth`
3. [ ] Check browser console for any error messages
4. [ ] Try the connection flow step by step

### 5. **Debug Information**

If still getting errors, check:
- [ ] Railway logs for backend errors
- [ ] Vercel logs for frontend errors  
- [ ] Browser console for client-side errors
- [ ] Google Cloud Console for API quotas/limits

## 🔧 Quick Fix Commands

If you need to update environment variables:

**Railway Backend:**
```bash
railway variables set GOOGLE_CLIENT_ID=your_client_id
railway variables set GOOGLE_CLIENT_SECRET=your_client_secret
railway variables set APP_URL=https://velora-production.up.railway.app
```

**Vercel Frontend:**
```bash
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
vercel env add NEXT_PUBLIC_APP_URL
```

## 📞 Need Help?

The most common issue is the redirect URI mismatch. Make sure:
1. Google Cloud Console has: `https://velora-production.up.railway.app/api/google/callback`
2. Backend environment has: `APP_URL=https://velora-production.up.railway.app`
3. Both match exactly (no trailing slashes, correct protocol)
