# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Installation (2 minutes)

### 1. Install Proxy Server

```bash
cd design-system-generator-v2/proxy-server
npm install
```

### 2. Get Claude API Key

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys
4. Create a new key
5. Copy the key (starts with `sk-ant-api03-...`)

### 3. Install Figma Plugin

1. Open Figma
2. **Plugins** → **Development** → **Import plugin from manifest...**
3. Select: `design-system-generator-v2/figma-plugin/manifest.json`
4. Done!

---

## 🎯 First Run (3 minutes)

### Step 1: Start Proxy Server (30 seconds)

```bash
cd design-system-generator-v2/proxy-server
npm start
```

✅ You should see:
```
╔════════════════════════════════════════════════════════════╗
║  Design System Generator v2.0 - Proxy Server              ║
╚════════════════════════════════════════════════════════════╝

✅ Server running on http://localhost:3002
```

**Keep this terminal open!**

### Step 2: Open Web App (30 seconds)

```bash
# Open in browser (or double-click the file)
open design-system-generator-v2/web-app/index.html
```

### Step 3: Analyze a Design (1 minute)

1. **Enter API Key**: Paste your Claude API key
2. **Upload Screenshot**: Drag & drop a design screenshot
   - Try with a landing page or UI design
   - PNG, JPG, or WebP (< 5MB)
3. **Click "Analyze Design"**: Wait 20-30 seconds
4. **Review Results**: Check colors, typography, spacing, buttons
5. **Download JSON**: Click "💾 Download JSON"

### Step 4: Generate in Figma (1 minute)

1. **Open Figma**
2. **Run Plugin**: Plugins → Development → Design System Generator v2.0
3. **Import JSON**: Click "📁 Choose JSON File" and select your downloaded file
4. **Click "Import & Validate"**: Review the summary
5. **Click "Generate Design System"**: Wait 5-10 seconds
6. **Done!** 🎉 Your design system is ready!

---

## ✅ Success Checklist

After completing the Quick Start, you should have:

- [ ] Proxy server running on port 3002
- [ ] Web app open in browser with API key entered
- [ ] A design screenshot analyzed successfully
- [ ] JSON file downloaded
- [ ] Figma plugin installed
- [ ] New Figma page with design system generated
- [ ] Variables created in Figma
- [ ] Components generated

---

## 🎨 What You'll See in Figma

After generation, your Figma file will have:

1. **New Page**: "[Your System Name]"
2. **Variables Collection**: Color and spacing variables
3. **Color Palette**: Visual display of all colors
4. **Components**: Button variants and other UI elements
5. **Organized Layout**: Everything neatly arranged

---

## 🐛 Common Issues

### "Server not running"
**Solution**: Make sure proxy server is started (`npm start` in proxy-server/)

### "Invalid API key"
**Solution**:
- Get new key from [console.anthropic.com](https://console.anthropic.com/)
- Make sure to copy entire key (starts with `sk-ant-api03-`)
- Check for extra spaces

### "No results from analysis"
**Solution**:
- Try with a clearer design screenshot
- Make sure image is < 5MB
- Verify proxy server is running
- Check browser console for errors

### "Plugin won't load in Figma"
**Solution**:
- Verify you selected `manifest.json` file
- Restart Figma
- Check all plugin files exist (manifest.json, code.js, ui.html)

---

## 📚 Next Steps

Once you've completed the Quick Start:

1. **Read the full README**: `design-system-generator-v2/README.md`
2. **Try different designs**: Landing pages, dashboards, mobile apps
3. **Experiment with options**: Turn analysis options on/off
4. **Customize components**: Edit generated Figma components
5. **Share with team**: Export JSON and share via Git

---

## 💡 Pro Tips

- **Use high-quality screenshots**: 1920x1080 or higher for best results
- **Analyze sections separately**: Hero, features, footer for more control
- **Name your systems**: Use descriptive names like "Acme SaaS Design System"
- **Review before generating**: Check JSON in web app before importing to Figma
- **Keep JSON files**: Save them for version control and sharing

---

## 🎉 That's It!

You're now ready to transform any design into a professional Figma design system!

**Questions?** Check the [README](README.md) or [Troubleshooting](README.md#troubleshooting) section.

Happy designing! 🎨
