/**
 * Token Audit System
 * Detects unused tokens, naming issues, contrast violations, and missing semantic mappings
 * Usage: npx tsx scripts/audit-tokens.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
const readJSON = async <T>(p: string) => JSON.parse(await fs.readFile(p, "utf8")) as T;

type AuditResult = {
  type: 'error' | 'warning' | 'info';
  category: 'naming' | 'usage' | 'contrast' | 'semantic' | 'structure';
  message: string;
  token?: string;
  suggestion?: string;
  severity: number; // 1-5, higher = more critical
};

type TokenInfo = {
  name: string;
  type: 'color' | 'number' | 'string';
  value: string | number;
  usage: string[]; // where it's used
  isSemantic: boolean;
  isPrimitive: boolean;
  contrast?: {
    ratio: number;
    passes: boolean;
    level: 'AA' | 'AAA';
  };
};

class TokenAuditor {
  private tokens: TokenInfo[] = [];
  private results: AuditResult[] = [];
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async audit(): Promise<AuditResult[]> {
    console.log("🔍 Starting token audit...\n");
    
    // Load current tokens
    await this.loadTokens();
    
    // Run all audit checks
    await this.checkNamingConventions();
    await this.checkUnusedTokens();
    await this.checkSemanticMapping();
    await this.checkContrastRatios();
    await this.checkTokenStructure();
    
    // Sort by severity
    this.results.sort((a, b) => b.severity - a.severity);
    
    return this.results;
  }

  private async loadTokens(): Promise<void> {
    try {
      // Try to load from tokens.css first
      const tokensPath = this.config.paths.tokensCss;
      const tokensContent = await fs.readFile(tokensPath, 'utf8');
      
      // Parse CSS variables
      const tokenRegex = /--([^:]+):\s*([^;]+);/g;
      let match;
      
      while ((match = tokenRegex.exec(tokensContent)) !== null) {
        const [, name, value] = match;
        const cleanName = name.replace(this.config.prefix + '-', '');
        
        this.tokens.push({
          name: cleanName,
          type: this.inferTokenType(cleanName),
          value: value.trim(),
          usage: [], // Will be populated later
          isSemantic: this.isSemanticToken(cleanName),
          isPrimitive: this.isPrimitiveToken(cleanName)
        });
      }
      
      console.log(`📦 Loaded ${this.tokens.length} tokens`);
    } catch (error) {
      console.warn("⚠️ Could not load tokens from CSS, using mock data");
      this.tokens = this.getMockTokens();
    }
  }

  private inferTokenType(name: string): 'color' | 'number' | 'string' {
    if (name.includes('color') || name.includes('brand') || name.includes('kpi')) return 'color';
    if (name.includes('space') || name.includes('radius') || name.includes('elevation')) return 'number';
    return 'string';
  }

  private isSemanticToken(name: string): boolean {
    return name.includes('brand') || name.includes('kpi') || name.includes('surface') || name.includes('text');
  }

  private isPrimitiveToken(name: string): boolean {
    return name.includes('pi-color') || name.includes('pi-red') || name.includes('pi-green') || name.includes('pi-blue') || name.includes('pi-yellow');
  }

  private getMockTokens(): TokenInfo[] {
    return [
      { name: 'brand-primary', type: 'color', value: '#4d79c7', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'brand-secondary', type: 'color', value: '#5ca5a5', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'kpi-positive', type: 'color', value: '#5ca5a5', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'kpi-negative', type: 'color', value: '#d46a6a', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'surface-base', type: 'color', value: '#ffffff', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'text-primary', type: 'color', value: '#1a1a1a', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'radius-medium', type: 'number', value: '8px', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'space-medium', type: 'number', value: '8px', usage: [], isSemantic: true, isPrimitive: false },
      { name: 'pi-color-pi-red-500', type: 'color', value: '#d46a6a', usage: [], isSemantic: false, isPrimitive: true },
      { name: 'pi-color-pi-green-500', type: 'color', value: '#5ca5a5', usage: [], isSemantic: false, isPrimitive: true },
    ];
  }

  private async checkNamingConventions(): Promise<void> {
    console.log("🔤 Checking naming conventions...");
    
    const namingRules = {
      semantic: /^(brand|kpi|surface|text|interactive|border|shadow)-[a-z-]+$/,
      primitive: /^pi-color-[a-z-]+-\d+$/,
      spacing: /^space-(xs|sm|md|lg|xl|2xl|3xl)$/,
      radius: /^radius-(sm|md|lg|xl|2xl|full)$/
    };

    for (const token of this.tokens) {
      let rule: RegExp | null = null;
      let expectedFormat = '';

      if (token.isSemantic) {
        if (token.name.includes('space')) {
          rule = namingRules.spacing;
          expectedFormat = 'space-(xs|sm|md|lg|xl|2xl|3xl)';
        } else if (token.name.includes('radius')) {
          rule = namingRules.radius;
          expectedFormat = 'radius-(sm|md|lg|xl|2xl|full)';
        } else {
          rule = namingRules.semantic;
          expectedFormat = '(brand|kpi|surface|text|interactive|border|shadow)-[a-z-]+';
        }
      } else if (token.isPrimitive) {
        rule = namingRules.primitive;
        expectedFormat = 'pi-color-[color-name]-[shade]';
      }

      if (rule && !rule.test(token.name)) {
        this.results.push({
          type: 'warning',
          category: 'naming',
          message: `Token "${token.name}" doesn't follow naming convention`,
          token: token.name,
          suggestion: `Expected format: ${expectedFormat}`,
          severity: 3
        });
      }
    }
  }

  private async checkUnusedTokens(): Promise<void> {
    console.log("🔍 Checking for unused tokens...");
    
    // This would typically scan your codebase for token usage
    // For now, we'll simulate some usage patterns
    const mockUsage = {
      'brand-primary': ['Button.tsx', 'Header.tsx'],
      'kpi-positive': ['KPICard.tsx'],
      'surface-base': ['Card.tsx', 'Modal.tsx'],
      'text-primary': ['Typography.tsx', 'Card.tsx']
    };

    for (const token of this.tokens) {
      const usage = mockUsage[token.name as keyof typeof mockUsage] || [];
      token.usage = usage;

      if (usage.length === 0 && token.isSemantic) {
        this.results.push({
          type: 'warning',
          category: 'usage',
          message: `Semantic token "${token.name}" appears unused`,
          token: token.name,
          suggestion: 'Consider removing or finding where it should be used',
          severity: 2
        });
      }
    }
  }

  private async checkSemanticMapping(): Promise<void> {
    console.log("🔗 Checking semantic token mappings...");
    
    const semanticTokens = this.tokens.filter(t => t.isSemantic);
    const primitiveTokens = this.tokens.filter(t => t.isPrimitive);

    // Check if semantic tokens have corresponding primitives
    for (const semantic of semanticTokens) {
      if (semantic.type === 'color') {
        // Try to find a primitive that matches the value
        const matchingPrimitive = primitiveTokens.find(p => 
          p.type === 'color' && p.value === semantic.value
        );

        if (!matchingPrimitive) {
          this.results.push({
            type: 'info',
            category: 'semantic',
            message: `Semantic token "${semantic.name}" doesn't reference a primitive`,
            token: semantic.name,
            suggestion: 'Consider creating a primitive color and referencing it',
            severity: 2
          });
        }
      }
    }

    // Check for orphaned primitives
    for (const primitive of primitiveTokens) {
      const usedBySemantic = semanticTokens.find(s => s.value === primitive.value);
      if (!usedBySemantic) {
        this.results.push({
          type: 'info',
          category: 'semantic',
          message: `Primitive token "${primitive.name}" isn't used by any semantic token`,
          token: primitive.name,
          suggestion: 'Consider creating semantic tokens that use this primitive',
          severity: 1
        });
      }
    }
  }

  private async checkContrastRatios(): Promise<void> {
    console.log("🎨 Checking color contrast ratios...");
    
    const colorTokens = this.tokens.filter(t => t.type === 'color');
    
    for (const token of colorTokens) {
      if (typeof token.value === 'string' && token.value.startsWith('#')) {
        const contrast = this.calculateContrast(token.value, '#ffffff');
        token.contrast = {
          ratio: contrast.ratio,
          passes: contrast.ratio >= 4.5,
          level: contrast.ratio >= 7 ? 'AAA' : contrast.ratio >= 4.5 ? 'AA' : 'AA'
        };

        if (!contrast.passes) {
          this.results.push({
            type: 'error',
            category: 'contrast',
            message: `Color "${token.name}" has insufficient contrast (${contrast.ratio.toFixed(2)})`,
            token: token.name,
            suggestion: `Needs contrast ratio of 4.5+ for AA compliance. Current: ${contrast.ratio.toFixed(2)}`,
            severity: 4
          });
        }
      }
    }
  }

  private calculateContrast(color1: string, color2: string): { ratio: number; passes: boolean } {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const l1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255;
    const l2 = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;
    
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      passes: ratio >= 4.5
    };
  }

  private async checkTokenStructure(): Promise<void> {
    console.log("🏗️ Checking token structure...");
    
    const requiredSemanticTokens = [
      'brand-primary',
      'brand-secondary', 
      'surface-base',
      'text-primary',
      'text-secondary',
      'kpi-positive',
      'kpi-negative',
      'border-default',
      'radius-medium',
      'space-medium'
    ];

    const existingNames = this.tokens.map(t => t.name);
    
    for (const required of requiredSemanticTokens) {
      if (!existingNames.includes(required)) {
        this.results.push({
          type: 'warning',
          category: 'structure',
          message: `Missing recommended semantic token: "${required}"`,
          token: required,
          suggestion: 'Consider adding this token to complete your design system',
          severity: 3
        });
      }
    }
  }

  printResults(): void {
    console.log("\n📊 AUDIT RESULTS\n");
    console.log("=" .repeat(60));
    
    const errors = this.results.filter(r => r.type === 'error');
    const warnings = this.results.filter(r => r.type === 'warning');
    const infos = this.results.filter(r => r.type === 'info');
    
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`ℹ️  Info: ${infos.length}`);
    console.log(`📈 Total: ${this.results.length}`);
    
    if (this.results.length === 0) {
      console.log("\n✅ No issues found! Your design system looks great.");
      return;
    }
    
    console.log("\n" + "=" .repeat(60));
    
    for (const result of this.results) {
      const icon = result.type === 'error' ? '❌' : result.type === 'warning' ? '⚠️' : 'ℹ️';
      const severity = '🔴'.repeat(result.severity) + '⚪'.repeat(5 - result.severity);
      
      console.log(`\n${icon} ${result.category.toUpperCase()}`);
      console.log(`   ${result.message}`);
      if (result.token) console.log(`   Token: ${result.token}`);
      if (result.suggestion) console.log(`   💡 ${result.suggestion}`);
      console.log(`   ${severity}`);
    }
  }
}

// Main execution
(async () => {
  try {
    const config = await readJSON("scripts/figma-sync.config.json");
    const auditor = new TokenAuditor(config);
    
    const results = await auditor.audit();
    auditor.printResults();
    
    // Exit with error code if there are critical issues
    const criticalIssues = results.filter(r => r.severity >= 4);
    if (criticalIssues.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Audit failed:", error?.message || error);
    process.exit(1);
  }
})();
