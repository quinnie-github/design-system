# Manifest Naming Fix - Preventing Plugin Errors

## Problem

Figma plugins were failing to load with the error:
```
Error: Manifest must be named 'manifest.json'
```

This occurred because:
1. Manifest files were incorrectly named (e.g., `manifest-chat-backup.json`)
2. Manifest files were in the root `figma-plugin/` directory instead of plugin subfolders
3. Test manifest files were left in the project

## Solution

### 1. Proper Plugin Structure

Each plugin must be in its own folder with a `manifest.json` file:

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

### 2. Validation Script

Added `scripts/validate-manifests.js` to check for:
- ✅ All manifests are named `manifest.json`
- ✅ All manifests are in plugin subfolders
- ✅ No incorrectly named manifest files in root
- ✅ All plugin folders have a manifest.json

### 3. Build Integration

The validation script runs automatically during build:
```bash
npm run build  # Runs validate-manifests first
```

Or run manually:
```bash
npm run validate-manifests
```

## Changes Made

1. **Created `figma-plugin/chat/` folder** with proper structure
2. **Moved chat plugin files** to the chat folder
3. **Renamed `manifest-chat-backup.json`** to `manifest.json`
4. **Removed test manifest files**:
   - `minimal-test-manifest.json`
   - `simple-manifest.json`
   - `test-manifest.json`
5. **Added validation script** to prevent future issues
6. **Updated build process** to validate manifests

## How to Avoid This in the Future

### ✅ DO:
- Always name manifest files `manifest.json`
- Put each plugin in its own subfolder
- Run `npm run validate-manifests` before committing
- Use the validation script in CI/CD

### ❌ DON'T:
- Name manifests anything other than `manifest.json`
- Put manifest files in the root `figma-plugin/` directory
- Leave test/backup manifest files in the project
- Skip validation before building

## Updated Plugin Paths

### Chat Plugin (Design System GPT)
```
figma-plugin/chat/manifest.json
```

### Variable Updater
```
figma-plugin/variable-updater/manifest.json
```

### Token Sync
```
figma-plugin/token-sync/manifest.json
```

## Testing

After fixing, verify:
1. Run `npm run validate-manifests` - should pass ✅
2. Install plugins in Figma - should load without errors ✅
3. Check console - no "Manifest must be named" errors ✅

---

**Status**: ✅ Fixed
**Date**: 2025-01-28

