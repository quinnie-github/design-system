# Design System GPT

An intelligent design system manager that bridges Figma, tokens, and code - enabling conversational component discovery, safe token syncing, and UI consistency across development cycles.

## 🚀 Features

### Phase 1: Foundation (✅ Complete)
- **Token Intelligence Core** - Enhanced Figma → Code sync with validation
- **Design System Knowledge Base** - YAML-based rules converted to AI-consumable JSON
- **Component Token Mapping** - Track which components use which tokens
- **Comprehensive Auditing** - Detect unused tokens, naming issues, and contrast violations

### Phase 2: Conversational Layer (🚧 In Progress)
- **AI Chat Interface** - Chat with your design system inside Figma
- **Component Suggestion Engine** - AI recommends existing components or identifies gaps
- **Design Assembly Bot** - Auto-compose layouts from existing components

### Phase 3: Production Sync & Lock (📋 Planned)
- **Component Lock System** - Mark tokenized components as production-safe
- **Code Generation Templates** - Export components as React/Tailwind code
- **Sync Workflow Integration** - One command to sync everything

### Phase 4: Product Package (📋 Planned)
- **Standalone Plugin Package** - For non-Cursor users
- **Export Package for Developers** - Download sync scripts + token files
- **Monetization Setup** - License system and usage analytics

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/design-system-gpt.git
cd design-system-gpt

# Install dependencies
npm install

# Build the knowledge base
npm run build
```

## 📖 Usage

### CLI Commands

```bash
# Sync tokens from Figma to code
npm run ds-gpt sync

# Audit design tokens for issues
npm run ds-gpt audit

# Build knowledge base and component mappings
npm run ds-gpt build

# Show design system status
npm run ds-gpt status

# Get help
npm run ds-gpt help
```

### Figma Plugin

1. Open Figma
2. Go to Plugins → Development → Import plugin from manifest
3. Select the manifest file for the plugin you want:
   - `figma-plugin/chat/manifest.json` for Design System GPT Chat
   - `figma-plugin/variable-updater/manifest.json` for Variable Updater
   - `figma-plugin/token-sync/manifest.json` for Token Sync
4. Run the plugin
5. Start using your design system!

## 🏗️ Architecture

### Core Components

```
design-system-gpt/
├── figma-plugin/           # Figma plugin files
│   ├── chat-ui.html        # Chat interface
│   ├── chat-plugin.js      # Plugin logic
│   └── manifest.json       # Plugin manifest
├── scripts/                # Core scripts
│   ├── sync-figma-to-tokens.ts    # Token sync engine
│   ├── audit-tokens.ts            # Token validation
│   ├── build-knowledge-base.ts    # Knowledge base builder
│   ├── map-component-tokens.ts    # Component mapper
│   └── token-validator.ts         # Validation utilities
├── docs/                   # Documentation
│   ├── rules/              # YAML rule definitions
│   └── generated/          # Generated knowledge base
├── cli/                    # Command-line interface
│   └── ds-gpt.ts          # Main CLI
└── src/                    # Generated outputs
    ├── styles/            # CSS token files
    └── components/        # Generated component code
```

### Knowledge Base Structure

The system uses a multi-layered knowledge base:

1. **YAML Rules** (`docs/rules/`) - Human-readable design rules
2. **JSON Knowledge Base** (`docs/generated/`) - AI-consumable format
3. **Component Token Map** (`docs/component-token-map.json`) - Component dependencies
4. **AI Context** (`docs/generated/ai-context.json`) - Condensed for AI

## 🎨 Design System Rules

### Color System
- **Brand Colors** - Primary, secondary, accent
- **KPI Colors** - Positive, negative, warning, neutral
- **Surface Colors** - Base, elevated, overlay, interactive
- **Text Colors** - Primary, secondary, tertiary, inverse
- **Interactive Colors** - Hover, active, disabled states

### Spacing System
- **Scale** - xs (4px) to 3xl (64px)
- **Categories** - Component internal, external, layout
- **Responsive** - Mobile, tablet, desktop multipliers

### Typography System
- **Font Families** - Inter (primary), JetBrains Mono (code)
- **Scale** - xs (12px) to 6xl (60px)
- **Weights** - Regular (400) to Bold (700)
- **Line Heights** - Tight (1.25) to Relaxed (1.75)

### Component System
- **Layout** - Container, Grid, Stack, Flex, Spacer
- **Navigation** - Header, Navigation, Breadcrumb, Pagination, Tabs
- **Forms** - Input, Textarea, Select, Checkbox, Radio, Button
- **Data Display** - Card, Table, List, Badge, Tag, Avatar, KPI
- **Feedback** - Alert, Toast, Modal, Tooltip, Progress, Spinner

## 🔧 Configuration

### Figma Sync Configuration

Edit `scripts/figma-sync.config.json`:

```json
{
  "figma": {
    "collection": "Tokens",
    "fileHint": "Design System GPT base"
  },
  "paths": {
    "tokensCss": "src/styles/tokens.css",
    "themeCss": "src/styles/theme.css",
    "backupDir": "scripts/backups"
  },
  "prefix": "pi",
  "modes": {
    "light": "Light",
    "dark": "Dark"
  },
  "types": {
    "color": ["color.", "kpi.", "brand.", "surface.", "text."],
    "number": ["radius.", "space.", "elevation.", "opacity."],
    "string": ["font."]
  },
  "tailwind": {
    "writeTheme": true,
    "colorKeys": ["primary","success","warning","danger","info","surface","foreground"],
    "radiusKeys": ["md","lg","xl","2xl"]
  }
}
```

## 🧪 Testing

```bash
# Run token audit
npm run audit

# Test sync (dry run)
SYNC_DRY_RUN=1 npm run sync

# Build and test everything
npm run build
npm run ds-gpt status
```

## 📊 Generated Files

### CSS Tokens
- `src/styles/tokens.css` - CSS custom properties
- `src/styles/theme.css` - Tailwind theme configuration

### Knowledge Base
- `docs/generated/design-system-knowledge.json` - Full knowledge base
- `docs/generated/design-system-guide.md` - Human-readable guide
- `docs/generated/ai-context.json` - AI context

### Component Mapping
- `docs/component-token-map.json` - Component dependencies
- `docs/component-token-report.md` - Usage report

### Backups
- `scripts/backups/` - Token change backups
- `scripts/backups/changelog.*.md` - Change logs

## 🤖 AI Integration

The system is designed to work with OpenAI's GPT models:

1. **Knowledge Base** - Provides context about design rules and tokens
2. **Component Mapping** - Shows which components use which tokens
3. **Chat Interface** - Natural language interaction with design system
4. **Suggestion Engine** - AI-powered component recommendations

### Example Queries

- "What component should I use for displaying KPIs?"
- "Show me all components using Brand Primary"
- "How do I display a success state?"
- "What tokens should a new card component use?"
- "Create a dashboard layout with metrics"

## 🚀 Roadmap

### Phase 1: Foundation ✅
- [x] Enhanced token sync with validation
- [x] Design system knowledge base
- [x] Component token mapping
- [x] Comprehensive auditing system

### Phase 2: Conversational Layer 🚧
- [x] Chat interface UI
- [x] Basic plugin logic
- [ ] OpenAI API integration
- [ ] Component suggestion engine
- [ ] Design assembly bot

### Phase 3: Production Sync & Lock 📋
- [ ] Component lock system
- [ ] Code generation templates
- [ ] Sync workflow integration
- [ ] Git integration

### Phase 4: Product Package 📋
- [ ] Standalone plugin package
- [ ] Export package system
- [ ] License and payment system
- [ ] Usage analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Figma Plugin API](https://www.figma.com/plugin-docs/) for the plugin framework
- [OpenAI API](https://openai.com/api/) for AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Commander.js](https://github.com/tj/commander.js) for CLI interface

## 📞 Support

- 📧 Email: support@designsystemgpt.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/design-system-gpt/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/design-system-gpt/discussions)

---

**Made with ❤️ for design systems that scale**
