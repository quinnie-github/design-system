# 🎉 DS-GPT Token Sync Plugin - Setup Instructions

Your Figma plugin is ready to sync tokens with Design System GPT!

## ✅ What I Created

1. **token-sync-plugin.js** - Main plugin code that extracts Figma Variables
2. **token-sync-ui.html** - Beautiful UI for the plugin
3. **token-sync-manifest.json** - Plugin configuration file

## 🚀 How to Install in Figma

### Step 1: Open Figma Desktop App
**Important**: Must be the desktop app, not browser!

### Step 2: Import the Plugin
1. In Figma, go to **Plugins** → **Development** → **Import plugin from manifest...**
2. Navigate to and select:
   ```
   /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/token-sync-manifest.json
   ```
3. Click **Open**

### Step 3: Run the Plugin!
1. Right-click on canvas → **Plugins** → **DS-GPT Token Sync**
2. Or go to: **Plugins** menu → **DS-GPT Token Sync**

## 🎨 How to Use

### 1. Extract Tokens
- Click **"Extract Tokens from Figma"** button
- The plugin will read all your Figma Variables
- You'll see a summary of extracted tokens

### 2. Sync to API
- Make sure your API is running at `http://localhost:3000`
- (It should already be running from earlier!)
- Click **"Sync to API"** button
- Success! ✅ Your tokens are now in the system

### 3. Rebuild Tokens
After syncing, go back to terminal and run:
```bash
cd /Users/quinniechen/design-system-gpt/packages/tokens
npm run build
```

Your custom tokens will be generated in all 5 formats!

## 📝 Tips

- **No Variables yet?** Create some test Variables in Figma first
- **API not responding?** Check that the server is still running
- **Want offline backup?** Click "Download JSON" to save tokens locally

## 🔧 Troubleshooting

### Plugin won't load
- Make sure you selected the correct manifest file: `token-sync-manifest.json`
- Try removing and re-importing the plugin

### Can't sync to API
- Verify API is running: `curl http://localhost:3000/health`
- Check that the URL in the plugin is correct: `http://localhost:3000`

### No tokens extracted
- Make sure you have Variables (not just Styles) in your Figma file
- Variables should be in the current file (not from a library)

---

## ✨ You're All Set!

1. ✅ API Server is running
2. ✅ Plugin files are created
3. ✅ Ready to sync tokens!

**Next step**: Import the plugin in Figma and try it out! 🚀
