# Fix for 500 Internal Server Error

## Problem
The backend was returning 500 errors when processing chat messages, causing timeouts and failed requests.

## Root Cause
The code was calling `openai.responses.create()`, which **does not exist** in the OpenAI Node.js SDK. This caused a runtime error:
```
TypeError: Cannot read property 'create' of undefined
```

## Solution Applied

### 1. Fixed API Method Call
Changed from non-existent API to correct method:
- **Before:** `openai.responses.create()` ❌
- **After:** `openai.chat.completions.create()` ✅

### 2. Fixed Response Parsing
Updated to use correct response format:
- **Before:** `response.output_text` ❌
- **After:** `response.choices[0].message.content` ✅

### 3. Added Error Handling
- Detailed error logging with status codes and error messages
- Specific handling for common errors (401, 404, timeouts)
- Better error messages returned to frontend

### 4. Added Fallback Model
- If `gpt-5-mini` is unavailable, automatically tries `gpt-4o-mini`
- Prevents failures due to model availability issues

### 5. Added API Key Validation
- Fails fast if `OPENAI_API_KEY` is missing
- Clear error message if API key is not configured

## Files Changed
1. `backend/pages/api/analyze.ts` - Main chat endpoint
2. `backend/pages/api/followups/[id]/draft.ts` - Draft generation
3. `backend/lib/followupDetector.ts` - Follow-up detection

## Next Steps

### 1. Push Changes
```bash
git push origin main
```

### 2. Verify Railway Deployment
- Check Railway dashboard for successful deployment
- Verify environment variable `OPENAI_API_KEY` is set in Railway

### 3. Check Railway Logs
After deployment, check Railway logs for:
- `[timestamp] API request received` - Confirms requests are reaching the endpoint
- `[timestamp] Calling OpenAI API with model: gpt-5-mini...` - Shows which model is being used
- `[timestamp] OpenAI API completed in Xms` - Shows API response time
- Any error messages with detailed status codes

### 4. Test the Chat
Try sending a simple message like "hey" and verify:
- Response comes back successfully
- No 500 errors in console
- Response time is reasonable (< 5 seconds)

## Expected Behavior After Fix

✅ **No more 500 errors** - Backend handles requests correctly  
✅ **Proper error messages** - If something fails, you'll see specific error details  
✅ **Automatic fallback** - Uses `gpt-4o-mini` if `gpt-5-mini` unavailable  
✅ **Better logging** - Railway logs show exactly what's happening  

## Troubleshooting

If you still see errors after deployment:

1. **Check Railway Logs** - Look for the detailed error messages we added
2. **Verify API Key** - Ensure `OPENAI_API_KEY` is set in Railway environment variables
3. **Check Model Availability** - The logs will show if model fallback occurred
4. **Check Network** - Verify Railway deployment is accessible

## Common Error Codes

- **401** - Invalid API key (check `OPENAI_API_KEY` in Railway)
- **404** - Model not found (fallback to `gpt-4o-mini` should trigger)
- **Timeout** - OpenAI API taking too long (check API status)
- **500** - Server error (check Railway logs for details)
