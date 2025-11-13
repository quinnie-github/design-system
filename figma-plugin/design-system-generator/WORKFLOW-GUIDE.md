# 🚀 Design System Generator - Complete Workflow Guide

**Status**: ✅ Complete and Ready to Use
**Last Updated**: 2025-11-12

---

## 📋 Overview

This guide shows you how to use the **new elegant workflow** that separates AI analysis from Figma generation:

```
┌─────────────────────────────────────────────────┐
│  STEP 1: Web App (AI Analysis)                  │
│  ✓ Upload screenshot                            │
│  ✓ Claude Vision analyzes design                │
│  ✓ Preview visual features                      │
│  ✓ Export JSON                                  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  STEP 2: Figma Plugin (Import & Generate)       │
│  ✓ Paste JSON                                   │
│  ✓ Review design system                         │
│  ✓ Generate in Figma                            │
└─────────────────────────────────────────────────┘
```

---

## ✨ Why This New Workflow?

**Before**: Complex plugin with CORS issues, proxy servers, and API key management in Figma
**Now**: Clean separation - analyze in web app, generate in Figma!

**Benefits**:
- ✅ No more CORS errors
- ✅ No API keys needed in Figma plugin
- ✅ Preview before generating
- ✅ Shareable design system JSON
- ✅ Works offline once exported

---

## 🎯 Complete Workflow

### STEP 1: Analyze Design in Web App

**1. Start the Web App**

Open terminal and run:
```bash
cd /Users/quinniechen/Downloads/figma-variable-updater
python3 -m http.server 8765
```

**2. Open in Browser**

Navigate to: http://localhost:8765/test-ai-analysis.html

**3. Test with Mock Data (No API Key Needed)**

- Click **"🎨 Test with Mock Data"**
- Instantly see visual features:
  - 40px color swatches with percentage badges
  - Live button previews
  - Component composition examples
  - SaaS dashboard template

**4. Or Analyze Real Design (With API Key)**

- Click **"📸 Upload Screenshot"** or **"🔗 Use Image URL"**
- Enter your Anthropic API key when prompted
- Wait for Claude Vision to analyze
- Review the visual features

**5. Export Design System**

- Scroll to the green **"Export to Figma"** section
- Click **"📦 Export to Figma Plugin"**
- In the modal, click **"📋 Copy to Clipboard"**
- (Or download JSON file for later use)

✅ **Step 1 Complete!** You now have your design system JSON copied.

---

### STEP 2: Import to Figma Plugin

**1. Open Figma Plugin**

In Figma:
- Go to **Plugins → Development → Import plugin from manifest**
- Navigate to: `/Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/design-system-generator/manifest.json`
- Run the plugin

**2. Use Quick Import**

At the top of the plugin, you'll see a green **"⚡ Quick Import from Web App"** section:

- **Paste** the JSON you copied from the web app
- The plugin will validate it automatically:
  - ✅ Valid JSON → Green checkmark
  - ❌ Invalid → Red error message

**3. Import & Review**

- Click **"📦 Import & Generate Design System"**
- The plugin will:
  - Load the design system data
  - Show Application Insights panel
  - Scroll to the "Generate" button
  - Highlight it for you

**4. Generate in Figma**

- Review the color palette and settings
- Click **"✨ Generate Design System"**
- Your design system is created in Figma!

✅ **Step 2 Complete!** Your design system is now in Figma.

---

## 🎬 Quick Start Example

**Fastest way to test (uses mock data - no API key needed)**:

```bash
# Terminal 1: Start web app
cd /Users/quinniechen/Downloads/figma-variable-updater
python3 -m http.server 8765

# Browser: Open http://localhost:8765/test-ai-analysis.html
# 1. Click "🎨 Test with Mock Data"
# 2. Scroll down, click "📦 Export to Figma Plugin"
# 3. Click "📋 Copy to Clipboard"

# Figma: Open the Design System Generator plugin
# 1. Paste JSON in the green "Quick Import" section
# 2. Click "📦 Import & Generate Design System"
# 3. Click "✨ Generate Design System"

# Done! 🎉
```

---

## 📁 JSON Export Format

The exported JSON contains everything needed:

```json
{
  "version": "1.0",
  "timestamp": "2025-11-12T...",
  "designSystem": {
    "colors": [...],           // All detected colors
    "brandColors": [...],      // Brand-specific colors
    "functionalColors": [...], // Functional colors (CTA, error, etc.)
    "ctaColor": {...},         // Primary CTA color
    "gradients": [...],        // Detected gradients
    "buttons": [...],          // Button styles
    "cornerRadius": 8,         // Border radius
    "spacing": {...},          // Spacing scale
    "typography": {...},       // Typography settings
    "applicationInsights": ""  // AI recommendations
  }
}
```

---

## 🔧 Alternative: Still Use AI in Figma Plugin

If you prefer the old workflow with AI analysis directly in Figma:

**1. Start Proxy Server**

```bash
cd /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/design-system-generator/server
npm start
```

**2. Use Plugin's AI Features**

- Enter API key in plugin
- Upload screenshot or use image URL
- AI will analyze via proxy server

See [SETUP-PROXY.md](SETUP-PROXY.md) for details.

---

## 📊 Comparison: Old vs New Workflow

| Feature | Old Workflow | New Workflow |
|---------|--------------|--------------|
| **Setup** | Need proxy server running | Just web app (simple HTTP server) |
| **API Key** | Store in Figma plugin | Only in web app (optional) |
| **CORS Issues** | Requires proxy to bypass | No CORS issues |
| **Preview** | Only in Figma | Rich preview in web app |
| **Sharing** | Cannot share | Export/import JSON |
| **Offline Use** | Requires API | Works offline after export |
| **Speed** | API call each time | Instant import from JSON |

---

## 🐛 Troubleshooting

### Issue: "Invalid JSON" error when importing

**Check**:
- Did you copy the complete JSON?
- Is it from the "Export to Figma" button in web app?

**Fix**:
- Re-export from web app
- Make sure to click "Copy to Clipboard" in the export modal

---

### Issue: Web app shows "Test with Mock Data" but I want real analysis

**You need**:
- An Anthropic API key (get one at https://console.anthropic.com)
- A screenshot of your design

**Steps**:
1. In web app, click "Upload Screenshot" or "Use Image URL"
2. Enter API key when prompted
3. Upload/paste your design
4. Wait for AI analysis
5. Export the JSON

---

### Issue: Import works but "Generate Design System" doesn't do anything

**Check**:
- Are you in a Figma file (not just on homepage)?
- Does the plugin have permission to create nodes?

**Fix**:
- Make sure you're in an actual Figma design file
- The plugin needs a file to create the design system in

---

## 🌟 Pro Tips

**Tip 1: Save Your JSON Files**

Download JSON exports from the web app to build a library of design systems:

```
my-designs/
  ├── saas-dashboard.json
  ├── landing-page.json
  └── mobile-app.json
```

**Tip 2: Share with Team**

Send JSON exports to teammates - they can import without needing API keys!

**Tip 3: Iterate Quickly**

1. Export design system as JSON
2. Tweak colors/settings in JSON file
3. Re-import to Figma
4. See changes instantly

**Tip 4: Use Mock Data for Learning**

The mock data feature shows all visual features without API costs - perfect for:
- Learning the system
- Demos and presentations
- Testing before real analysis

---

## 📝 File Structure

```
design-system-generator/
├── ui.html              # Figma plugin (with Quick Import section)
├── code.js              # Figma plugin backend
├── manifest.json        # Plugin configuration
├── server/              # (Optional) Proxy server for AI in plugin
│   ├── server.js
│   └── package.json
├── WORKFLOW-GUIDE.md    # This file
└── SETUP-PROXY.md       # Proxy setup (for old workflow)
```

Web app:
```
/Users/quinniechen/Downloads/figma-variable-updater/
└── test-ai-analysis.html  # Web app with export feature
```

---

## 🎉 Summary

**New Elegant Workflow**:
1. 🌐 **Web App**: Analyze → Preview → Export JSON
2. 🎨 **Figma Plugin**: Import JSON → Review → Generate

**Why It's Better**:
- Cleaner separation of concerns
- No CORS/proxy complexity
- Shareable design systems
- Works offline once exported
- Faster iteration

**Getting Started**:
```bash
# Start web app
python3 -m http.server 8765

# Open browser
http://localhost:8765/test-ai-analysis.html

# Test with mock data (instant!)
# Or upload screenshot for AI analysis
# Export JSON → Import to Figma → Done!
```

---

**Questions?** See [SETUP-PROXY.md](SETUP-PROXY.md) for the alternative proxy-based workflow.

**Last Updated**: 2025-11-12
**Status**: ✅ **Production Ready!**
