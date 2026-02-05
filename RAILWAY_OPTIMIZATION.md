# Railway Performance Optimization Guide

## The Problem: Cold Starts

Railway spins down inactive services after ~15 minutes of inactivity. The first request after spin-down takes 10-20 seconds to:
1. Wake up the container
2. Initialize Node.js
3. Load dependencies
4. Start the Next.js server
5. Process the request

## Solutions

### 1. Health Check Endpoint (Implemented)
Created `/api/health` endpoint that responds instantly. This can be pinged periodically to keep Railway warm.

**To use:**
- Set up a cron job (e.g., UptimeRobot, cron-job.org) to ping `https://velora-production.up.railway.app/api/health` every 5 minutes
- This keeps Railway warm and prevents cold starts

### 2. Railway Always-On (Recommended)
In Railway dashboard:
1. Go to your service settings
2. Enable "Always On" or "Never Sleep"
3. This prevents cold starts but costs more (keeps container running 24/7)

### 3. Move API to Vercel Edge Functions (Best Performance)
Vercel Edge Functions:
- Deploy globally (low latency worldwide)
- No cold starts (always warm)
- Free tier includes generous limits
- Automatic scaling

**Migration steps:**
1. Move `backend/pages/api/analyze.ts` to `frontend/app/api/analyze/route.ts`
2. Deploy frontend to Vercel (already done)
3. API routes automatically become Edge Functions
4. Much faster than Railway

### 4. Optimize Railway Deployment
- Use smaller Docker image (alpine-based)
- Pre-build Next.js during Docker build
- Use Railway's build cache
- Enable Railway's auto-scaling

## Current Status

✅ Health check endpoint created (`/api/health`)
⏳ Need to set up external ping service (UptimeRobot, etc.)
⏳ Consider enabling Railway "Always On"
⏳ Consider migrating API to Vercel Edge Functions

## Quick Fix: Enable Railway Always-On

1. Go to Railway dashboard
2. Select your backend service
3. Settings → General
4. Enable "Always On" or "Never Sleep"
5. This prevents cold starts immediately

## Long-term Solution: Vercel Edge Functions

Moving the API to Vercel Edge Functions would:
- Eliminate cold starts completely
- Reduce latency (global CDN)
- Lower costs (free tier)
- Better performance overall
