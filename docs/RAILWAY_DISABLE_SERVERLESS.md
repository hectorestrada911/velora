# How to Prevent Railway Cold Starts

## The Setting You Need

**Disable "Serverless" mode** in Railway's Deploy settings.

## Step-by-Step Instructions

1. **You're already in the right place!**
   - You're in Settings → Scale section

2. **Scroll down to "Deploy" section**
   - Look for the **"Serverless"** toggle

3. **Disable Serverless**
   - Turn the **"Serverless"** toggle **OFF**
   - When Serverless is ON: Containers scale down to zero → causes 10-20s cold starts
   - When Serverless is OFF: Containers stay running → no cold starts!

4. **Save**
   - Click **"Update"** button at the bottom
   - Railway will restart your service

## What This Does

**Before (Serverless ON):**
- Container scales down to zero after inactivity
- First request after inactivity: 10-20 seconds (cold start)
- Your "hey" message: 17 seconds timeout

**After (Serverless OFF):**
- Container stays running 24/7
- First request: 1-2 seconds (no cold start)
- Your "hey" message: Instant response!

## Visual Guide

```
Settings → Scale
  ↓
Scroll down to "Deploy" section
  ↓
Find "Serverless" toggle
  ↓
Turn it OFF
  ↓
Click "Update"
```

## Cost Impact

- **Serverless ON**: Cheaper (only pay when container is running)
- **Serverless OFF**: Slightly more expensive (container always running)
- **Trade-off**: Small cost increase for huge performance improvement

## Result

After disabling Serverless:
- ✅ No more 17-second timeouts
- ✅ Responses in 1-2 seconds
- ✅ Better user experience
- ✅ Calendar events work instantly
