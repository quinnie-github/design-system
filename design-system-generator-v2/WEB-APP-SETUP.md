# 🌐 Web App Setup Guide

Complete guide to setting up the AI-powered design analysis web app.

---

## 🎯 What is the Web App?

The web app lets you:
- **Upload design screenshots**
- **AI analyzes** the design automatically
- **Generates JSON** design system data
- **Download JSON** to use in Figma plugin

It's an alternative to manually describing designs to Claude.ai.

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │  ← You use this (web-app/index.html)
│  (Web App)  │
└──────┬──────┘
       │ HTTP requests
       ↓
┌─────────────┐
│ Proxy Server│  ← Runs locally (proxy-server/server.js)
│  (Node.js)  │
└──────┬──────┘
       │ API calls
       ↓
┌─────────────┐
│ Claude API  │  ← Anthropic's API
│  (External) │
└─────────────┘
```

**Why proxy server?**
- Browser can't call Claude API directly (CORS)
- Proxy server adds proper headers
- Keeps API key secure

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Claude API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign in (or create free account)
3. Navigate to: **Settings** → **API Keys**
4. Click: **Create Key**
5. Copy your key (starts with `sk-ant-...`)

💡 **Free tier**: $5 credit, enough for ~100-200 analyses

### Step 2: Install Proxy Server

Open Terminal and run:

```bash
# Navigate to proxy server
cd design-system-generator-v2/proxy-server

# Install dependencies (one time only)
npm install

# Create environment file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your-api-key-here
PORT=3002
EOF
```

Replace `your-api-key-here` with your actual key.

### Step 3: Start Proxy Server

```bash
npm start
```

You should see:
```
🚀 Proxy server running on http://localhost:3002
```

✅ Keep this terminal window open!

### Step 4: Open Web App

1. Open new Finder window
2. Navigate to: `design-system-generator-v2/web-app/`
3. Double-click: **START_HERE.html**

Or use Terminal:
```bash
open design-system-generator-v2/web-app/START_HERE.html
```

---

## 🎨 Using the Web App

### 1. Configure API

When web app opens:

**Option A: Use Proxy Server** (Recommended)
- Leave API key field empty
- Proxy server handles authentication
- More secure (key not in browser)

**Option B: Direct API**
- Paste your API key in the field
- No proxy server needed
- Less secure (key in browser)

### 2. Upload Screenshot

Click **"📁 Upload Screenshot"** or drag & drop:

**Supported formats:**
- PNG, JPG, JPEG, WebP
- Max 5MB
- Any resolution

**Tips for best results:**
- Use high-quality screenshots
- Capture full pages/sections
- Avoid blurry or low-res images

### 3. Analyze Design

Click **"🔍 Analyze Design"**

**What happens:**
1. Image uploaded to Claude API (via proxy)
2. AI analyzes colors, typography, spacing, layout
3. Extracts application insights
4. Generates structured JSON
5. Displays results (~10-30 seconds)

**Progress indicator:**
```
Analyzing design...  (spinner)
```

### 4. Review Results

The app shows:
- **Preview** of extracted data
- **JSON output** in formatted view
- **Statistics** (colors, fonts, components)

### 5. Download JSON

Click **"⬇️ Download JSON"**

File saves as: `design-system-{timestamp}.json`

### 6. Use in Figma Plugin

1. Open Figma plugin
2. Click **"📁 Upload JSON File"**
3. Select downloaded JSON
4. Generate design system!

---

## 🛠️ Configuration Options

### Proxy Server Settings

Edit `proxy-server/.env`:

```bash
# Claude API Key (required)
ANTHROPIC_API_KEY=sk-ant-...

# Server Port (optional, default: 3002)
PORT=3002

# Claude Model (optional, default: claude-3-5-sonnet-20241022)
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Rate Limiting (optional)
RATE_LIMIT_MAX=10          # Max requests
RATE_LIMIT_WINDOW=60000    # Per minute
```

### Web App Settings

Edit `web-app/app.js` (line ~10):

```javascript
const CONFIG = {
  // Proxy server URL
  proxyUrl: 'http://localhost:3002',

  // Max file size (5MB)
  maxFileSize: 5 * 1024 * 1024,

  // Analysis timeout (60s)
  timeout: 60000
};
```

---

## 🔍 Advanced Usage

### Custom Prompts

Edit `proxy-server/server.js` to customize AI prompts:

```javascript
const analysisPrompt = `
Analyze this design screenshot and extract:

1. Colors (primary, secondary, text, background, accent)
2. Typography (fonts, sizes, weights)
3. Spacing (padding, margins, gaps)
4. Components (buttons, cards, inputs)
5. Application insights

// ADD YOUR CUSTOM INSTRUCTIONS HERE

Return valid JSON only.
`;
```

### Using Different Claude Models

Available models:
- `claude-3-5-sonnet-20241022` (Best balance, recommended)
- `claude-3-opus-20240229` (Most capable, expensive)
- `claude-3-sonnet-20240229` (Faster, cheaper)
- `claude-3-haiku-20240307` (Fastest, cheapest)

Change in `.env`:
```bash
CLAUDE_MODEL=claude-3-haiku-20240307
```

### Batch Processing

Want to analyze multiple designs? Modify `web-app/app.js`:

```javascript
// Allow multiple file uploads
document.getElementById('fileInput').multiple = true;

// Process each file
fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    await analyzeDesign(file);
  }
});
```

---

## 🐛 Troubleshooting

### Proxy Server Issues

**Problem:** `EADDRINUSE` error (port already in use)

```bash
# Find process using port 3002
lsof -i :3002

# Kill it
kill -9 <PID>

# Or use different port
echo "PORT=3003" >> .env
```

**Problem:** `Module not found` error

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** API key not recognized

```bash
# Check .env file exists
ls -la proxy-server/.env

# Verify contents
cat proxy-server/.env

# Restart server
npm start
```

### Web App Issues

**Problem:** CORS errors in console

**Solution:** Make sure proxy server is running:
```bash
cd proxy-server
npm start
```

**Problem:** "Failed to fetch" error

**Causes:**
1. Proxy server not running → Start it
2. Wrong proxy URL → Check `app.js` config
3. Firewall blocking → Allow port 3002

**Problem:** Analysis times out

**Solutions:**
1. Use smaller images (under 2MB)
2. Increase timeout in `app.js`
3. Check API key has credits

**Problem:** JSON is invalid

**Causes:**
1. AI returned text instead of JSON
2. Image too complex/unclear
3. Model hallucinated

**Solution:** Click "Analyze" again or try different image

### Claude API Issues

**Problem:** 401 Unauthorized

**Solutions:**
1. Check API key is correct
2. Verify account is active
3. Ensure key isn't expired

**Problem:** 429 Rate Limit

**Solutions:**
1. Wait 60 seconds
2. Upgrade to paid tier
3. Implement retry logic

**Problem:** 400 Bad Request

**Causes:**
1. Image too large (>5MB)
2. Unsupported format
3. Corrupted file

**Solution:** Compress image or convert format

---

## 📊 Monitoring & Logs

### Proxy Server Logs

View in terminal where server is running:

```
📥 Request: POST /analyze
📤 Response: 200 OK (12.3s)
💰 Tokens used: 1547 input, 892 output
```

### Web App Console Logs

Open browser DevTools (F12):

```javascript
console.log('Analysis started...');
console.log('Response received:', data);
console.log('JSON parsed successfully');
```

### Usage Tracking

Check Claude API usage:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to: **Usage**
3. View requests, tokens, costs

---

## 💰 Cost Estimates

### Claude API Pricing

**Sonnet 3.5** (recommended):
- Input: $3 / million tokens (~750 images)
- Output: $15 / million tokens (~250 generations)

**Per analysis:**
- Average: ~1500 input tokens (~$0.0045)
- Average: ~800 output tokens (~$0.012)
- **Total: ~$0.02 per analysis** 💵

**$5 free credit = ~200-300 analyses**

### Optimization Tips

1. **Compress images** before uploading
2. **Batch similar designs** to reuse context
3. **Use Haiku model** for simple designs ($0.003/analysis)
4. **Cache results** to avoid re-analyzing

---

## 🔒 Security Best Practices

### API Key Management

✅ **DO:**
- Store key in `.env` file
- Add `.env` to `.gitignore`
- Use proxy server for browser access
- Rotate keys periodically

❌ **DON'T:**
- Commit keys to git
- Share keys publicly
- Hardcode in source files
- Use same key across projects

### Server Security

```bash
# Restrict proxy to localhost only
# In server.js:
app.listen(PORT, 'localhost', () => {
  console.log('Server listening on localhost only');
});

# Use HTTPS in production
# Add SSL certificates
```

---

## 🚀 Deployment (Optional)

Want to host the web app online?

### Option 1: Vercel (Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy web app
cd web-app
vercel

# Deploy proxy server separately
cd ../proxy-server
vercel
```

### Option 2: Netlify (Free)

1. Push code to GitHub
2. Connect repo to Netlify
3. Deploy web-app folder
4. Set environment variables in Netlify dashboard

### Option 3: Docker

```dockerfile
# Dockerfile for proxy server
FROM node:18
WORKDIR /app
COPY proxy-server/package*.json ./
RUN npm install
COPY proxy-server/ ./
CMD ["npm", "start"]
```

---

## ✅ Verification Checklist

Before analyzing designs:

- [ ] Claude API key obtained
- [ ] `.env` file created with API key
- [ ] `npm install` completed successfully
- [ ] Proxy server running on http://localhost:3002
- [ ] Web app opened in browser
- [ ] Test image uploaded successfully
- [ ] Analysis completes and returns JSON
- [ ] JSON downloads correctly
- [ ] JSON works in Figma plugin

---

## 📚 Additional Resources

### Documentation
- [Claude API Docs](https://docs.anthropic.com/)
- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Example Implementations
- `web-app/app.js` - Frontend code
- `proxy-server/server.js` - Backend code
- `sample-*.json` - Example outputs

---

**Ready to analyze designs? Start the proxy server and open the web app! 🎨**
