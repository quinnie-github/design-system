# 🚀 Installation & Setup Guide

Complete guide to get Design System Generator v2.0 Enhanced up and running in 10 minutes.

---

## 📋 Prerequisites

- **Figma Desktop App** (required for plugin development)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Claude API Key** (optional, only needed for web app)

---

## Option 1: Install Plugin Only (Quickest - 3 minutes)

This is perfect if you want to use Claude.ai directly to generate JSON.

### Step 1: Open Plugin Folder

Navigate to:
```
figma-variable-updater/design-system-generator-v2/figma-plugin-enhanced/
```

You'll see:
- `manifest.json` ← Import this
- `code.js` ← Plugin logic
- `ui.html` ← Plugin interface

### Step 2: Install in Figma

1. Open **Figma Desktop App**
2. Click: **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to `figma-plugin-enhanced` folder
4. Select: **manifest.json**
5. Click: **Open**

✅ Done! Plugin installed.

### Step 3: Run the Plugin

1. In any Figma file, right-click
2. Go to: **Plugins** → **Development** → **Design System Generator v2.0 Enhanced**
3. The beautiful blue gradient UI will appear! 🎨

### Step 4: Get JSON from Claude.ai

1. Open [https://claude.ai](https://claude.ai) in a new tab
2. Upload your design screenshot
3. Use this prompt:

```
Analyze this design screenshot and create a comprehensive JSON design system.

Include:
- colors (primary, secondary, text, background, accent) with hex codes
- typography (font families, sizes in px, weights, line heights)
- spacing (scale like 4px, 8px, 16px, 24px, 32px, 48px, 64px)
- buttons (variants with names and descriptions)
- applicationInsights (type, purpose, targetAudience, designStyle, keyFeatures)
- gradients if any

Return valid JSON only.
```

4. Copy the JSON response

### Step 5: Generate Design System

1. Paste JSON into plugin
2. Review the preview
3. Click **"✨ Generate Design System"**
4. Watch it create your comprehensive design system!

---

## Option 2: Use Sample JSON (Testing - 2 minutes)

Perfect for trying out the plugin without Claude.ai.

### Step 1: Open Sample JSON

Navigate to:
```
figma-variable-updater/design-system-generator-v2/
```

Choose one:
- `sample-design-system.json` ← SaaS Product (comprehensive)
- `sample-ecommerce.json` ← E-Commerce store
- `sample-minimal.json` ← Portfolio website

### Step 2: Copy & Paste

1. Open the JSON file in a text editor
2. Copy all contents
3. Open plugin in Figma
4. Paste into the textarea
5. Click **"🔍 Validate JSON"** to preview
6. Click **"✨ Generate Design System"**

---

## Option 3: Full Setup with Web App (Complete - 10 minutes)

Use the web app to analyze designs and generate JSON automatically.

### Step 1: Set Up Proxy Server

1. Open Terminal
2. Navigate to proxy server:
```bash
cd design-system-generator-v2/proxy-server
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env` file:
```bash
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
echo "PORT=3002" >> .env
```

5. Get your Claude API key:
   - Go to [https://console.anthropic.com/](https://console.anthropic.com/)
   - Sign in or create account
   - Go to **Settings** → **API Keys**
   - Create new key
   - Copy and paste into `.env` file

6. Start server:
```bash
npm start
```

✅ Server running on http://localhost:3002

### Step 2: Open Web App

1. Navigate to:
```
design-system-generator-v2/web-app/
```

2. Open **START_HERE.html** in your browser
   - Double-click the file, OR
   - Right-click → Open With → Chrome/Firefox/Safari

### Step 3: Use Web App

1. Enter Claude API key (or leave blank if proxy server is running)
2. Upload design screenshot
3. Click **"Analyze Design"**
4. Wait for AI analysis (~10-30 seconds)
5. Review the generated JSON
6. Click **"Download JSON"**

### Step 4: Use JSON in Plugin

1. Open Figma plugin
2. Click **"📁 Upload JSON File"**
3. Select downloaded JSON
4. Generate!

---

## 🎨 What Gets Generated

When you run the plugin, Figma creates:

### 1. Application Insights (if provided)
- App type, purpose, target audience
- Design style description
- Key features list

### 2. Color Palette
- Organized swatches by category
- Hex codes displayed
- Figma variables created (optional)

### 3. Typography Scale
- Live examples at each font size
- Font families and weights
- Line heights

### 4. Spacing System
- Visual boxes showing actual spacing
- Easy reference guide

### 5. Component Library
- **4 Button variants**: Primary, Secondary, Outline, Ghost
- **2 Input states**: Default, Focus
- **2 Card types**: Feature, Product
- **3 Badge variants**: New, Popular, Sale

### 6. Usage Examples
- **Hero Section**: Heading + subheading + CTA
- **Form Layout**: Inputs + submit button

---

## 🔧 Troubleshooting

### Plugin doesn't appear in Figma

**Solution:**
1. Make sure you're using **Figma Desktop App** (not browser)
2. Check that you imported `manifest.json` from the correct folder
3. Try: Plugins → Development → Manage plugins → Restart

### JSON validation fails

**Common issues:**
- Missing required fields (`colors`, `typography`)
- Invalid JSON syntax (missing commas, quotes)
- Hex codes without `#` symbol

**Solution:**
1. Click **"🔍 Validate JSON"** to see specific error
2. Use sample JSON as reference
3. Validate JSON at [jsonlint.com](https://jsonlint.com)

### Proxy server won't start

**Solutions:**
1. Check port 3002 isn't already in use:
```bash
lsof -i :3002
```

2. Kill process if needed:
```bash
kill -9 <PID>
```

3. Try different port in `.env`:
```
PORT=3003
```

### Claude API errors

**Solutions:**
1. Verify API key is correct
2. Check account has credits: [console.anthropic.com](https://console.anthropic.com)
3. Check rate limits (5 requests/minute on free tier)

### Web app shows CORS errors

**Solution:**
This is why we have the proxy server! Make sure:
1. Proxy server is running (`npm start`)
2. Web app is set to use proxy (default)

### Generated design looks wrong

**Solutions:**
1. Check JSON has correct hex codes (with `#`)
2. Verify font sizes have units (`px`, not just numbers)
3. Ensure spacing values have units
4. Review preview before generating

---

## 💡 Tips & Best Practices

### For Best Results

1. **Use descriptive names** in your JSON
2. **Include application insights** for context
3. **Provide 3-5 colors per category** (not just 1)
4. **Include varied font sizes** (12px to 64px range)
5. **Test with sample JSON first** before analyzing real designs

### JSON Structure Tips

```json
{
  "colors": {
    "primary": ["#main", "#dark", "#darker"],  // ✅ Multiple shades
    "text": ["#heading", "#body", "#subtle"]    // ✅ Hierarchy
  },
  "typography": {
    "fontSizes": ["12px", "16px", "32px"],     // ✅ Units included
    "fontWeights": ["400", "600", "700"]        // ✅ Standard weights
  }
}
```

### Claude.ai Prompting Tips

- **Be specific** about what you need
- **Mention "return valid JSON only"** to avoid extra text
- **Include screenshot context** ("landing page", "dashboard", etc.)
- **Ask for application insights** for richer output

---

## 📚 Next Steps

### After Installation

1. **Try sample JSON** to see what the plugin creates
2. **Analyze your own designs** using Claude.ai
3. **Experiment with options** (variables, examples, insights)
4. **Customize generated systems** in Figma

### Advanced Usage

- **Create custom JSON templates** for your design style
- **Build a JSON library** for different project types
- **Integrate with your workflow** (Figma → JSON → Code)
- **Use with other plugins** (Variable Updater, Token Sync)

---

## 🆘 Need Help?

### Documentation

- **README.md** - Project overview
- **QUICK_START.md** - Fast setup
- **PROJECT_SUMMARY.md** - Technical details
- **figma-plugin-enhanced/README.md** - Plugin specifics

### Common Questions

**Q: Can I edit the generated design system?**
A: Yes! Everything is editable in Figma. The plugin just creates the initial structure.

**Q: Do I need the web app?**
A: No! You can use Claude.ai directly. The web app is optional for convenience.

**Q: Can I use my own fonts?**
A: Yes! Just specify them in the JSON `fontFamilies` array.

**Q: Does it work with Figma in browser?**
A: No, development plugins require the Desktop App. But once published, they work in browser too.

**Q: Can I customize the generated components?**
A: Yes! The plugin creates base components. Customize them however you like.

---

## ✅ Quick Checklist

Before generating your first design system:

- [ ] Figma Desktop App installed
- [ ] Plugin imported via manifest.json
- [ ] Plugin appears in Plugins → Development menu
- [ ] Have JSON ready (from Claude.ai or sample file)
- [ ] Reviewed JSON preview in plugin
- [ ] Clicked "✨ Generate Design System"
- [ ] See your comprehensive design system in Figma! 🎉

---

**Ready to create amazing design systems? Let's go! 🚀**
