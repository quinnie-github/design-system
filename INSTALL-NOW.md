# ✅ FIXED! Install Plugins Now

I've reorganized the files so both plugins work properly.

---

## 📁 New Structure

```
figma-plugin/
├── variable-updater/
│   ├── manifest.json                         ← Import this for Variable Updater
│   ├── figma-variable-updater-plugin.js
│   └── ui.html
│
└── token-sync/
    ├── manifest.json                         ← Import this for Token Sync
    ├── token-sync-plugin.js
    └── ui.html
```

---

## 🚀 Install Variable Updater

1. **Open Figma Desktop App**

2. **Import Plugin:**
   ```
   Menu → Plugins → Development → Import plugin from manifest...
   ```

3. **Navigate to and select:**
   ```
   /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/variable-updater/manifest.json
   ```

4. **Done!** ✅
   - Plugin appears as: "Variable Updater"
   - Access via: Plugins → Development → Variable Updater

---

## 🚀 Install Token Sync

1. **In Figma, Import Plugin:**
   ```
   Menu → Plugins → Development → Import plugin from manifest...
   ```

2. **Navigate to and select:**
   ```
   /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/token-sync/manifest.json
   ```

3. **Done!** ✅
   - Plugin appears as: "DS-GPT Token Sync"
   - Access via: Plugins → Development → DS-GPT Token Sync

---

## 🎉 That's It!

Both plugins are now installed and ready to use!

### Quick Test:

1. **Open any Figma file with variables**

2. **Test Variable Updater:**
   ```
   Plugins → Variable Updater
   Click a preset → Click "Update Design System"
   ```

3. **Test Token Sync:**
   ```
   Plugins → DS-GPT Token Sync
   Click "Extract Tokens from Figma"
   ```

---

## 📍 Remember These Paths:

**Variable Updater:**
```
/Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/variable-updater/manifest.json
```

**Token Sync:**
```
/Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/token-sync/manifest.json
```

---

## 💡 Why Two Folders?

Figma requires each plugin to have its own `manifest.json` file. Since we have two separate plugins, they need to be in separate folders. This is the standard way to manage multiple plugins.

---

**Ready to go! Try them now! 🚀**
