/**
 * Knowledge Base Builder
 * Converts YAML design rules into JSON knowledge base for AI consumption
 * Usage: npx tsx scripts/build-knowledge-base.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

interface KnowledgeBase {
  metadata: {
    version: string;
    last_updated: string;
    total_rules: number;
    categories: string[];
  };
  rules: {
    colors: ColorRules;
    spacing: SpacingRules;
    typography: TypographyRules;
    components: ComponentRules;
  };
  tokens: {
    semantic: TokenDefinition[];
    primitive: TokenDefinition[];
  };
  patterns: DesignPattern[];
  anti_patterns: AntiPattern[];
}

interface ColorRules {
  categories: ColorCategory[];
  accessibility: AccessibilityRules;
  primitive_mapping: PrimitiveMapping;
  recommended_combinations: ColorCombinations;
  usage_examples: UsageExample[];
}

interface ColorCategory {
  name: string;
  description: string;
  tokens: string[];
  usage: string[];
  avoid: string[];
}

interface AccessibilityRules {
  contrast_requirements: {
    aa: number;
    aaa: number;
  };
  minimum_ratios: Record<string, number>;
}

interface PrimitiveMapping {
  [key: string]: {
    description: string;
    shades: number[];
    base_shade: number;
    usage: string;
  };
}

interface ColorCombinations {
  light_theme: Record<string, string>;
  dark_theme: Record<string, string>;
}

interface UsageExample {
  component: string;
  properties: Record<string, string>;
}

interface SpacingRules {
  scale: Record<string, number>;
  categories: SpacingCategory[];
  tokens: SpacingToken[];
  component_spacing: Record<string, Record<string, string>>;
  responsive: ResponsiveSpacing;
}

interface SpacingCategory {
  name: string;
  description: string;
  tokens: string[];
  usage: string[];
  examples: string[];
}

interface SpacingToken {
  name: string;
  value: string;
  usage: string;
  examples: string[];
}

interface ResponsiveSpacing {
  mobile: {
    multiplier: number;
    max_spacing: string;
    examples: string[];
  };
  tablet: {
    multiplier: number;
    examples: string[];
  };
  desktop: {
    multiplier: number;
    max_spacing: string;
    examples: string[];
  };
}

interface TypographyRules {
  font_families: Record<string, FontFamily>;
  font_weights: Record<string, number>;
  scale: Record<string, string>;
  line_heights: Record<string, number>;
  categories: TypographyCategory[];
  tokens: TypographyToken[];
  component_typography: Record<string, Record<string, string>>;
}

interface FontFamily {
  name: string;
  fallbacks: string[];
  usage: string;
}

interface TypographyCategory {
  name: string;
  description: string;
  hierarchy?: Record<string, TypographyStyle>;
  styles?: Record<string, TypographyStyle>;
}

interface TypographyStyle {
  size: string;
  weight: string;
  line_height: string;
  usage: string;
}

interface TypographyToken {
  name: string;
  value: string;
  usage: string;
}

interface ComponentRules {
  categories: ComponentCategory[];
  components: Record<string, ComponentSpec>;
  token_requirements: Record<string, TokenRequirements>;
  composition: Record<string, string[]>;
  accessibility: Record<string, string[]>;
}

interface ComponentCategory {
  name: string;
  description: string;
  components: string[];
  token_requirements: Record<string, string[]>;
}

interface ComponentSpec {
  description: string;
  variants: Record<string, Record<string, string>>;
  sizes: Record<string, Record<string, string>>;
  usage: string[];
  avoid: string[];
}

interface TokenRequirements {
  required: string[];
  optional: string[];
}

interface TokenDefinition {
  name: string;
  type: 'color' | 'number' | 'string';
  value: string;
  usage: string[];
  examples: string[];
  category: string;
}

interface DesignPattern {
  name: string;
  description: string;
  components: string[];
  tokens: string[];
  usage: string[];
  examples: string[];
}

interface AntiPattern {
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  fix: string;
}

class KnowledgeBaseBuilder {
  private rulesDir: string;
  private outputDir: string;

  constructor(rulesDir: string, outputDir: string) {
    this.rulesDir = rulesDir;
    this.outputDir = outputDir;
  }

  async build(): Promise<void> {
    console.log("🧠 Building design system knowledge base...\n");

    // Load YAML files
    const colorRules = await this.loadYamlFile("colors.yaml");
    const spacingRules = await this.loadYamlFile("spacing.yaml");
    const typographyRules = await this.loadYamlFile("typography.yaml");
    const componentRules = await this.loadYamlFile("components.yaml");

    // Build knowledge base
    const knowledgeBase: KnowledgeBase = {
      metadata: {
        version: "1.0",
        last_updated: new Date().toISOString(),
        total_rules: this.countRules(colorRules, spacingRules, typographyRules, componentRules),
        categories: ["colors", "spacing", "typography", "components"]
      },
      rules: {
        colors: this.processColorRules(colorRules),
        spacing: this.processSpacingRules(spacingRules),
        typography: this.processTypographyRules(typographyRules),
        components: this.processComponentRules(componentRules)
      },
      tokens: {
        semantic: this.extractSemanticTokens(colorRules, spacingRules, typographyRules),
        primitive: this.extractPrimitiveTokens(colorRules)
      },
      patterns: this.extractDesignPatterns(componentRules),
      anti_patterns: this.extractAntiPatterns(colorRules, spacingRules, typographyRules, componentRules)
    };

    // Generate outputs
    await this.generateJsonOutput(knowledgeBase);
    await this.generateMarkdownGuide(knowledgeBase);
    await this.generateAIContext(knowledgeBase);

    console.log("✅ Knowledge base built successfully!");
  }

  private async loadYamlFile(filename: string): Promise<any> {
    const filePath = path.join(this.rulesDir, filename);
    const content = await fs.readFile(filePath, 'utf8');
    return yaml.load(content);
  }

  private countRules(...ruleSets: any[]): number {
    return ruleSets.reduce((total, rules) => {
      if (rules.categories) total += rules.categories.length;
      if (rules.tokens) total += rules.tokens.length;
      if (rules.components) total += Object.keys(rules.components).length;
      return total;
    }, 0);
  }

  private processColorRules(rules: any): ColorRules {
    // Convert categories object to array
    const categories = rules.categories ? Object.entries(rules.categories).map(([name, data]: [string, any]) => ({
      name,
      description: data.description || '',
      tokens: data.tokens || [],
      usage: data.usage || [],
      avoid: data.avoid || []
    })) : [];

    return {
      categories,
      accessibility: rules.accessibility || { contrast_requirements: { aa: 4.5, aaa: 7.0 }, minimum_ratios: {} },
      primitive_mapping: rules.primitive_mapping || {},
      recommended_combinations: rules.recommended_combinations || { light_theme: {}, dark_theme: {} },
      usage_examples: rules.examples || []
    };
  }

  private processSpacingRules(rules: any): SpacingRules {
    // Convert categories object to array
    const categories = rules.categories ? Object.entries(rules.categories).map(([name, data]: [string, any]) => ({
      name,
      description: data.description || '',
      tokens: data.tokens || [],
      usage: data.usage || [],
      examples: data.examples || []
    })) : [];

    return {
      scale: rules.scale || {},
      categories,
      tokens: Array.isArray(rules.tokens) ? rules.tokens : [],
      component_spacing: rules.component_spacing || {},
      responsive: rules.responsive || { mobile: { multiplier: 1, max_spacing: "", examples: [] }, tablet: { multiplier: 1, examples: [] }, desktop: { multiplier: 1, max_spacing: "", examples: [] } }
    };
  }

  private processTypographyRules(rules: any): TypographyRules {
    // Convert categories object to array
    const categories = rules.categories ? Object.entries(rules.categories).map(([name, data]: [string, any]) => ({
      name,
      description: data.description || '',
      hierarchy: data.hierarchy || {},
      styles: data.styles || {}
    })) : [];

    return {
      font_families: rules.font_families || {},
      font_weights: rules.font_weights || {},
      scale: rules.scale || {},
      line_heights: rules.line_heights || {},
      categories,
      tokens: Array.isArray(rules.tokens) ? rules.tokens : [],
      component_typography: rules.component_typography || {}
    };
  }

  private processComponentRules(rules: any): ComponentRules {
    // Convert categories object to array
    const categories = rules.categories ? Object.entries(rules.categories).map(([name, data]: [string, any]) => ({
      name,
      description: data.description || '',
      components: data.components || [],
      token_requirements: data.token_requirements || {}
    })) : [];

    return {
      categories,
      components: rules.components || {},
      token_requirements: rules.token_requirements || {},
      composition: rules.composition || {},
      accessibility: rules.accessibility || {}
    };
  }

  private extractSemanticTokens(...ruleSets: any[]): TokenDefinition[] {
    const tokens: TokenDefinition[] = [];

    for (const rules of ruleSets) {
      if (rules.tokens && Array.isArray(rules.tokens)) {
        for (const token of rules.tokens) {
          tokens.push({
            name: token.name || token,
            type: this.inferTokenType(token.name || token),
            value: token.value || "",
            usage: token.usage || [],
            examples: token.examples || [],
            category: this.inferTokenCategory(token.name || token)
          });
        }
      }
    }

    return tokens;
  }

  private extractPrimitiveTokens(colorRules: any): TokenDefinition[] {
    const tokens: TokenDefinition[] = [];

    if (colorRules.primitive_mapping) {
      for (const [primitiveName, primitiveData] of Object.entries(colorRules.primitive_mapping)) {
        const data = primitiveData as any;
        tokens.push({
          name: primitiveName,
          type: 'color',
          value: "",
          usage: [data.usage || ""],
          examples: [],
          category: 'primitive'
        });
      }
    }

    return tokens;
  }

  private extractDesignPatterns(componentRules: any): DesignPattern[] {
    const patterns: DesignPattern[] = [];

    if (componentRules.components) {
      for (const [componentName, componentSpec] of Object.entries(componentRules.components)) {
        const spec = componentSpec as any;
        patterns.push({
          name: componentName,
          description: spec.description || "",
          components: [componentName],
          tokens: this.extractTokensFromComponent(spec),
          usage: spec.usage || [],
          examples: []
        });
      }
    }

    return patterns;
  }

  private extractTokensFromComponent(componentSpec: any): string[] {
    const tokens: string[] = [];

    if (componentSpec.variants) {
      for (const variant of Object.values(componentSpec.variants)) {
        const variantData = variant as any;
        for (const value of Object.values(variantData)) {
          if (typeof value === 'string' && value.includes('-')) {
            tokens.push(value);
          }
        }
      }
    }

    return [...new Set(tokens)];
  }

  private extractAntiPatterns(...ruleSets: any[]): AntiPattern[] {
    const antiPatterns: AntiPattern[] = [];

    for (const rules of ruleSets) {
      if (rules.anti_patterns) {
        for (const pattern of rules.anti_patterns) {
          antiPatterns.push({
            description: pattern,
            category: this.inferCategoryFromRules(rules),
            impact: 'medium',
            fix: "Follow design system guidelines"
          });
        }
      }
    }

    return antiPatterns;
  }

  private inferTokenType(name: string): 'color' | 'number' | 'string' {
    if (name.includes('color') || name.includes('brand') || name.includes('kpi') || name.includes('surface') || name.includes('text')) return 'color';
    if (name.includes('space') || name.includes('radius') || name.includes('elevation')) return 'number';
    return 'string';
  }

  private inferTokenCategory(name: string): string {
    if (name.includes('brand')) return 'brand';
    if (name.includes('kpi')) return 'kpi';
    if (name.includes('surface')) return 'surface';
    if (name.includes('text')) return 'text';
    if (name.includes('space')) return 'spacing';
    if (name.includes('radius')) return 'spacing';
    if (name.includes('font')) return 'typography';
    return 'other';
  }

  private inferCategoryFromRules(rules: any): string {
    if (rules.categories) return 'colors';
    if (rules.scale) return 'spacing';
    if (rules.font_families) return 'typography';
    if (rules.components) return 'components';
    return 'general';
  }

  private async generateJsonOutput(knowledgeBase: KnowledgeBase): Promise<void> {
    const outputPath = path.join(this.outputDir, "design-system-knowledge.json");
    await fs.writeFile(outputPath, JSON.stringify(knowledgeBase, null, 2), 'utf8');
    console.log(`📄 Generated JSON knowledge base: ${outputPath}`);
  }

  private async generateMarkdownGuide(knowledgeBase: KnowledgeBase): Promise<void> {
    const markdown = this.buildMarkdownGuide(knowledgeBase);
    const outputPath = path.join(this.outputDir, "design-system-guide.md");
    await fs.writeFile(outputPath, markdown, 'utf8');
    console.log(`📖 Generated markdown guide: ${outputPath}`);
  }

  private buildMarkdownGuide(kb: KnowledgeBase): string {
    return `# Design System Guide

Generated on ${kb.metadata.last_updated}

## Overview

This design system contains ${kb.metadata.total_rules} rules across ${kb.metadata.categories.length} categories.

## Color System

### Categories
${Array.isArray(kb.rules.colors.categories) ? kb.rules.colors.categories.map(cat => `- **${cat.name}**: ${cat.description}`).join('\n') : 'No categories defined'}

### Accessibility
- **AA Contrast**: ${kb.rules.colors.accessibility.contrast_requirements.aa}:1
- **AAA Contrast**: ${kb.rules.colors.accessibility.contrast_requirements.aaa}:1

### Primitive Colors
${Object.entries(kb.rules.colors.primitive_mapping).map(([name, data]) => 
  `- **${name}**: ${(data as any).description} (shades: ${Array.isArray((data as any).shades) ? (data as any).shades.join(', ') : 'N/A'})`
).join('\n')}

## Spacing System

### Scale
${Object.entries(kb.rules.spacing.scale).map(([name, value]) => 
  `- **${name}**: ${value}px`
).join('\n')}

### Categories
${Array.isArray(kb.rules.spacing.categories) ? kb.rules.spacing.categories.map(cat => `- **${cat.name}**: ${cat.description}`).join('\n') : 'No categories defined'}

## Typography System

### Font Families
${Object.entries(kb.rules.typography.font_families).map(([name, family]) => 
  `- **${name}**: ${(family as any).name} (${Array.isArray((family as any).fallbacks) ? (family as any).fallbacks.join(', ') : 'N/A'})`
).join('\n')}

### Scale
${Object.entries(kb.rules.typography.scale).map(([name, value]) => 
  `- **${name}**: ${value}`
).join('\n')}

## Components

### Available Components
${Object.keys(kb.rules.components.components).map(name => `- **${name}**`).join('\n')}

### Token Requirements
${Object.entries(kb.rules.components.token_requirements).map(([type, reqs]) => 
  `- **${type}**: ${Array.isArray((reqs as any).required) ? (reqs as any).required.join(', ') : 'N/A'}`
).join('\n')}

## Design Patterns

${kb.patterns.map(pattern => 
  `### ${pattern.name}\n${pattern.description}\n\n**Components**: ${pattern.components.join(', ')}\n**Tokens**: ${pattern.tokens.join(', ')}`
).join('\n\n')}

## Anti-Patterns to Avoid

${kb.anti_patterns.map(pattern => 
  `- **${pattern.category}**: ${pattern.description}`
).join('\n')}

## Token Reference

### Semantic Tokens
${kb.tokens.semantic.map(token => 
  `- **${token.name}** (${token.type}): ${Array.isArray(token.usage) ? token.usage.join(', ') : token.usage}`
).join('\n')}

### Primitive Tokens
${kb.tokens.primitive.map(token => 
  `- **${token.name}** (${token.type}): ${Array.isArray(token.usage) ? token.usage.join(', ') : token.usage}`
).join('\n')}
`;
  }

  private async generateAIContext(knowledgeBase: KnowledgeBase): Promise<void> {
    // Create a condensed version for AI context
    const aiContext = {
      system_prompt: `You are a design system expert. Use this knowledge base to help users make design decisions.`,
      rules_summary: {
        colors: {
          categories: Array.isArray(knowledgeBase.rules.colors.categories) ? knowledgeBase.rules.colors.categories.map(c => c.name) : [],
          accessibility: knowledgeBase.rules.colors.accessibility,
          primitives: Object.keys(knowledgeBase.rules.colors.primitive_mapping)
        },
        spacing: {
          scale: knowledgeBase.rules.spacing.scale,
          categories: Array.isArray(knowledgeBase.rules.spacing.categories) ? knowledgeBase.rules.spacing.categories.map(c => c.name) : []
        },
        typography: {
          families: Object.keys(knowledgeBase.rules.typography.font_families),
          scale: knowledgeBase.rules.typography.scale
        },
        components: {
          available: Object.keys(knowledgeBase.rules.components.components),
          categories: Array.isArray(knowledgeBase.rules.components.categories) ? knowledgeBase.rules.components.categories.map(c => c.name) : []
        }
      },
      tokens: {
        semantic: knowledgeBase.tokens.semantic.map(t => ({ name: t.name, type: t.type, category: t.category })),
        primitive: knowledgeBase.tokens.primitive.map(t => ({ name: t.name, type: t.type }))
      },
      patterns: knowledgeBase.patterns.map(p => ({ name: p.name, description: p.description, components: p.components })),
      anti_patterns: knowledgeBase.anti_patterns.map(a => ({ description: a.description, category: a.category }))
    };

    const outputPath = path.join(this.outputDir, "ai-context.json");
    await fs.writeFile(outputPath, JSON.stringify(aiContext, null, 2), 'utf8');
    console.log(`🤖 Generated AI context: ${outputPath}`);
  }
}

// Main execution
(async () => {
  try {
    const rulesDir = "docs/rules";
    const outputDir = "docs/generated";
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    const builder = new KnowledgeBaseBuilder(rulesDir, outputDir);
    await builder.build();
    
  } catch (error) {
    console.error("❌ Knowledge base build failed:", error?.message || error);
    process.exit(1);
  }
})();
