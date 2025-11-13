# 🚀 Claude Vision API Proxy Server - Setup Guide

**Status**: ✅ Complete and Running
**Date**: 2025-11-11
**Server**: http://localhost:3002

---

## 📋 Overview

This setup enables the Figma Design System Generator plugin to use Claude Vision AI for analyzing screenshots. Due to browser security restrictions (CORS), we use a proxy server architecture.

### Architecture

```
Figma Plugin UI
     ↓ (upload screenshot + API key)
Proxy Server (localhost:3002)
     ↓ (forward request with API key)
Anthropic Claude Vision API
     ↓ (AI analysis response)
Proxy Server
     ↓ (return response)
Figma Plugin UI (show visual features)
```

---

## ✅ What's Already Done

1. ✅ **Proxy server created** at `server/`
2. ✅ **Dependencies installed** (express, cors)
3. ✅ **Server running** on port 3002
4. ✅ **UI updated** to call proxy instead of direct API
5. ✅ **Manifest updated** to allow localhost:3002

---

## 🎯 How to Use

### Step 1: Start the Proxy Server

**Terminal Window #1:**
```bash
cd /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/design-system-generator/server
npm start
```

**You should see:**
```
🚀 Claude Vision API Proxy Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on http://localhost:3002
✅ Health check: http://localhost:3002/health
✅ Analyze endpoint: POST http://localhost:3002/api/analyze

📝 Ready to proxy requests from Figma plugin to Claude Vision API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Note**: Keep this terminal window open while using the plugin!

### Step 2: Reload the Figma Plugin

1. In Figma, go to **Plugins → Development → Import plugin from manifest**
2. Navigate to:
   ```
   /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/design-system-generator/manifest.json
   ```
3. Click to reload the plugin

### Step 3: Enter Your API Key

In the plugin interface:

1. Find the **"🔑 Anthropic API Key"** section at the top
2. Enter your API key (starts with `sk-ant-...`)
3. Click **"Save Key"**
4. You'll see: ✅ **API key saved! Ready to analyze.**

### Step 4: Upload and Analyze

**Option A: Upload Screenshot**
1. Click **"📸 Upload Screenshot"**
2. Select an image file
3. The plugin will automatically analyze it

**Option B: Use Image URL**
1. Click **"🔗 Use Image URL"**
2. Paste a direct image URL
3. Click **"✨ Analyze Image"**

**Option C: Test with Mock Data** (No API key needed)
1. Click **"🎨 Test with Mock Data"**
2. Instantly see all visual features with sample data

### Step 5: See Visual Features!

After analysis completes, scroll down to see:

- ✅ **🎯 Application Insights** panel:
  - 40px color swatches with percentage badges
  - Live button previews showing actual colors
  - Component composition examples
  - Annotated spacing layout

- ✅ **🎨 Reference Design: SaaS Dashboard** panel:
  - Complete dashboard template
  - Gradient detection and usage
  - All button variants applied

---

## 🔧 Technical Details

### Files Modified

**1. `server/server.js`** (Proxy server)
- Listens on port 3002
- Accepts POST requests to `/api/analyze`
- Forwards requests to Anthropic API
- Returns responses to Figma plugin

**2. `ui.html`** (Plugin UI)
- Lines 2276: Added `PROXY_URL = 'http://localhost:3002/api/analyze'`
- Lines 2279: Added shared `CLAUDE_VISION_PROMPT`
- Lines 2281-2367: Updated `callClaudeVisionAPI()` to use proxy
- Lines 2369-2445: Updated `callClaudeVisionAPIWithURL()` to use proxy

**3. `manifest.json`** (Plugin config)
- Line 9: Changed to `"allowedDomains": ["http://localhost:3002"]`

### API Request Flow

**1. UI sends to proxy:**
```javascript
fetch('http://localhost:3002/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'sk-ant-...',
    imageData: 'base64_data...',  // OR imageUrl
    prompt: '...'
  })
})
```

**2. Proxy forwards to Anthropic:**
```javascript
https.request('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: {
    model: 'claude-3-5-sonnet-20241022',
    messages: [...]
  }
})
```

**3. Proxy returns response:**
```javascript
{
  content: [{
    type: 'text',
    text: 'AI analysis...'
  }]
}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS error

**Check:**
1. Is the proxy server running? (See Step 1)
2. Is the URL correct in `ui.html`? Should be `http://localhost:3002/api/analyze`
3. Did you reload the plugin after starting the server?

**Fix:**
```bash
# Terminal 1: Start proxy server
cd server && npm start

# Terminal 2: In Figma, reload plugin
```

### Issue: "API key required" error

**Check:**
1. Did you save the API key in the plugin UI?
2. Does your API key start with `sk-ant-`?

**Fix:**
- Enter API key in the **🔑 Anthropic API Key** section
- Click **"Save Key"**

### Issue: Port 3002 already in use

**Fix:**
```bash
# Find process using port 3002
lsof -i :3002

# Kill the process
kill -9 <PID>

# Or change port in server/server.js:
# const PORT = 3003;  // Use different port
```

Then update `ui.html` to match:
```javascript
var PROXY_URL = 'http://localhost:3003/api/analyze';
```

### Issue: Proxy server shows errors

**Check the proxy server terminal for specific errors:**

- **`ECONNREFUSED`**: Can't reach Anthropic API → Check internet connection
- **`401 Unauthorized`**: Invalid API key → Check your Anthropic API key
- **`400 Bad Request`**: Invalid request format → Check console for details

---

## 🌐 Production Deployment

For production use, deploy the proxy server to a cloud service:

### Option 1: Vercel
```bash
cd server
npm install -g vercel
vercel
```

### Option 2: Railway
```bash
cd server
# Connect to Railway via their CLI or web interface
```

### Option 3: Heroku
```bash
cd server
heroku create
git push heroku main
```

**After deployment, update `ui.html`:**
```javascript
var PROXY_URL = 'https://your-proxy-server.vercel.app/api/analyze';
```

And update `manifest.json`:
```json
"allowedDomains": ["https://your-proxy-server.vercel.app"]
```

---

## 🔒 Security Notes

**Current Setup (Development):**
- ✅ API keys sent from client to proxy
- ✅ Proxy forwards to Anthropic API
- ⚠️ API keys not encrypted in transit (localhost only)

**Production Recommendations:**
1. **Use HTTPS** for all connections
2. **Store API keys server-side** instead of client-side
3. **Add authentication** (e.g., user login with JWT tokens)
4. **Add rate limiting** to prevent abuse
5. **Use environment variables** for configuration

---

## 📊 Server Endpoints

### Health Check
```bash
curl http://localhost:3002/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Claude Vision API Proxy Server running"
}
```

### Analyze Image
```bash
curl -X POST http://localhost:3002/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-ant-...",
    "imageData": "base64_encoded_image",
    "prompt": "Analyze this design..."
  }'
```

---

## ✨ Features Now Working

✅ **Screenshot Upload** → Claude Vision API → Visual Features
✅ **Image URL Analysis** → Claude Vision API → Visual Features
✅ **Mock Data Preview** → Instant visual features (no API)
✅ **CORS Bypassed** → Proxy handles external API calls
✅ **API Key Management** → Save once, use for session

---

## 📝 Summary

**What you have now:**
- A local proxy server that handles Claude Vision API calls
- A Figma plugin that sends requests to the proxy
- Full visual feature support (color swatches, button previews, SaaS dashboard)
- No more CORS errors!

**To use:**
1. Start proxy server: `cd server && npm start`
2. Reload Figma plugin
3. Upload screenshot or enter image URL
4. See amazing visual features! ✨

---

**Last Updated**: 2025-11-11
**Status**: ✅ **Ready to Use!**
