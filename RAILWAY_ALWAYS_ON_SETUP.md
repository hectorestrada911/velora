# How to Enable Railway "Always On" (Prevent Cold Starts)

## Step-by-Step Instructions

1. **Go to Railway Dashboard**
   - Navigate to https://railway.app
   - Select your project: `hectorestrada911/velora`

2. **Select Your Backend Service**
   - Click on the service named "velora" (the backend service)

3. **Open Settings**
   - Click on the **"Settings"** tab (you're already there based on your screenshot)

4. **Go to Scale Section**
   - In the right-hand navigation menu, click on **"Scale"** (you're already here!)

5. **Disable Serverless Mode**
   - Scroll down to the **"Deploy"** section
   - Look for **"Serverless"** toggle
   - **DISABLE it** (turn it OFF)
   - The description says: "Containers will scale down to zero and then scale up based on traffic"
   - When Serverless is OFF, containers stay running (no cold starts)

6. **Save Changes**
   - Changes should save automatically
   - Railway will restart your service with the new setting

## What This Does

- **Prevents cold starts**: Container stays running 24/7
- **Faster responses**: No 10-20 second wake-up delay
- **Cost**: Slightly higher (container always running)
- **Result**: Responses in 1-2 seconds instead of 17+ seconds

## Alternative: Use Health Check Ping

If you don't want to enable Always On (to save costs), you can use a free service to ping your health endpoint:

1. **Set up UptimeRobot** (free):
   - Go to https://uptimerobot.com
   - Create account
   - Add new monitor
   - Type: HTTP(s)
   - URL: `https://velora-production.up.railway.app/api/health`
   - Interval: 5 minutes
   - This keeps Railway warm by pinging every 5 minutes

2. **Or use cron-job.org** (free):
   - Go to https://cron-job.org
   - Create account
   - Add new cron job
   - URL: `https://velora-production.up.railway.app/api/health`
   - Schedule: Every 5 minutes

## Recommended

**Enable Always On** for the best user experience. The cost difference is minimal compared to the huge performance improvement.
