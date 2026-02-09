# Railway Setup Instructions

## Problem
Railway can't find `backend/` directory when building from repo root. The build fails with:
```
ERROR: "/backend": not found
```

## Solution: Configure Railway Root Directory

You need to configure Railway to use `backend/` as the root directory in the Railway dashboard.

### Steps:

1. **Go to Railway Dashboard**
   - Navigate to your `velora` project
   - Click on **Settings** tab

2. **Set Root Directory**
   - Scroll down to **"Source"** section
   - Find **"Root Directory"** setting
   - Change it from `.` (root) to `backend`
   - Click **Save**

3. **Verify Configuration**
   - Railway should now:
     - Use `backend/` as the build root
     - Find `backend/Dockerfile` automatically
     - Have all backend files in build context

4. **Alternative: Use Root Dockerfile**
   - If you prefer to keep root directory as `.`
   - Make sure `.railwayignore` doesn't exclude `backend/`
   - Railway will use root `Dockerfile` and copy `backend/` files

## Why This Happens

Railway builds from the repo root by default. When the Dockerfile tries to `COPY backend/`, Railway's build context might not include it if:
- `.railwayignore` excludes it (we fixed this)
- Root directory isn't configured correctly
- Build context is limited

## Recommended Approach

**Option 1: Set Root Directory to `backend/`** (RECOMMENDED)
- Go to Railway → Settings → Source → Root Directory
- Set to `backend`
- Railway will use `backend/Dockerfile` automatically
- All backend files are in context

**Option 2: Keep Root Directory as `.`**
- Use root `Dockerfile` (already created)
- Ensure `.railwayignore` includes `backend/`
- Railway copies `backend/` files to Docker build

## After Configuration

Once you set the root directory:
1. Push your commits
2. Railway will trigger a new build
3. Build should succeed
4. Deployment will show "updated a couple mins ago"
