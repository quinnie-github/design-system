/**
 * Token Validation Utilities
 * Provides validation functions for token values, naming, and consistency
 */

export type TokenType = 'color' | 'number' | 'string';
export type ValidationRule = 'naming' | 'format' | 'contrast' | 'semantic' | 'structure';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface TokenDefinition {
  name: string;
  type: TokenType;
  value: string | number;
  isSemantic: boolean;
  isPrimitive: boolean;
  usage?: string[];
}

export class TokenValidator {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  /**
   * Validate a single token against all rules
   */
  validateToken(token: TokenDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Naming validation
    const namingResult = this.validateNaming(token);
    errors.push(...namingResult.errors);
    warnings.push(...namingResult.warnings);
    suggestions.push(...namingResult.suggestions);

    // Format validation
    const formatResult = this.validateFormat(token);
    errors.push(...formatResult.errors);
    warnings.push(...formatResult.warnings);
    suggestions.push(...formatResult.suggestions);

    // Contrast validation (for colors)
    if (token.type === 'color') {
      const contrastResult = this.validateContrast(token);
      errors.push(...contrastResult.errors);
      warnings.push(...contrastResult.warnings);
      suggestions.push(...contrastResult.suggestions);
    }

    // Semantic validation
    const semanticResult = this.validateSemantic(token);
    errors.push(...semanticResult.errors);
    warnings.push(...semanticResult.warnings);
    suggestions.push(...semanticResult.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate token naming conventions
   */
  private validateNaming(token: TokenDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const namingRules = {
      semantic: /^(brand|kpi|surface|text|interactive|border|shadow|radius|space)-[a-z-]+$/,
      primitive: /^pi-color-[a-z-]+-\d+$/,
      spacing: /^space-(xs|sm|md|lg|xl|2xl|3xl)$/,
      radius: /^radius-(sm|md|lg|xl|2xl|full)$/
    };

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
      warnings.push(`Token name doesn't follow convention`);
      suggestions.push(`Expected format: ${expectedFormat}`);
    }

    // Check for kebab-case
    if (!/^[a-z0-9-]+$/.test(token.name)) {
      errors.push('Token name must use kebab-case (lowercase with hyphens)');
    }

    // Check for double hyphens
    if (token.name.includes('--')) {
      errors.push('Token name cannot contain double hyphens');
    }

    // Check for trailing hyphens
    if (token.name.endsWith('-') || token.name.startsWith('-')) {
      errors.push('Token name cannot start or end with hyphens');
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate token format and value
   */
  private validateFormat(token: TokenDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (token.type === 'color') {
      const colorValue = String(token.value);
      
      // Check if it's a valid hex color
      if (!/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
        errors.push('Color value must be a valid 6-digit hex code');
        suggestions.push('Use format: #RRGGBB (e.g., #4d79c7)');
      }

      // Check for common color issues
      if (colorValue === '#000000' || colorValue === '#ffffff') {
        warnings.push('Consider using semantic color names instead of pure black/white');
        suggestions.push('Use brand colors or surface/text tokens instead');
      }
    }

    if (token.type === 'number') {
      const numValue = Number(token.value);
      
      if (isNaN(numValue)) {
        errors.push('Number token value must be numeric');
      }

      if (token.name.includes('space') && numValue < 0) {
        errors.push('Spacing values cannot be negative');
      }

      if (token.name.includes('radius') && numValue < 0) {
        errors.push('Border radius values cannot be negative');
      }

      // Check for reasonable ranges
      if (token.name.includes('space') && numValue > 200) {
        warnings.push('Spacing value seems unusually large');
        suggestions.push('Consider if this spacing value is intentional');
      }
    }

    if (token.type === 'string') {
      const stringValue = String(token.value);
      
      if (stringValue.length === 0) {
        errors.push('String token value cannot be empty');
      }

      if (token.name.includes('font') && !stringValue.includes(' ')) {
        warnings.push('Font family should include fallbacks');
        suggestions.push('Use format: "Inter, -apple-system, sans-serif"');
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate color contrast ratios
   */
  private validateContrast(token: TokenDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (token.type !== 'color' || typeof token.value !== 'string') {
      return { isValid: true, errors, warnings, suggestions };
    }

    const colorValue = token.value;
    if (!/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
      return { isValid: true, errors, warnings, suggestions };
    }

    // Test against common backgrounds
    const testColors = [
      { name: 'white', value: '#ffffff' },
      { name: 'black', value: '#000000' },
      { name: 'surface-base', value: '#ffffff' }, // Assuming light theme
      { name: 'surface-elevated', value: '#f8f9fa' }
    ];

    for (const testColor of testColors) {
      const contrast = this.calculateContrast(colorValue, testColor.value);
      
      if (contrast.ratio < 4.5) {
        if (token.name.includes('text') || token.name.includes('primary')) {
          errors.push(`Insufficient contrast against ${testColor.name} (${contrast.ratio.toFixed(2)})`);
          suggestions.push(`Needs contrast ratio of 4.5+ for AA compliance`);
        } else {
          warnings.push(`Low contrast against ${testColor.name} (${contrast.ratio.toFixed(2)})`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Validate semantic token relationships
   */
  private validateSemantic(token: TokenDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for semantic token completeness
    if (token.isSemantic) {
      const requiredPairs = {
        'brand-primary': 'brand-secondary',
        'text-primary': 'text-secondary',
        'surface-base': 'surface-elevated',
        'kpi-positive': 'kpi-negative'
      };

      const pairKey = Object.keys(requiredPairs).find(key => token.name.startsWith(key.split('-')[0]));
      if (pairKey) {
        const expectedPair = requiredPairs[pairKey as keyof typeof requiredPairs];
        if (!token.name.includes(expectedPair.split('-')[1])) {
          warnings.push(`Consider adding paired token: ${expectedPair}`);
        }
      }
    }

    // Check for primitive references
    if (token.isSemantic && token.type === 'color') {
      const primitivePattern = /^pi-color-[a-z-]+-\d+$/;
      if (primitivePattern.test(String(token.value))) {
        // This looks like it might be referencing a primitive
        warnings.push('Semantic token appears to reference primitive directly');
        suggestions.push('Consider using CSS custom properties or design tokens for better maintainability');
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrast(color1: string, color2: string): { ratio: number; passes: boolean } {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    // Convert to relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(r1, g1, b1);
    const l2 = getLuminance(r2, g2, b2);
    
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      passes: ratio >= 4.5
    };
  }

  /**
   * Validate a collection of tokens for consistency
   */
  validateCollection(tokens: TokenDefinition[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for duplicate names
    const names = tokens.map(t => t.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate token names: ${duplicates.join(', ')}`);
    }

    // Check for missing required tokens
    const requiredTokens = [
      'brand-primary',
      'surface-base',
      'text-primary',
      'radius-medium',
      'space-medium'
    ];

    const existingNames = new Set(names);
    const missing = requiredTokens.filter(name => !existingNames.has(name));
    if (missing.length > 0) {
      warnings.push(`Missing recommended tokens: ${missing.join(', ')}`);
      suggestions.push('Consider adding these tokens to complete your design system');
    }

    // Check for consistent naming patterns
    const semanticTokens = tokens.filter(t => t.isSemantic);
    const primitiveTokens = tokens.filter(t => t.isPrimitive);

    if (semanticTokens.length === 0) {
      warnings.push('No semantic tokens found');
      suggestions.push('Consider creating semantic tokens that map to your primitives');
    }

    if (primitiveTokens.length === 0) {
      warnings.push('No primitive tokens found');
      suggestions.push('Consider creating primitive color palettes as the foundation');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

export default TokenValidator;
