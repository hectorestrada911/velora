# Railway Deployment Not Showing Up - Fix

## Problem
- Vercel sees new deployments ✅
- Railway doesn't show new deployments ❌
- Shows "4 months ago" instead of recent deployments

## Root Cause
Railway is building from the **repo root**, but the Dockerfile is in the `backend/` directory and expects to be run from there. This causes:
1. Railway can't find the Dockerfile (it's looking in root)
2. Or Railway finds it but build context is wrong
3. Builds fail silently or don't trigger

## Solution

### Option 1: Update Dockerfile for Monorepo (RECOMMENDED)
Updated Dockerfile to work from repo root:
```dockerfile
FROM node:22-alpine
WORKDIR /app
# Copy backend package files
COPY backend/package*.json ./
# Install dependencies
RUN npm ci
# Copy backend source code
COPY backend/ .
# Build and start
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 2: Configure Railway Root Directory
In Railway dashboard:
1. Go to Settings → Source
2. Set **Root Directory** to `backend/`
3. Save

### Option 3: Move Dockerfile to Root
Move `backend/Dockerfile` to root and update paths

## Why Vercel Works But Railway Doesn't

**Vercel:**
- Configured to watch `frontend/` directory
- Has explicit root directory setting
- Auto-detects Next.js in subdirectory

**Railway:**
- Defaults to repo root
- Looks for Dockerfile in root
- Doesn't auto-detect subdirectory structure

## Verification Steps

After fixing:
1. Push commits to GitHub
2. Check Railway dashboard → Should see new deployment starting
3. Check build logs → Should show successful build
4. Deployment should show "updated a couple mins ago"

## Files Changed
- `backend/Dockerfile` - Updated to work from repo root
