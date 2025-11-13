# 🚀 Setup Guide: Picking Up This Project

## Quick Start (5 minutes)

If you're picking up this project from terminal using Cursor, follow these steps:

### 1. Navigate to Project
```bash
cd /Users/quinniechen/Downloads/figma-variable-updater
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Knowledge Base
```bash
npm run build
```

### 4. Verify Setup
```bash
npm run ds-gpt status
```

**That's it!** ✅ You're ready to work on the project.

---

## Project Structure

```
figma-variable-updater/
├── figma-plugin/          # Figma plugins (Variable Updater, Token Sync, Chat)
│   ├── variable-updater/  # Main plugin: Update design system colors
│   ├── token-sync/        # Main plugin: Extract tokens from Figma
│   └── chat-plugin.js     # Chat interface (in progress)
├── scripts/               # Core TypeScript scripts
│   ├── sync-figma-to-tokens.ts
│   ├── audit-tokens.ts
│   ├── build-knowledge-base.ts
│   └── map-component-tokens.ts
├── cli/                   # CLI tool
│   └── ds-gpt.ts
├── docs/                  # Documentation & knowledge base
│   ├── rules/             # YAML design rules
│   └── generated/         # Generated JSON knowledge base
└── src/                   # Generated outputs
    ├── styles/            # CSS tokens
    └── components/        # Component code
```

---

## Available Commands

### Development
```bash
# Build knowledge base
npm run build

# Sync tokens from Figma
npm run sync

# Audit tokens
npm run audit

# Build knowledge base only
npm run build-knowledge

# Map component tokens
npm run map-components
```

### CLI Tool
```bash
# Show status
npm run ds-gpt status

# Sync tokens
npm run ds-gpt sync

# Audit tokens
npm run ds-gpt audit

# Build knowledge base
npm run ds-gpt build

# Get help
npm run ds-gpt help
```

---

## Testing Plugins in Figma

### Install Variable Updater
1. Open Figma Desktop App
2. Plugins → Development → Import plugin from manifest
3. Select: `figma-plugin/variable-updater/manifest.json`

### Install Token Sync
1. Plugins → Development → Import plugin from manifest
2. Select: `figma-plugin/token-sync/manifest.json`

---

## Development Workflow

### Making Changes to Plugins

1. **Edit Plugin Code:**
   - Variable Updater: `figma-plugin/variable-updater/figma-variable-updater-plugin.js`
   - Token Sync: `figma-plugin/token-sync/token-sync-plugin.js`
   - UI: `figma-plugin/*/ui.html`

2. **Test in Figma:**
   - Reload plugin in Figma (right-click plugin → Reload)
   - Test functionality

3. **No Build Step Required:**
   - Figma plugins run directly from source files
   - Just save and reload in Figma

### Making Changes to Scripts

1. **Edit TypeScript:**
   - Scripts: `scripts/*.ts`
   - CLI: `cli/ds-gpt.ts`

2. **Run Scripts:**
   - Use `npm run` commands (they use `tsx` to run TypeScript directly)
   - No compilation needed

### Making Changes to Knowledge Base

1. **Edit YAML Rules:**
   - Edit: `docs/rules/*.yaml`
   - Run: `npm run build-knowledge`
   - Output: `docs/generated/design-system-knowledge.json`

---

## Key Files to Know

### Plugin Files
- `figma-plugin/variable-updater/manifest.json` - Variable Updater config
- `figma-plugin/token-sync/manifest.json` - Token Sync config
- `figma-plugin/variable-updater/ui.html` - Variable Updater UI
- `figma-plugin/token-sync/ui.html` - Token Sync UI

### Core Scripts
- `scripts/sync-figma-to-tokens.ts` - Sync Figma variables to CSS
- `scripts/build-knowledge-base.ts` - Build knowledge base from YAML
- `scripts/audit-tokens.ts` - Validate tokens

### Documentation
- `README.md` - Main project documentation
- `GAP-ANALYSIS.md` - Gap analysis (vision vs current)
- `QUICK-START.md` - Quick start guide
- `PLUGIN-SETUP.md` - Plugin setup guide

---

## Requirements

- **Node.js:** >= 18.0.0
- **npm:** Latest version
- **Figma Desktop App:** For testing plugins

---

## Troubleshooting

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Scripts Not Running
```bash
# Check Node version
node --version  # Should be >= 18.0.0

# Check if tsx is installed
npx tsx --version
```

### Plugins Not Loading in Figma
1. Make sure you're using Figma Desktop App (not browser)
2. Check manifest.json path is correct
3. Check browser console for errors (Plugins → Development → Open Console)

---

## Next Steps

1. **Read the Gap Analysis:**
   - See `GAP-ANALYSIS.md` for what needs to be built

2. **Understand Current Features:**
   - Variable Updater: Updates design system colors
   - Token Sync: Extracts tokens from Figma
   - Chat Plugin: UI exists, needs AI integration

3. **Pick a Feature to Build:**
   - Use Case 1a: Website Analysis → Figma (P0)
   - Use Case 3: PM Chat + Knowledge Cards (P0)
   - Use Case 1b: Design System Cleanup (P1)

---

## Environment Setup

### No Environment Variables Needed
- No API keys required for basic functionality
- Plugins work offline
- Token Sync can connect to local API (optional)

### Optional: API Integration
If you want to use Token Sync with an API:
- Set up API at `http://localhost:3000`
- Token Sync will sync to this endpoint

---

## Git Setup (If Needed)

If you want to version control this:

```bash
# Initialize git (if not already done)
git init

# Create .gitignore
cat > .gitignore << EOF
node_modules/
*.log
.DS_Store
dist/
build/
*.env
*.env.local
EOF

# Add files
git add .
git commit -m "Initial commit"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Build knowledge base | `npm run build` |
| Test Variable Updater | Open Figma → Import `figma-plugin/variable-updater/manifest.json` |
| Test Token Sync | Open Figma → Import `figma-plugin/token-sync/manifest.json` |
| Run CLI | `npm run ds-gpt status` |
| Sync tokens | `npm run sync` |
| Audit tokens | `npm run audit` |

---

**You're all set!** 🎉

Start by reading `GAP-ANALYSIS.md` to understand what needs to be built, then pick a feature and start coding!

