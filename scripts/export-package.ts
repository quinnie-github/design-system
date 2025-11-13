// Export Package System
// Creates a complete package for developers with tokens, scripts, and components

import fs from "node:fs/promises";
import path from "node:path";
// import { execa } from "execa"; // Commented out for testing

type ExportConfig = {
  outputDir: string;
  includeTokens: boolean;
  includeScripts: boolean;
  includeComponents: boolean;
  includeDocs: boolean;
  packageName: string;
  version: string;
  author: string;
  description: string;
};

class ExportPackageBuilder {
  private config: ExportConfig;
  private sourceDir: string;

  constructor(config: ExportConfig) {
    this.config = config;
    this.sourceDir = path.join(__dirname, '..');
  }

  async build() {
    try {
      console.log("📦 Building export package...");
      
      // Create output directory
      await this.createOutputDirectory();
      
      // Copy tokens
      if (this.config.includeTokens) {
        await this.copyTokens();
      }
      
      // Copy scripts
      if (this.config.includeScripts) {
        await this.copyScripts();
      }
      
      // Copy components
      if (this.config.includeComponents) {
        await this.copyComponents();
      }
      
      // Copy documentation
      if (this.config.includeDocs) {
        await this.copyDocumentation();
      }
      
      // Generate package.json
      await this.generatePackageJson();
      
      // Generate README
      await this.generateReadme();
      
      // Generate setup script
      await this.generateSetupScript();
      
      console.log(`✅ Export package created: ${this.config.outputDir}`);
      
      return {
        success: true,
        outputDir: this.config.outputDir,
        files: await this.listOutputFiles()
      };
    } catch (error) {
      console.error("❌ Export package build failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async createOutputDirectory() {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${this.config.outputDir}`);
  }

  private async copyTokens() {
    const tokenFiles = [
      'src/styles/tokens.css',
      'src/styles/theme.css'
    ];
    
    const outputTokensDir = path.join(this.config.outputDir, 'tokens');
    await fs.mkdir(outputTokensDir, { recursive: true });
    
    for (const file of tokenFiles) {
      const sourcePath = path.join(this.sourceDir, file);
      const targetPath = path.join(outputTokensDir, path.basename(file));
      
      try {
        await fs.copyFile(sourcePath, targetPath);
        console.log(`📄 Copied token file: ${path.basename(file)}`);
      } catch (error) {
        console.warn(`⚠️  Could not copy ${file}: ${error.message}`);
      }
    }
  }

  private async copyScripts() {
    const scriptFiles = [
      'scripts/sync-figma-to-tokens.ts',
      'scripts/audit-tokens.ts',
      'scripts/token-validator.ts',
      'scripts/build-knowledge-base.ts',
      'scripts/map-component-tokens.ts',
      'scripts/figma-sync.config.json'
    ];
    
    const outputScriptsDir = path.join(this.config.outputDir, 'scripts');
    await fs.mkdir(outputScriptsDir, { recursive: true });
    
    for (const file of scriptFiles) {
      const sourcePath = path.join(this.sourceDir, file);
      const targetPath = path.join(outputScriptsDir, path.basename(file));
      
      try {
        await fs.copyFile(sourcePath, targetPath);
        console.log(`📄 Copied script: ${path.basename(file)}`);
      } catch (error) {
        console.warn(`⚠️  Could not copy ${file}: ${error.message}`);
      }
    }
  }

  private async copyComponents() {
    const componentFiles = [
      'src/components/design-system/',
      'src/components/templates/'
    ];
    
    const outputComponentsDir = path.join(this.config.outputDir, 'components');
    await fs.mkdir(outputComponentsDir, { recursive: true });
    
    for (const dir of componentFiles) {
      const sourcePath = path.join(this.sourceDir, dir);
      const targetPath = path.join(outputComponentsDir, path.basename(dir));
      
      try {
        await this.copyDirectory(sourcePath, targetPath);
        console.log(`📁 Copied component directory: ${path.basename(dir)}`);
      } catch (error) {
        console.warn(`⚠️  Could not copy ${dir}: ${error.message}`);
      }
    }
  }

  private async copyDocumentation() {
    const docFiles = [
      'docs/generated/design-system-guide.md',
      'docs/component-token-map.json',
      'docs/component-token-report.md',
      'TROUBLESHOOTING.md'
    ];
    
    const outputDocsDir = path.join(this.config.outputDir, 'docs');
    await fs.mkdir(outputDocsDir, { recursive: true });
    
    for (const file of docFiles) {
      const sourcePath = path.join(this.sourceDir, file);
      const targetPath = path.join(outputDocsDir, path.basename(file));
      
      try {
        await fs.copyFile(sourcePath, targetPath);
        console.log(`📄 Copied documentation: ${path.basename(file)}`);
      } catch (error) {
        console.warn(`⚠️  Could not copy ${file}: ${error.message}`);
      }
    }
  }

  private async copyDirectory(source: string, target: string) {
    await fs.mkdir(target, { recursive: true });
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  private async generatePackageJson() {
    const packageJson = {
      name: this.config.packageName,
      version: this.config.version,
      description: this.config.description,
      author: this.config.author,
      main: "index.js",
      scripts: {
        "sync": "npx tsx scripts/sync-figma-to-tokens.ts",
        "audit": "npx tsx scripts/audit-tokens.ts",
        "build-knowledge": "npx tsx scripts/build-knowledge-base.ts",
        "map-components": "npx tsx scripts/map-component-tokens.ts",
        "dev": "npm run sync && npm run audit",
        "build": "npm run build-knowledge && npm run map-components"
      },
      keywords: [
        "design-system",
        "figma",
        "tokens",
        "css",
        "tailwind"
      ],
      devDependencies: {
        "@types/node": "^20.10.5",
        "tsx": "^4.7.0",
        "typescript": "^5.3.3"
      },
      dependencies: {
        "js-yaml": "^4.1.0"
      }
    };
    
    const packagePath = path.join(this.config.outputDir, 'package.json');
    await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
    console.log("📄 Generated package.json");
  }

  private async generateReadme() {
    const readme = `# ${this.config.packageName}

${this.config.description}

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Figma connection:**
   - Copy \`scripts/figma-sync.config.json\` to your project
   - Update the collection ID and file hint

3. **Sync tokens from Figma:**
   \`\`\`bash
   npm run sync
   \`\`\`

4. **Audit your design system:**
   \`\`\`bash
   npm run audit
   \`\`\`

## Available Scripts

- \`npm run sync\` - Sync design tokens from Figma to code
- \`npm run audit\` - Audit design tokens for issues
- \`npm run build-knowledge\` - Build design system knowledge base
- \`npm run map-components\` - Map component token dependencies
- \`npm run dev\` - Run sync and audit
- \`npm run build\` - Build knowledge base and component mappings

## File Structure

\`\`\`
${this.config.packageName}/
├── tokens/                 # CSS token files
│   ├── tokens.css         # Design tokens as CSS variables
│   └── theme.css          # Tailwind theme configuration
├── scripts/               # Sync and audit scripts
│   ├── sync-figma-to-tokens.ts
│   ├── audit-tokens.ts
│   └── figma-sync.config.json
├── components/            # Generated component code
│   ├── design-system/     # React/Vue components
│   └── templates/         # Code generation templates
├── docs/                  # Documentation
│   ├── design-system-guide.md
│   └── component-token-map.json
└── package.json
\`\`\`

## Integration

### With Tailwind CSS

Import the theme configuration in your \`tailwind.config.js\`:

\`\`\`javascript
module.exports = {
  theme: {
    extend: {
      colors: require('./tokens/theme.css'),
      // ... other theme extensions
    }
  }
}
\`\`\`

### With CSS

Import the tokens in your main CSS file:

\`\`\`css
@import './tokens/tokens.css';
@import './tokens/theme.css';
\`\`\`

### With React/Vue

Use the generated components from the \`components/design-system/\` directory.

## Troubleshooting

See \`TROUBLESHOOTING.md\` for common issues and solutions.

## Support

For issues and questions, please check the documentation or create an issue in the repository.

---

Generated by Design System GPT v${this.config.version}
`;

    const readmePath = path.join(this.config.outputDir, 'README.md');
    await fs.writeFile(readmePath, readme);
    console.log("📄 Generated README.md");
  }

  private async generateSetupScript() {
    const setupScript = `#!/bin/bash
# Design System Setup Script
# Run this script to set up your design system package

echo "🚀 Setting up Design System GPT package..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if TypeScript is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please install npm with npx support."
    exit 1
fi

# Create backup directory
echo "📁 Creating backup directory..."
mkdir -p scripts/backups

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.ts

# Test the setup
echo "🧪 Testing setup..."
if npm run audit > /dev/null 2>&1; then
    echo "✅ Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your Figma connection in scripts/figma-sync.config.json"
    echo "2. Run 'npm run sync' to sync tokens from Figma"
    echo "3. Run 'npm run audit' to check your design system"
    echo ""
    echo "For more information, see README.md"
else
    echo "⚠️  Setup completed with warnings. Check the output above for details."
fi
`;

    const setupPath = path.join(this.config.outputDir, 'setup.sh');
    await fs.writeFile(setupPath, setupScript);
    
    // Make it executable (commented out for testing)
    // try {
    //   await execa('chmod', ['+x', setupPath]);
    // } catch (error) {
    //   console.warn('⚠️  Could not make setup script executable:', error.message);
    // }
    
    console.log("📄 Generated setup.sh");
  }

  private async listOutputFiles() {
    const files: string[] = [];
    
    const walkDir = async (dir: string, prefix = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.config.outputDir, fullPath);
        
        if (entry.isDirectory()) {
          files.push(`${relativePath}/`);
          await walkDir(fullPath, `${prefix}${entry.name}/`);
        } else {
          files.push(relativePath);
        }
      }
    };
    
    await walkDir(this.config.outputDir);
    return files.sort();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  const config: ExportConfig = {
    outputDir: args[0] || './design-system-export',
    includeTokens: !args.includes('--no-tokens'),
    includeScripts: !args.includes('--no-scripts'),
    includeComponents: !args.includes('--no-components'),
    includeDocs: !args.includes('--no-docs'),
    packageName: 'design-system-gpt-export',
    version: '1.0.0',
    author: 'Design System GPT',
    description: 'Design system package exported from Design System GPT'
  };
  
  console.log('📦 Design System Export Package Builder');
  console.log('=====================================');
  console.log(`Output directory: ${config.outputDir}`);
  console.log(`Include tokens: ${config.includeTokens}`);
  console.log(`Include scripts: ${config.includeScripts}`);
  console.log(`Include components: ${config.includeComponents}`);
  console.log(`Include docs: ${config.includeDocs}`);
  console.log('');
  
  const builder = new ExportPackageBuilder(config);
  const result = await builder.build();
  
  if (result.success) {
    console.log('');
    console.log('🎉 Export package created successfully!');
    console.log(`📁 Location: ${result.outputDir}`);
    console.log(`📄 Files: ${result.files.length}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Navigate to the export directory');
    console.log('2. Run ./setup.sh to install dependencies');
    console.log('3. Configure your Figma connection');
    console.log('4. Start using your design system!');
  } else {
    console.error('❌ Export failed:', result.error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ExportPackageBuilder;
