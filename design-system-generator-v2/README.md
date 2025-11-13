# 🎨 Design System Generator v2.0

**Transform any design screenshot into a professional Figma design system using AI**

A complete workflow that uses Claude Vision API to analyze designs and automatically generate Figma variables and components.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

---

## 🎯 Overview

Design System Generator v2.0 is a two-step workflow:

**Step 1: Web App** → Upload screenshot → AI analyzes → Export JSON
**Step 2: Figma Plugin** → Import JSON → Generate design system

### What It Does

- ✅ Extracts colors with semantic classification (primary, text, background, etc.)
- ✅ Analyzes typography (fonts, sizes, weights, line heights)
- ✅ Detects spacing patterns
- ✅ Identifies button styles and variants
- ✅ Extracts gradients
- ✅ Generates application insights (type, purpose, audience, style)
- ✅ Creates Figma variables automatically
- ✅ Generates component library
- ✅ Organizes everything in a clean design system page

---

## 🏗️ Architecture

```
design-system-generator-v2/
├── web-app/              # Step 1: Screenshot analysis
│   ├── index.html        # Web interface
│   └── app.js            # Analysis logic
├── proxy-server/         # API proxy for Claude Vision
│   ├── server.js         # Express server
│   └── package.json      # Dependencies
└── figma-plugin/         # Step 2: Design system generation
    ├── manifest.json     # Plugin configuration
    ├── code.js           # Plugin logic
    └── ui.html           # Plugin interface
```

### Tech Stack

- **Web App**: Vanilla JavaScript, HTML5, CSS3
- **Proxy Server**: Node.js, Express.js
- **AI**: Claude Vision API (Anthropic)
- **Figma Plugin**: Figma Plugin API

---

## 🚀 Installation

### Prerequisites

- Node.js 16+ installed
- Claude API key from [console.anthropic.com](https://console.anthropic.com/)
- Figma desktop app or browser version

### Step 1: Install Proxy Server

```bash
cd design-system-generator-v2/proxy-server
npm install
```

### Step 2: Open Web App

The web app is a standalone HTML file - just open it in your browser:

```bash
# Option 1: Open directly
open design-system-generator-v2/web-app/index.html

# Option 2: Use a local server (recommended)
cd design-system-generator-v2/web-app
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Step 3: Install Figma Plugin

1. Open Figma desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to `design-system-generator-v2/figma-plugin/manifest.json`
4. Click **Open**

The plugin will now appear in: **Plugins** → **Development** → **Design System Generator v2.0**

---

## 📖 Usage

### Complete Workflow (5 minutes)

#### Phase 1: Web App - Design Analysis

1. **Start the proxy server:**
   ```bash
   cd design-system-generator-v2/proxy-server
   npm start
   ```

2. **Open the web app:**
   - Open `web-app/index.html` in your browser
   - Or visit `http://localhost:8000` if using local server

3. **Configure:**
   - Enter your Claude API key (get from [console.anthropic.com](https://console.anthropic.com/))
   - Verify proxy URL is `http://localhost:3002`

4. **Upload design:**
   - **Option A**: Drag & drop a design screenshot
   - **Option B**: Paste an image URL

5. **Configure analysis options:**
   - ✅ Extract colors
   - ✅ Analyze typography
   - ✅ Detect spacing
   - ✅ Identify buttons
   - ✅ Extract gradients
   - ✅ Generate insights

6. **Analyze:**
   - Click **"✨ Analyze Design"**
   - Wait 10-30 seconds for AI analysis
   - Review the results

7. **Export:**
   - Click **"💾 Download JSON"**
   - Save the file (e.g., `design-system-2024.json`)

#### Phase 2: Figma Plugin - System Generation

1. **Open Figma:**
   - Create a new file or open existing project

2. **Run plugin:**
   - Go to **Plugins** → **Development** → **Design System Generator v2.0**

3. **Import JSON:**
   - Click **"📁 Choose JSON File"** and select your downloaded JSON
   - OR paste the JSON directly into the textarea
   - Click **"✅ Import & Validate JSON"**

4. **Review summary:**
   - Check the detected colors, typography, spacing, buttons, and gradients

5. **Configure generation:**
   - Set design system name (e.g., "Acme Design System")
   - Choose options:
     - ✅ Create Figma variables
     - ✅ Generate components
     - ✅ Create new page

6. **Generate:**
   - Click **"✨ Generate Design System"**
   - Wait 5-10 seconds
   - Your design system is ready! 🎉

---

## 🧪 Testing

### Test 1: Proxy Server Health Check

```bash
# Start server
cd proxy-server
npm start

# In another terminal, test health endpoint
curl http://localhost:3002/health

# Expected response:
# {"status":"ok","message":"Design System Generator v2.0 Proxy Server",...}
```

### Test 2: Web App Basic Flow

1. Open `web-app/index.html`
2. Enter API key: `sk-ant-api03-...` (your real key)
3. Upload a simple design screenshot (e.g., a landing page)
4. Click "Analyze Design"
5. Verify results show colors, typography, etc.
6. Click "Download JSON"
7. Verify JSON file downloads successfully

### Test 3: Figma Plugin Integration

1. Use the JSON from Test 2
2. Open Figma and run the plugin
3. Import the JSON file
4. Verify summary shows correct counts
5. Click "Generate Design System"
6. Verify:
   - New page created
   - Variables collection created
   - Components generated
   - Color palette displayed

### Test 4: End-to-End Workflow

**Test with a real landing page:**

1. Find a design screenshot (e.g., from Dribbble, Behance)
2. Upload to web app
3. Analyze and download JSON
4. Import to Figma plugin
5. Generate complete design system
6. Verify quality of:
   - Color accuracy
   - Typography detection
   - Component generation

**Expected results:**
- 5-10 colors detected and classified
- 3-5 font sizes identified
- 2-4 button variants created
- Variables properly named and organized
- Components use variables correctly

---

## 🐛 Troubleshooting

### Proxy Server Issues

**Problem**: Server won't start
**Solution**:
```bash
# Check if port 3002 is already in use
lsof -i :3002
# Kill the process if needed
kill -9 <PID>
# Restart server
npm start
```

**Problem**: CORS errors in browser
**Solution**:
- Server already has CORS enabled
- Make sure proxy URL in web app is `http://localhost:3002`
- Don't use `https://` for localhost

### Web App Issues

**Problem**: "Failed to connect to proxy"
**Solution**:
1. Verify proxy server is running (`npm start` in proxy-server/)
2. Check proxy URL is correct (`http://localhost:3002`)
3. Test health endpoint: `curl http://localhost:3002/health`

**Problem**: Analysis returns no results
**Solution**:
1. Check image is valid (PNG, JPG, WebP)
2. Verify image size is < 5MB
3. Try with a simpler design screenshot
4. Check Claude API key is valid

**Problem**: "Invalid JSON" error
**Solution**:
1. Check AI response in browser console
2. Sometimes Claude wraps JSON in markdown - app handles this
3. Try analyzing again (AI responses may vary)

### Figma Plugin Issues

**Problem**: Plugin won't load
**Solution**:
1. Verify manifest.json path is correct
2. Check all files exist (manifest.json, code.js, ui.html)
3. Restart Figma app
4. Reimport plugin from manifest

**Problem**: "No design system data loaded"
**Solution**:
1. Make sure you clicked "Import & Validate JSON" first
2. Verify JSON is valid (paste into JSONLint.com)
3. Check browser console for errors

**Problem**: Variables not created
**Solution**:
1. Check if variable collection already exists with same name
2. Rename your design system
3. Make sure "Create Figma variables" is checked
4. Check for color format errors (hex colors should start with #)

**Problem**: Components look wrong
**Solution**:
1. Check if colors were detected correctly
2. Make sure primary color exists in JSON
3. Try regenerating with different options
4. Manually adjust components after generation

---

## 📚 API Reference

### Proxy Server Endpoints

#### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Design System Generator v2.0 Proxy Server",
  "version": "2.0.0",
  "uptime": 123.45,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/status
API status and configuration

**Response:**
```json
{
  "ready": true,
  "endpoints": {
    "health": "/health",
    "analyze": "/api/analyze",
    "status": "/api/status"
  },
  "limits": {
    "maxImageSize": "50mb",
    "timeout": "60s"
  }
}
```

#### POST /api/analyze
Analyze design screenshot with Claude Vision

**Request Body:**
```json
{
  "apiKey": "sk-ant-api03-...",
  "imageData": "base64-encoded-image-data",
  "imageUrl": "https://example.com/design.png",
  "prompt": "Analyze this design and extract design tokens..."
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "{\"colors\":{...},\"typography\":{...}}"
  }],
  "metadata": {
    "duration": 1234,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "model": "claude-3-5-sonnet-20241022"
  }
}
```

### JSON Schema

The JSON output follows this structure:

```json
{
  "colors": {
    "primary": ["#6366f1", "#4f46e5"],
    "secondary": ["#8b5cf6"],
    "text": ["#1e293b", "#475569"],
    "background": ["#ffffff", "#f8fafc"],
    "accent": ["#ec4899"]
  },
  "typography": {
    "fontFamilies": ["Inter", "Roboto"],
    "fontSizes": ["12px", "14px", "16px", "20px", "24px"],
    "fontWeights": ["400", "500", "600", "700"],
    "lineHeights": ["1.5", "1.6", "1.75"]
  },
  "spacing": {
    "scale": ["4px", "8px", "12px", "16px", "24px", "32px"]
  },
  "buttons": {
    "variants": [
      {
        "name": "Primary",
        "description": "Solid background, white text"
      },
      {
        "name": "Secondary",
        "description": "Outline style"
      }
    ]
  },
  "gradients": [
    {
      "name": "Hero Gradient",
      "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }
  ],
  "applicationInsights": {
    "type": "SaaS Landing Page",
    "primaryPurpose": "Convert visitors to sign up",
    "targetAudience": "B2B software buyers",
    "designStyle": "Modern, clean, professional",
    "keyFeatures": [
      "Hero section with CTA",
      "Feature showcase",
      "Pricing tiers",
      "Testimonials"
    ]
  },
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "version": "2.0",
    "generatorType": "web-app"
  }
}
```

---

## 🎨 Example Workflows

### Workflow 1: Landing Page Analysis

**Goal**: Extract design system from a SaaS landing page

1. Find a landing page screenshot (1920x1080)
2. Upload to web app
3. Enable all analysis options
4. Analyze (30 seconds)
5. Download JSON
6. Import to Figma
7. Generate system

**Result**: Complete design system with 8-12 colors, typography scale, button components

### Workflow 2: Mobile App Design

**Goal**: Create design system from mobile app screens

1. Upload mobile app screenshot
2. Focus on colors and buttons
3. Disable spacing (mobile spacing differs)
4. Analyze and export
5. Import to Figma
6. Generate mobile-optimized system

### Workflow 3: Iterative Refinement

**Goal**: Improve design system over multiple iterations

1. Analyze hero section → Note primary colors
2. Analyze features section → Add secondary colors
3. Analyze footer → Complete the palette
4. Combine insights manually
5. Create final JSON
6. Generate comprehensive system

---

## 💡 Tips & Best Practices

### For Web App Analysis

- **Use high-quality screenshots**: 1920x1080 or higher
- **Clean designs work best**: Avoid busy, cluttered layouts
- **Analyze sections separately**: Hero, features, footer for better accuracy
- **Multiple iterations**: Analyze same design twice, compare results
- **Manual review**: Always review AI output before importing to Figma

### For Figma Plugin

- **Unique names**: Use descriptive system names to avoid conflicts
- **Fresh pages**: Generate on new pages to keep things organized
- **Review variables**: Check variable collection after generation
- **Customize components**: Generated components are starting points
- **Documentation**: Add descriptions to variables and components

### Production Tips

- **Version control**: Save JSON files with version numbers
- **Team collaboration**: Share JSON files via Git or cloud storage
- **Client projects**: Generate separate systems per client
- **Template library**: Build a library of analyzed templates
- **Continuous improvement**: Update systems as designs evolve

---

## 🚀 Advanced Usage

### Custom Prompts

You can modify the prompt in `web-app/app.js` to customize AI analysis:

```javascript
// In buildPrompt() function
prompt += `
- Focus on accessibility (WCAG AA contrast ratios)
- Extract shadow styles
- Identify icon usage patterns
- Note animation opportunities
`;
```

### Batch Processing

Process multiple designs programmatically:

```bash
# Coming soon: CLI tool
npx design-system-generator analyze ./designs/*.png
```

### API Integration

Integrate with your own tools:

```javascript
// Example: Analyze via API
const response = await fetch('http://localhost:3002/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: process.env.CLAUDE_API_KEY,
    imageUrl: 'https://example.com/design.png',
    prompt: 'Extract design tokens...'
  })
});

const result = await response.json();
```

---

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

## 🙏 Credits

- **Claude Vision API** by Anthropic for AI-powered design analysis
- **Figma Plugin API** for design system generation
- Built with ❤️ for designers and developers

---

## 📞 Support

For issues, questions, or feature requests:

- Check [Troubleshooting](#troubleshooting) section
- Review [API Reference](#api-reference)
- Test with example designs first
- Verify all prerequisites are installed

---

**Ready to generate your first design system?**

1. Start proxy server: `cd proxy-server && npm start`
2. Open web app: `open web-app/index.html`
3. Upload a design and analyze! ✨

Happy designing! 🎨
