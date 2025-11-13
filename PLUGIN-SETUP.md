# Design System GPT - Plugin Setup Guide

Complete guide to installing and using both plugins for your multi-client design system workflow.

---

## 🎨 What You Have: Two Powerful Plugins

### **Plugin 1: Variable Updater**
Update Figma design system with client brand colors

### **Plugin 2: Token Sync**
Extract tokens from Figma and sync to code

---

## 📦 Installation

### Step 1: Install Variable Updater

1. **Open Figma Desktop App**

2. **Go to Plugins:**
   - Menu → Plugins → Development → Import plugin from manifest...

3. **Select manifest:**
   ```
   /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/variable-updater/manifest.json
   ```

4. **Plugin installed!**
   - Access via: Plugins → Development → Variable Updater

---

### Step 2: Install Token Sync

1. **In Figma, go to Plugins:**
   - Menu → Plugins → Development → Import plugin from manifest...

2. **Select manifest:**
   ```
   /Users/quinniechen/Downloads/figma-variable-updater/figma-plugin/token-sync/manifest.json
   ```

3. **Plugin installed!**
   - Access via: Plugins → Development → DS-GPT Token Sync

---

## 🚀 Complete Multi-Client Workflow

### Scenario: Creating Design System for New Client "Acme Corp"

---

### **Phase 1: Create & Brand the Design System (Variable Updater)**

#### Step 1.1: Duplicate Your Base Design System

```
In Figma:
1. Open your base design system file (e.g., "profit-intelligence")
2. File → Duplicate
3. Rename to: "acme-corp"
```

#### Step 1.2: Update Brand Colors

```
1. Open "acme-corp" file
2. Plugins → Variable Updater
3. Choose method:

   Option A - Quick Presets:
   - Click a preset (Modern Tech, Corporate Blue, etc.)
   - Click "Update Design System"

   Option B - Custom Colors:
   - Paste client's brand colors:
     • Primary: #ff6b6b
     • Secondary: #4ecdc4
     • Accent: #95e1d3
   - Click "Update Design System"
```

**Result:**
- ✅ All Figma Variables updated
- ✅ All components now use Acme's colors
- ✅ Design system fully branded in 30 seconds!

---

### **Phase 2: Extract to Code (Token Sync)**

#### Step 2.1: Extract Tokens

```
1. Still in "acme-corp" file
2. Plugins → DS-GPT Token Sync
3. Click "Extract Tokens from Figma"
4. Wait for extraction (2-3 seconds)
```

**You'll see:**
- Total tokens: ~2,300+
- Client ID: auto-detected as "acme-corp"
- Breakdown by type (color, spacing, etc.)

#### Step 2.2: Sync to API

```
1. Verify Client ID: "acme-corp" (auto-filled)
2. API Endpoint: http://localhost:3000
3. Click "Sync to API"
```

**Result:**
- ✅ Tokens saved to: `tokens/clients/acme-corp.json`
- ✅ Also saved to legacy: `tokens/tokens.json`

#### Step 2.3: Build Tokens

```bash
# In terminal:
cd /Users/quinniechen/design-system-gpt/packages/tokens
npm run build
```

**Result:**
```
dist/clients/acme-corp/
├── css/variables.css
├── scss/variables.scss
├── ts/tokens.ts
├── js/tokens.js
└── json/tokens.json
```

---

### **Phase 3: Use in Your App**

```html
<!-- Import Acme Corp theme -->
<link rel="stylesheet" href="@ds-gpt/tokens/dist/clients/acme-corp/css/variables.css">

<!-- Your app -->
<div data-theme="acme-corp">
  <button class="btn-primary">Uses Acme colors!</button>
</div>
```

```css
/* Components automatically use client colors */
.btn-primary {
  background: var(--brand-primary); /* #ff6b6b for Acme */
  color: white;
}
```

---

## 🎯 Quick Reference

### Variable Updater - When to Use

```
✅ You have a new client
✅ You want to rebrand a design system
✅ You need to test different color palettes
✅ You're creating design mockups for pitch

Example:
"Client wants to see their brand in our design system"
→ Use Variable Updater
```

### Token Sync - When to Use

```
✅ You updated tokens in Figma
✅ You need to deploy new design
✅ You want tokens in code
✅ You're setting up a new client's codebase

Example:
"I updated spacing in Figma, need it in code"
→ Use Token Sync
```

---

## 💡 Pro Tips

### Tip 1: Create Template File

```
Create: "base-design-system-template.fig"
- All your components
- Generic color names (Brand Primary, Brand Secondary)
- Reusable for all clients

For each new client:
1. Duplicate template
2. Rename to client name
3. Use Variable Updater to apply their colors
4. Use Token Sync to extract
```

### Tip 2: Brand Guidelines Document

```
Keep a spreadsheet:

Client Name | Primary | Secondary | Accent | Figma File | Status
Acme Corp   | #ff6b6b | #4ecdc4   | #95e1d3 | acme-corp.fig | ✅ Live
TechStart   | #667eea | #764ba2   | #f093fb | techstart.fig | 🚧 Draft
```

### Tip 3: Testing Before Client Call

```
Before showing client:
1. Variable Updater: Apply their colors
2. Create sample pages
3. Share Figma link
4. Get feedback
5. Adjust if needed
6. Token Sync: Extract to code
```

### Tip 4: Batch Updates

```
Need to update font across all clients?
1. Update base template
2. For each client file:
   - Open file
   - Variable Updater → Load client colors
   - Update (maintains their colors, updates fonts)
   - Token Sync → Extract
```

---

## 🔧 Troubleshooting

### Issue: "Primitives collection not found"

**Solution:**
```
Variable Updater needs a "Primitives" collection.

In Figma:
1. Right panel → Variables
2. Create collection named "Primitives"
3. Add some color variables
4. Run Variable Updater again
```

### Issue: "No tokens extracted"

**Solution:**
```
Token Sync needs Figma Variables.

In Figma:
1. Right panel → Variables
2. Verify you have variables defined
3. If not, create some:
   - Colors, spacing, typography, etc.
4. Run Token Sync again
```

### Issue: "API sync failed"

**Solution:**
```bash
# Make sure API is running:
cd /Users/quinniechen/design-system-gpt/apps/api
npm run dev

# Should see: "Server running on http://localhost:3000"

# Try sync again
```

### Issue: "Build failed"

**Solution:**
```bash
# Check if tokens exist:
ls packages/tokens/tokens/clients/

# Rebuild:
cd packages/tokens
npm run build

# Check for TypeScript errors
npm run build -- --client=acme-corp
```

---

## 📊 Expected Results

### After Variable Updater:

```
✅ Figma Variables updated
✅ Components reflect new colors
✅ Design system fully branded
⏱️  Time: ~30 seconds
```

### After Token Sync:

```
✅ Tokens extracted from Figma
✅ Saved to JSON
✅ Ready for build
⏱️  Time: ~5 seconds
```

### After Build:

```
✅ CSS generated with client scope
✅ SCSS, TS, JS files created
✅ Ready for import in apps
⏱️  Time: ~2-3 seconds
```

---

## 🎓 Video Tutorial (Coming Soon)

We'll record a screencast showing:
1. Duplicating base file
2. Using Variable Updater
3. Extracting with Token Sync
4. Building and deploying
5. Using in a live app

---

## ✅ Success Checklist

Before considering setup complete, verify:

- [ ] Variable Updater plugin installed
- [ ] Token Sync plugin installed
- [ ] API server runs without errors
- [ ] Can update colors in Figma
- [ ] Can extract tokens
- [ ] Can sync to API
- [ ] Can build tokens
- [ ] Can see generated CSS files
- [ ] Tested with at least one client

---

## 🆘 Need Help?

**Plugin not showing up?**
- Restart Figma Desktop App
- Check manifest path is correct
- Make sure files exist at specified paths

**Changes not reflecting?**
- Hard refresh Figma (Cmd+Shift+R)
- Close and reopen plugin
- Check for JavaScript errors in dev console

**Still stuck?**
- Check `/Users/quinniechen/design-system-gpt/MULTI-CLIENT-IMPLEMENTATION-COMPLETE.md`
- Review `/Users/quinniechen/design-system-gpt/examples/real-tokens-demo/README.md`

---

## 🚀 You're Ready!

With both plugins installed, you now have a **complete multi-client design system workflow**:

```
New Client → Duplicate → Brand → Extract → Build → Deploy
            (30 sec)   (30 sec)  (5 sec)  (3 sec)  (Done!)
```

**Total time per client: ~2-3 minutes** ⚡

Happy designing! 🎨
