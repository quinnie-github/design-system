// Component Suggestion Engine
// Analyzes user intent and recommends existing components or identifies gaps

class ComponentSuggester {
  constructor(aiConnector) {
    this.aiConnector = aiConnector;
    this.componentDatabase = null;
    this.usagePatterns = {};
  }

  async initialize() {
    try {
      this.componentDatabase = await this.loadComponentDatabase();
      this.usagePatterns = await this.loadUsagePatterns();
      return { success: true };
    } catch (error) {
      console.error('Component Suggester initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async loadComponentDatabase() {
    // In a real implementation, this would load from the generated component map
    return {
      'Button Primary': {
        name: 'Button Primary',
        description: 'Main call-to-action button for primary actions',
        category: 'interaction',
        tokens: ['color.brand.primary', 'color.text.inverse', 'space.md', 'radius.medium'],
        useCases: ['submit', 'save', 'continue', 'confirm', 'action'],
        variants: ['primary', 'secondary', 'ghost'],
        sizes: ['sm', 'md', 'lg'],
        accessibility: ['keyboard-navigable', 'screen-reader-friendly']
      },
      'Card Default': {
        name: 'Card Default',
        description: 'Generic content container for grouping related information',
        category: 'layout',
        tokens: ['color.surface.base', 'color.text.primary', 'space.lg', 'radius.large'],
        useCases: ['content-grouping', 'information-display', 'container'],
        variants: ['default', 'elevated', 'outlined'],
        sizes: ['sm', 'md', 'lg'],
        accessibility: ['semantic-structure']
      },
      'KPI Card': {
        name: 'KPI Card',
        description: 'Specialized card for displaying key performance indicators and metrics',
        category: 'data-display',
        tokens: ['color.surface.base', 'color.text.primary', 'color.kpi.positive', 'space.md'],
        useCases: ['metrics', 'kpi', 'dashboard', 'analytics', 'data-display'],
        variants: ['positive', 'negative', 'neutral'],
        sizes: ['sm', 'md', 'lg'],
        accessibility: ['data-visualization', 'screen-reader-friendly']
      },
      'Input Field': {
        name: 'Input Field',
        description: 'Standard input component for forms and data entry',
        category: 'form',
        tokens: ['color.surface.base', 'color.text.primary', 'space.sm', 'radius.medium'],
        useCases: ['form', 'input', 'data-entry', 'search'],
        variants: ['text', 'email', 'password', 'number'],
        sizes: ['sm', 'md', 'lg'],
        accessibility: ['form-control', 'validation-support']
      }
    };
  }

  async loadUsagePatterns() {
    // Mock usage patterns - in real implementation, this would be learned from actual usage
    return {
      'dashboard': ['KPI Card', 'Card Default', 'Button Primary'],
      'form': ['Input Field', 'Button Primary', 'Card Default'],
      'navigation': ['Button Primary'],
      'data-display': ['KPI Card', 'Card Default'],
      'settings': ['Input Field', 'Button Primary', 'Card Default']
    };
  }

  async suggestComponents(userQuery, context = {}) {
    try {
      const intent = await this.analyzeIntent(userQuery);
      const suggestions = await this.findMatchingComponents(intent, context);
      const gaps = this.identifyGaps(intent, suggestions);
      
      return {
        success: true,
        intent: intent,
        suggestions: suggestions,
        gaps: gaps,
        confidence: this.calculateConfidence(suggestions)
      };
    } catch (error) {
      console.error('Component suggestion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeIntent(userQuery) {
    const query = userQuery.toLowerCase();
    
    // Extract key terms and patterns
    const patterns = {
      action: ['button', 'click', 'submit', 'save', 'action', 'cta'],
      display: ['show', 'display', 'card', 'container', 'box'],
      data: ['kpi', 'metric', 'data', 'chart', 'analytics', 'dashboard'],
      input: ['form', 'input', 'field', 'enter', 'type', 'search'],
      navigation: ['menu', 'nav', 'link', 'go', 'navigate'],
      layout: ['layout', 'arrange', 'organize', 'structure', 'grid']
    };

    const detectedPatterns = [];
    Object.entries(patterns).forEach(([pattern, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        detectedPatterns.push(pattern);
      }
    });

    // Determine primary intent
    let primaryIntent = 'general';
    if (detectedPatterns.includes('data')) primaryIntent = 'data-display';
    else if (detectedPatterns.includes('action')) primaryIntent = 'interaction';
    else if (detectedPatterns.includes('input')) primaryIntent = 'form';
    else if (detectedPatterns.includes('display')) primaryIntent = 'layout';

    return {
      query: userQuery,
      patterns: detectedPatterns,
      primaryIntent: primaryIntent,
      keywords: this.extractKeywords(query),
      context: this.extractContext(query)
    };
  }

  extractKeywords(query) {
    // Simple keyword extraction - in real implementation, use NLP
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    return [...new Set(words)];
  }

  extractContext(query) {
    const context = {};
    
    if (query.includes('dashboard')) context.page = 'dashboard';
    if (query.includes('form')) context.page = 'form';
    if (query.includes('settings')) context.page = 'settings';
    if (query.includes('mobile')) context.device = 'mobile';
    if (query.includes('desktop')) context.device = 'desktop';
    
    return context;
  }

  async findMatchingComponents(intent, context) {
    const suggestions = [];
    const components = Object.values(this.componentDatabase);
    
    for (const component of components) {
      const score = this.calculateRelevanceScore(component, intent, context);
      
      if (score > 0.3) { // Threshold for relevance
        suggestions.push({
          component: component.name,
          score: score,
          reason: this.generateReason(component, intent),
          tokens: component.tokens,
          variants: component.variants,
          accessibility: component.accessibility
        });
      }
    }
    
    return suggestions.sort((a, b) => b.score - a.score);
  }

  calculateRelevanceScore(component, intent, context) {
    let score = 0;
    
    // Intent matching
    if (component.useCases.some(useCase => 
      intent.keywords.some(keyword => useCase.includes(keyword))
    )) {
      score += 0.4;
    }
    
    // Pattern matching
    if (intent.patterns.includes(component.category)) {
      score += 0.3;
    }
    
    // Context matching
    if (context.page && this.usagePatterns[context.page]?.includes(component.name)) {
      score += 0.2;
    }
    
    // Usage frequency (if available)
    if (this.usagePatterns[component.name]) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  generateReason(component, intent) {
    const reasons = [];
    
    if (intent.patterns.includes(component.category)) {
      reasons.push(`Perfect for ${component.category} needs`);
    }
    
    if (component.useCases.some(useCase => 
      intent.keywords.some(keyword => useCase.includes(keyword))
    )) {
      reasons.push(`Matches your use case`);
    }
    
    if (component.accessibility?.length > 0) {
      reasons.push(`Accessibility features included`);
    }
    
    return reasons.join(', ') || 'Good fit for your needs';
  }

  identifyGaps(intent, suggestions) {
    const gaps = [];
    
    // Check if we have suggestions for the primary intent
    if (suggestions.length === 0) {
      gaps.push({
        type: 'no-matches',
        description: `No existing components found for "${intent.primaryIntent}"`,
        suggestion: 'Consider creating a new component for this use case'
      });
    }
    
    // Check for missing variants
    if (intent.keywords.includes('mobile') && !suggestions.some(s => s.variants?.includes('mobile'))) {
      gaps.push({
        type: 'missing-variant',
        description: 'Mobile-optimized variants not available',
        suggestion: 'Consider adding responsive variants'
      });
    }
    
    // Check for accessibility gaps
    if (intent.keywords.some(k => ['accessible', 'a11y', 'screen-reader'].includes(k))) {
      const hasAccessibility = suggestions.some(s => s.accessibility?.length > 0);
      if (!hasAccessibility) {
        gaps.push({
          type: 'accessibility',
          description: 'Accessibility features may be missing',
          suggestion: 'Review accessibility requirements'
        });
      }
    }
    
    return gaps;
  }

  calculateConfidence(suggestions) {
    if (suggestions.length === 0) return 0;
    
    const avgScore = suggestions.reduce((sum, s) => sum + s.score, 0) / suggestions.length;
    const topScore = suggestions[0]?.score || 0;
    
    return Math.round((avgScore + topScore) / 2 * 100);
  }

  async getComponentDetails(componentName) {
    const component = this.componentDatabase[componentName];
    if (!component) {
      return { success: false, error: 'Component not found' };
    }
    
    // Get token usage details
    const tokenUsage = this.aiConnector.getComponentTokenUsage(componentName);
    
    return {
      success: true,
      component: {
        ...component,
        tokenUsage: tokenUsage,
        usageCount: tokenUsage?.usageCount || 0
      }
    };
  }

  async suggestComponentCombinations(useCase) {
    const combinations = [];
    
    // Common component combinations
    const patterns = {
      'dashboard': [
        { components: ['KPI Card', 'Card Default'], reason: 'Dashboard layout with metrics and content' },
        { components: ['KPI Card', 'Button Primary'], reason: 'Metrics with action buttons' }
      ],
      'form': [
        { components: ['Input Field', 'Button Primary'], reason: 'Standard form with submit button' },
        { components: ['Input Field', 'Card Default', 'Button Primary'], reason: 'Form in a card container' }
      ],
      'settings': [
        { components: ['Input Field', 'Button Primary', 'Card Default'], reason: 'Settings form with grouped fields' }
      ]
    };
    
    const lowerCase = useCase.toLowerCase();
    Object.entries(patterns).forEach(([pattern, combos]) => {
      if (lowerCase.includes(pattern)) {
        combinations.push(...combos);
      }
    });
    
    return combinations;
  }

  async generateComponentPreview(componentName, context = {}) {
    // This would generate a visual preview in Figma
    // For now, return mock data
    const component = this.componentDatabase[componentName];
    if (!component) {
      return { success: false, error: 'Component not found' };
    }
    
    return {
      success: true,
      preview: {
        component: componentName,
        description: component.description,
        tokens: component.tokens,
        variants: component.variants,
        accessibility: component.accessibility
      }
    };
  }
}

// Export for use in plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentSuggester;
} else {
  window.ComponentSuggester = ComponentSuggester;
}





