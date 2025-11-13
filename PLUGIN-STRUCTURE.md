# Plugin Structure Guide

## ✅ Correct Plugin Structure

Each plugin **must** be in its own folder with a `manifest.json` file:

```
figma-plugin/
├── chat/
│   ├── manifest.json          ← Must be named exactly this
│   ├── chat-plugin.js
│   └── chat-ui.html
├── variable-updater/
│   ├── manifest.json          ← Must be named exactly this
│   ├── figma-variable-updater-plugin.js
│   └── ui.html
└── token-sync/
    ├── manifest.json          ← Must be named exactly this
    ├── token-sync-plugin.js
    └── ui.html
```

## ❌ Common Mistakes

### 1. Wrong Manifest Name
```
❌ figma-plugin/manifest-chat-backup.json
❌ figma-plugin/chat-plugin-manifest.json
❌ figma-plugin/manifest.json (in root)
✅ figma-plugin/chat/manifest.json
```

### 2. Manifest in Root Directory
```
❌ figma-plugin/manifest.json
✅ figma-plugin/chat/manifest.json
```

### 3. Multiple Manifests in One Folder
```
❌ figma-plugin/chat/
    ├── manifest.json
    ├── manifest-backup.json
    └── manifest-old.json
✅ figma-plugin/chat/
    └── manifest.json
```

## 🔍 Validation

Run validation before building:
```bash
npm run validate-manifests
```

This checks:
- ✅ All manifests are named `manifest.json`
- ✅ All manifests are in plugin subfolders
- ✅ No incorrectly named manifest files
- ✅ All plugin folders have a manifest.json

## 📝 Best Practices

1. **One plugin = One folder**
   - Each plugin gets its own subfolder
   - All plugin files go in that folder

2. **Always name it `manifest.json`**
   - Never use backup names
   - Never use descriptive names
   - Always exactly `manifest.json`

3. **Keep it clean**
   - Remove test/backup manifest files
   - Don't leave old manifests around

4. **Validate before committing**
   - Run `npm run validate-manifests`
   - Fix any errors before pushing

## 🚀 Quick Reference

### Current Plugins

| Plugin | Path |
|--------|------|
| Design System GPT Chat | `figma-plugin/chat/manifest.json` |
| Variable Updater | `figma-plugin/variable-updater/manifest.json` |
| Token Sync | `figma-plugin/token-sync/manifest.json` |

### Installing a Plugin

1. Open Figma Desktop App
2. Plugins → Development → Import plugin from manifest
3. Select the `manifest.json` file from the plugin's folder
4. Done! ✅

---

**Remember**: Figma requires `manifest.json` to be exactly that name, in a plugin subfolder!

