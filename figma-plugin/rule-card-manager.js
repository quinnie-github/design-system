// Rule Card Manager for Design System GPT
// Handles Rule Card storage, retrieval, and matching

class RuleCardManager {
  constructor() {
    this.ruleCards = [];
    this.featureTemplates = [];
    this.customRules = [];
  }

  async initialize() {
    try {
      // Load Rule Cards from generated JSON
      await this.loadRuleCards();
      
      // Load Feature Templates
      await this.loadFeatureTemplates();
      
      // Load custom rules from storage
      await this.loadCustomRules();
      
      console.log(`📚 Rule Card Manager initialized: ${this.ruleCards.length} rules, ${this.featureTemplates.length} templates`);
      return { success: true };
    } catch (error) {
      console.error('Rule Card Manager initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async loadRuleCards() {
    try {
      // In a real implementation, this would load from the generated JSON
      // For now, we'll use a simplified version that matches the structure
      const ruleCardsData = {
        ruleCards: [
          {
            id: 'DS-Pattern-010',
            title: 'Dropdown vs Radio vs Pills',
            layer: 'Pattern',
            context: ['single-select', 'option-count'],
            decision: {
              if: [
                { optionCount: '>6', use: 'Dropdown' },
                { optionCount: '<=4', comparison: true, use: 'Radio' },
                { optionCount: '<=5', frequentToggle: true, use: 'Pills' }
              ]
            },
            rationale: 'Balance visibility, space, and cognitive load',
            whenToUse: [
              'Dropdown: >6 options or uneven labels',
              'Radio: ≤4 mutually exclusive options when comparison matters',
              'Pills: ≤5 frequent toggles where state must remain visible'
            ],
            dependencies: {
              components: ['Dropdown', 'Radio', 'Pills']
            },
            accessibility: ['Keyboard navigation', 'Screen reader announcements'],
            status: 'stable'
          },
          {
            id: 'DS-Layout-001',
            title: 'Center Standalone Loader',
            layer: 'Layout',
            component: ['Loading Bar', 'Spinner'],
            context: ['full-page', 'empty-container'],
            decision: 'Center horizontally & vertically; max-width 320px or 60% of container',
            rationale: 'Avoids "half-built page" perception; improves perceived stability',
            whenToUse: ['Loader is the only element in a full-page container'],
            status: 'stable'
          },
          {
            id: 'DS-Found-022',
            title: 'Focus Visibility Always On',
            layer: 'Foundations',
            context: ['all-interactive-elements'],
            decision: 'Do not remove outlines; provide high-contrast focus rings with 2px outer ring',
            rationale: 'Essential for keyboard navigation and accessibility compliance',
            accessibility: ['Visible focus indicators', '2px outer ring', 'High contrast'],
            status: 'stable'
          },
          {
            id: 'DS-Content-030',
            title: 'Error Messaging',
            layer: 'Content',
            context: ['form-validation', 'error-states'],
            decision: 'Error copy = what happened + why it matters + next action',
            rationale: 'Helps users understand and fix errors quickly',
            dependencies: {
              components: ['Alert', 'Input Field']
            },
            accessibility: ['aria-live="polite"', 'aria-invalid'],
            status: 'stable'
          }
        ]
      };
      
      this.ruleCards = ruleCardsData.ruleCards;
      return { success: true };
    } catch (error) {
      console.error('Failed to load Rule Cards:', error);
      return { success: false, error: error.message };
    }
  }

  async loadFeatureTemplates() {
    try {
      const templatesData = {
        templates: [
          {
            id: 'FT-001',
            feature: 'Collect Feedback',
            intent: 'Capture sentiment + details after content',
            pmPrompt: 'Let users give quick feedback after an article',
            patterns: ['IconButtons', 'InlineForm', 'Chips', 'Toast'],
            rules: ['DS-Layout-001', 'DS-Content-030', 'DS-Pattern-010'],
            businessRules: [
              'Binary first then optional detail',
              'Auto-expand inline on click',
              'Limit 200 chars'
            ],
            a11y: ['group label', 'aria-live="polite"'],
            metrics: ['CTR thumbs', 'submitRate'],
            status: 'stable'
          },
          {
            id: 'FT-002',
            feature: 'Delete Confirmation',
            intent: 'Prevent irreversible loss with safe undo',
            pmPrompt: 'Confirm before deleting a project',
            patterns: ['Modal', 'Toast'],
            rules: ['DS-Found-022', 'DS-Content-030'],
            businessRules: [
              'Require typing project name for critical objects',
              'Disable confirm until valid'
            ],
            a11y: ['focus trap in modal'],
            metrics: ['abort rate vs accidental deletions'],
            status: 'stable'
          },
          {
            id: 'FT-003',
            feature: 'Table Filter & Sort',
            intent: 'Add filters and sorting to data table',
            pmPrompt: 'Add filters and sorting to jobs table',
            patterns: ['Side Sheet Filter', 'Sort Dropdown', 'Selected Filter Chips'],
            rules: ['DS-Pattern-010'],
            businessRules: [
              'Auto-apply on change for lightweight filters',
              'Persist via query string'
            ],
            a11y: ['checkbox/radio groups labeled'],
            status: 'stable'
          }
        ]
      };
      
      this.featureTemplates = templatesData.templates;
      return { success: true };
    } catch (error) {
      console.error('Failed to load Feature Templates:', error);
      return { success: false, error: error.message };
    }
  }

  async loadCustomRules() {
    try {
      const customRules = await figma.clientStorage.getAsync('custom_rules') || [];
      this.customRules = customRules;
      return { success: true };
    } catch (error) {
      console.error('Failed to load custom rules:', error);
      return { success: false, error: error.message };
    }
  }

  // Match PM prompt to Feature Template
  matchFeatureTemplate(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Simple keyword matching for now
    // In production, this would use more sophisticated NLP
    for (const template of this.featureTemplates) {
      const keywords = template.pmPrompt.toLowerCase().split(' ');
      const matchScore = keywords.filter(kw => lowerPrompt.includes(kw)).length / keywords.length;
      
      if (matchScore > 0.3) {
        return {
          template,
          confidence: matchScore,
          matchedKeywords: keywords.filter(kw => lowerPrompt.includes(kw))
        };
      }
    }
    
    return null;
  }

  // Get Rule Cards for a Feature Template
  getRulesForTemplate(templateId) {
    const template = this.featureTemplates.find(t => t.id === templateId);
    if (!template) return [];
    
    return template.rules
      .map(ruleId => this.ruleCards.find(r => r.id === ruleId))
      .filter(r => r !== undefined);
  }

  // Get Rule Cards by layer
  getRulesByLayer(layer) {
    return this.ruleCards.filter(r => r.layer === layer);
  }

  // Get Rule Cards by context
  getRulesByContext(contextKeywords) {
    return this.ruleCards.filter(rule => {
      return rule.context.some(ctx => 
        contextKeywords.some(keyword => 
          ctx.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });
  }

  // Get Rule Card by ID
  getRuleById(ruleId) {
    return this.ruleCards.find(r => r.id === ruleId) || 
           this.customRules.find(r => r.id === ruleId);
  }

  // Add custom rule
  async addCustomRule(rule) {
    try {
      const customRule = {
        ...rule,
        id: rule.id || `DS-Custom-${Date.now()}`,
        status: 'draft',
        lastUpdated: new Date().toISOString()
      };
      
      this.customRules.push(customRule);
      await figma.clientStorage.setAsync('custom_rules', this.customRules);
      
      return { success: true, rule: customRule };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Build context for AI from Rule Cards and Templates
  buildContextForAI(prompt) {
    const matchedTemplate = this.matchFeatureTemplate(prompt);
    const relevantRules = matchedTemplate 
      ? this.getRulesForTemplate(matchedTemplate.template.id)
      : this.getRulesByContext(this.extractKeywords(prompt));
    
    return {
      matchedTemplate: matchedTemplate?.template || null,
      confidence: matchedTemplate?.confidence || 0,
      relevantRules: relevantRules,
      allRules: this.ruleCards,
      customRules: this.customRules
    };
  }

  // Extract keywords from prompt
  extractKeywords(prompt) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'];
    
    return prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  // Get all Rule Cards
  getAllRules() {
    return [...this.ruleCards, ...this.customRules];
  }

  // Get all Feature Templates
  getAllTemplates() {
    return this.featureTemplates;
  }
}

// Export for use in plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RuleCardManager;
} else {
  window.RuleCardManager = RuleCardManager;
}

