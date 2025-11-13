# 🔄 Figma Plugin Reload Guide

## Why You Need This

When you update plugin code, **Figma doesn't automatically reload it**. You'll see old errors even though you fixed the code!

---

## 🚨 Signs You Need to Reload

- Errors for code you already fixed
- Missing functions that exist in the file
- Old UI showing instead of new UI
- Changes you made aren't appearing

---

## ✅ How to Reload (Choose One)

### Method 1: Restart Figma (Safest) ⭐

```
1. Close plugin window
2. Quit Figma Desktop App (Cmd+Q on Mac, Alt+F4 on Windows)
3. Reopen Figma
4. Run plugin again
```

**When to use:** After any code changes

---

### Method 2: Remove & Re-import

```
1. Close plugin window
2. Plugins → Development → Manage plugins
3. Find your plugin
4. Click "..." → Remove
5. Import again via manifest.json
```

**When to use:** If restart doesn't work

---

### Method 3: Hard Reload (Experimental)

```
1. With plugin open, press:
   - Mac: Cmd+Option+R
   - Windows: Ctrl+Alt+R
2. Or right-click in plugin UI → Reload
```

**When to use:** Quick fixes, may not always work

---

## 📋 Reload Checklist

After reloading, verify:

- [ ] UI loads without errors in console
- [ ] All functions are defined
- [ ] Your changes appear in UI
- [ ] Plugin functionality works

---

## 🐛 Common Issues

### "Function is not defined"
**Cause:** Old cached code
**Fix:** Restart Figma (Method 1)

### "Cannot read property of undefined"
**Cause:** Old UI with new code (or vice versa)
**Fix:** Remove and re-import (Method 2)

### Changes not appearing
**Cause:** Browser cache (Figma uses Chromium)
**Fix:** Full restart + clear cache in DevTools (F12)

---

## 💡 Pro Tips

### 1. Always Restart After Code Changes

```bash
# After editing plugin files:
git add .
git commit -m "fix: Updated plugin"
# → NOW restart Figma before testing
```

### 2. Use Console to Verify

Open DevTools in plugin:
- Mac: Cmd+Option+I
- Windows: Ctrl+Shift+I

Check:
```javascript
// Type in console to verify function exists:
typeof generateDesignSystem
// Should return: "function"
```

### 3. Watch for Cache Issues

If you keep seeing old code:
1. Completely quit Figma
2. Clear ~/Library/Caches/com.figma.Desktop (Mac)
3. Restart computer if needed

---

## 🔧 Development Workflow

**Best practice workflow:**

```
1. Edit plugin files
   ↓
2. Save files
   ↓
3. git commit (optional but recommended)
   ↓
4. QUIT FIGMA COMPLETELY
   ↓
5. Reopen Figma
   ↓
6. Test plugin
   ↓
7. Repeat
```

**DON'T DO THIS:**
```
❌ Edit file → Test immediately (won't see changes!)
❌ Keep Figma open while editing
❌ Assume hot reload works (it doesn't!)
```

---

## 🎯 Quick Reference

| Scenario | Solution |
|----------|----------|
| Just updated code | Restart Figma |
| Function not found | Restart Figma |
| UI not updating | Remove & re-import |
| Still broken | Clear cache + restart |
| Nothing works | Check console for real errors |

---

## 📝 Remember

**Figma caches plugin code for performance.**

This is NORMAL behavior, not a bug.

**Always restart Figma after code changes!**

---

## ✨ After Successful Reload

You should see:
- ✅ Updated UI
- ✅ New functionality
- ✅ No "not defined" errors
- ✅ Plugin works as expected

---

**Save this guide for future reference!** 🔖
