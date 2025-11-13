// Design System GPT - Figma Plugin
// Main plugin logic for chat interface and AI integration

// Plugin metadata - Larger default size for better readability
figma.showUI(__html__, { 
  width: 500, 
  height: 700
});

// Design System Knowledge Base
let knowledgeBase = null;
let componentMap = null;
let tokenMap = null;

// AI Components
let aiConnector = null;
let componentSuggester = null;
let designAssembler = null;
let ruleCardManager = null;

// Rule Card Manager (embedded)
// Note: In production, this would be loaded from rule-card-manager.js
// For now, we'll use a simplified inline version
class RuleCardManager {
  constructor() {
    this.ruleCards = [];
    this.featureTemplates = [];
    this.customRules = [];
  }

  async initialize() {
    try {
      await this.loadRuleCards();
      await this.loadFeatureTemplates();
      await this.loadCustomRules();
      console.log(`📚 Rule Card Manager initialized: ${this.ruleCards.length} rules, ${this.featureTemplates.length} templates`);
      return { success: true };
    } catch (error) {
      console.error('Rule Card Manager initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async loadRuleCards() {
    // Simplified version - in production, load from docs/generated/rule-cards.json
    this.ruleCards = [
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
        dependencies: { components: ['Dropdown', 'Radio', 'Pills'] },
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
        dependencies: { components: ['Alert', 'Input Field'] },
        accessibility: ['aria-live="polite"', 'aria-invalid'],
        status: 'stable'
      }
    ];
    return { success: true };
  }

  async loadFeatureTemplates() {
    // Simplified version - in production, load from docs/generated/feature-templates.json
    this.featureTemplates = [
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
    ];
    return { success: true };
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

  matchFeatureTemplate(prompt) {
    const lowerPrompt = prompt.toLowerCase();
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

  getRulesForTemplate(templateId) {
    const template = this.featureTemplates.find(t => t.id === templateId);
    if (!template) return [];
    return template.rules
      .map(ruleId => this.ruleCards.find(r => r.id === ruleId))
      .filter(r => r !== undefined);
  }

  getRulesByContext(contextKeywords) {
    return this.ruleCards.filter(rule => {
      return rule.context.some(ctx => 
        contextKeywords.some(keyword => 
          ctx.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });
  }

  getRuleById(ruleId) {
    return this.ruleCards.find(r => r.id === ruleId) || 
           this.customRules.find(r => r.id === ruleId);
  }

  async addCustomRule(rule) {
    try {
      // Use Object.assign instead of spread operator (ES5 compatible)
      const customRule = Object.assign({}, rule, {
        id: rule.id || 'DS-Custom-' + Date.now(),
        status: 'draft',
        lastUpdated: new Date().toISOString()
      });
      this.customRules.push(customRule);
      await figma.clientStorage.setAsync('custom_rules', this.customRules);
      return { success: true, rule: customRule };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  buildContextForAI(prompt) {
    const matchedTemplate = this.matchFeatureTemplate(prompt);
    const relevantRules = matchedTemplate 
      ? this.getRulesForTemplate(matchedTemplate.template.id)
      : this.getRulesByContext(this.extractKeywords(prompt));
    
    return {
      matchedTemplate: (matchedTemplate && matchedTemplate.template) || null,
      confidence: (matchedTemplate && matchedTemplate.confidence) || 0,
      relevantRules: relevantRules,
      allRules: this.ruleCards,
      customRules: this.customRules
    };
  }

  extractKeywords(prompt) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'];
    return prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  getAllRules() {
    // Use concat instead of spread operator (ES5 compatible)
    return this.ruleCards.concat(this.customRules);
  }

  getAllTemplates() {
    return this.featureTemplates;
  }
}

// Initialize the plugin
async function initializePlugin() {
  try {
    console.log("🚀 Initializing Design System GPT...");
    
    // Load knowledge base
    await loadKnowledgeBase();
    
    // Load component token map
    await loadComponentMap();
    
    // Initialize Rule Card Manager first
    await initializeRuleCardManager();
    
    // Initialize AI components (with Rule Card Manager)
    await initializeAI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Notify UI that we're ready
    figma.ui.postMessage({
      type: 'plugin-ready',
      ruleCardsCount: ruleCardManager ? ruleCardManager.getAllRules().length : 0,
      templatesCount: ruleCardManager ? ruleCardManager.getAllTemplates().length : 0
    });
    
    console.log("✅ Design System GPT initialized successfully");
    
  } catch (error) {
    console.error("❌ Failed to initialize plugin:", error);
    figma.notify("Failed to initialize Design System GPT");
  }
}

// Initialize Rule Card Manager
async function initializeRuleCardManager() {
  try {
    console.log("📚 Initializing Rule Card Manager...");
    
    ruleCardManager = new RuleCardManager();
    const result = await ruleCardManager.initialize();
    
    if (!result.success) {
      console.warn(`Rule Card Manager initialization failed: ${result.error}`);
      return false;
    }
    
    console.log("✅ Rule Card Manager initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Rule Card Manager initialization error:", error);
    return false;
  }
}

// Initialize AI components
async function initializeAI() {
  try {
    console.log("🤖 Initializing AI components...");
    
    // Load AI connector (with Rule Card Manager)
    aiConnector = new AIConnector();
    const connectorResult = await aiConnector.initialize(ruleCardManager);
    
    if (!connectorResult.success) {
      console.warn(`AI Connector initialization failed: ${connectorResult.error}`);
      // Continue without AI features (but Rule Cards still work)
      return false;
    }
    
    // Load component suggester
    componentSuggester = new ComponentSuggester(aiConnector);
    const suggesterResult = await componentSuggester.initialize();
    
    if (!suggesterResult.success) {
      console.warn(`Component suggester initialization failed: ${suggesterResult.error}`);
      // Continue without component suggestions
      return false;
    }
    
    // Load design assembler
    designAssembler = new DesignAssembler(aiConnector, componentSuggester);
    const assemblerResult = await designAssembler.initialize();
    
    if (!assemblerResult.success) {
      console.warn(`Design assembler initialization failed: ${assemblerResult.error}`);
      // Continue without design assembly
      return false;
    }
    
    console.log("✅ AI components initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ AI initialization error:", error);
    // Continue without AI features (Rule Cards still work)
    return false;
  }
}

// Load design system knowledge base
async function loadKnowledgeBase() {
  try {
    // In a real implementation, this would load from the generated JSON
    // For now, we'll use a simplified version
    knowledgeBase = {
      components: {
        'Button Primary': {
          description: 'Primary action button with brand styling',
          tokens: ['brand-primary', 'text-inverse', 'space-sm', 'radius-md'],
          usage: 'Primary CTAs, form submissions, main actions',
          variants: ['hover', 'active', 'disabled']
        },
        'Button Secondary': {
          description: 'Secondary action button',
          tokens: ['surface-elevated', 'text-primary', 'border-default'],
          usage: 'Alternative actions, less important CTAs',
          variants: ['hover', 'active', 'disabled']
        },
        'Card Default': {
          description: 'Standard card component for content display',
          tokens: ['surface-base', 'border-subtle', 'space-md', 'radius-lg'],
          usage: 'Content grouping, information display',
          variants: ['elevated', 'interactive']
        },
        'KPI Card': {
          description: 'Key Performance Indicator display card',
          tokens: ['surface-base', 'kpi-positive', 'text-primary', 'space-lg'],
          usage: 'Dashboard metrics, performance indicators',
          variants: ['negative', 'neutral', 'warning']
        },
        'Input Field': {
          description: 'Text input field for form data entry',
          tokens: ['surface-base', 'border-default', 'text-primary', 'space-sm'],
          usage: 'Form inputs, search fields, data entry',
          variants: ['error', 'disabled', 'focused']
        }
      },
      tokens: {
        'brand-primary': { value: '#4d79c7', type: 'color', usage: 'Primary brand color' },
        'brand-secondary': { value: '#5ca5a5', type: 'color', usage: 'Secondary brand color' },
        'surface-base': { value: '#ffffff', type: 'color', usage: 'Background surfaces' },
        'text-primary': { value: '#1f2937', type: 'color', usage: 'Main text color' },
        'kpi-positive': { value: '#5ca5a5', type: 'color', usage: 'Success/positive states' },
        'kpi-negative': { value: '#d46a6a', type: 'color', usage: 'Error/negative states' },
        'space-sm': { value: '8px', type: 'spacing', usage: 'Small padding/margins' },
        'space-md': { value: '16px', type: 'spacing', usage: 'Standard spacing' },
        'space-lg': { value: '24px', type: 'spacing', usage: 'Large spacing' },
        'radius-md': { value: '8px', type: 'radius', usage: 'Medium border radius' },
        'radius-lg': { value: '12px', type: 'radius', usage: 'Large border radius' }
      },
      patterns: {
        'Dashboard Layout': {
          description: 'Standard dashboard layout pattern',
          components: ['Header', 'Sidebar', 'KPI Card', 'Data Table'],
          usage: 'Data-heavy applications, admin panels'
        },
        'Form Design': {
          description: 'Consistent form layout pattern',
          components: ['Input Field', 'Button Primary', 'Button Secondary'],
          usage: 'Data entry forms, user registration'
        },
        'Card Grid': {
          description: 'Grid layout for card components',
          components: ['Card Default', 'KPI Card'],
          usage: 'Content display, product listings'
        }
      }
    };
    
    console.log("📚 Knowledge base loaded");
    
  } catch (error) {
    console.error("Failed to load knowledge base:", error);
    throw error;
  }
}

// Load component token mapping
async function loadComponentMap() {
  try {
    // In a real implementation, this would load from the generated JSON
    componentMap = {
      'Button Primary': {
        tokens: ['brand-primary', 'text-inverse', 'space-sm', 'radius-md'],
        usage_count: 15,
        last_modified: new Date().toISOString()
      },
      'Card Default': {
        tokens: ['surface-base', 'border-subtle', 'space-md', 'radius-lg'],
        usage_count: 8,
        last_modified: new Date().toISOString()
      },
      'KPI Card': {
        tokens: ['surface-base', 'kpi-positive', 'text-primary', 'space-lg'],
        usage_count: 12,
        last_modified: new Date().toISOString()
      }
    };
    
    console.log("🗺️ Component map loaded");
    
  } catch (error) {
    console.error("Failed to load component map:", error);
    throw error;
  }
}

// Set up event listeners
function setupEventListeners() {
  figma.ui.onmessage = (msg) => {
    switch (msg.type) {
      case 'create-component':
        createComponent(msg.component);
        break;
      case 'list-components':
        listComponents(msg.componentType);
        break;
      case 'list-tokens':
        listTokens(msg.tokenType);
        break;
      case 'audit-tokens':
        auditTokens();
        break;
      case 'create-layout':
        createLayout(msg.layout);
        break;
      case 'audit-system':
        auditSystem();
        break;
      case 'suggest-component':
        suggestComponent(msg.query);
        break;
      case 'explain-tokens':
        explainTokens(msg.query);
        break;
      case 'get-knowledge-base':
        sendKnowledgeBase();
        break;
      case 'chat-message':
        handleChatMessage(msg);
        break;
      case 'suggest-components':
        handleComponentSuggestion(msg);
        break;
      case 'assemble-layout':
        handleLayoutAssembly(msg);
        break;
      case 'set-api-key':
        handleApiKeySetting(msg);
        break;
      case 'get-rule-cards':
        handleGetRuleCards();
        break;
      case 'get-feature-templates':
        handleGetFeatureTemplates();
        break;
      case 'add-custom-rule':
        handleAddCustomRule(msg);
        break;
      case 'search-rules':
        handleSearchRules(msg);
        break;
      default:
        console.log('Unknown message type:', msg.type);
    }
  };
}

// New Rule Card handlers
function handleGetRuleCards() {
  if (!ruleCardManager) {
    figma.ui.postMessage({
      type: 'rule-cards-loaded',
      ruleCards: []
    });
    return;
  }
  
  figma.ui.postMessage({
    type: 'rule-cards-loaded',
    ruleCards: ruleCardManager.getAllRules()
  });
}

function handleGetFeatureTemplates() {
  if (!ruleCardManager) {
    figma.ui.postMessage({
      type: 'feature-templates-loaded',
      templates: []
    });
    return;
  }
  
  figma.ui.postMessage({
    type: 'feature-templates-loaded',
    templates: ruleCardManager.getAllTemplates()
  });
}

async function handleAddCustomRule(msg) {
  if (!ruleCardManager) {
    figma.ui.postMessage({
      type: 'custom-rule-added',
      success: false,
      error: 'Rule Card Manager not initialized'
    });
    return;
  }
  
  const result = await ruleCardManager.addCustomRule(msg.rule);
  
  figma.ui.postMessage({
    type: 'custom-rule-added',
    success: result.success,
    rule: result.rule,
    error: result.error
  });
}

function handleSearchRules(msg) {
  if (!ruleCardManager) {
    figma.ui.postMessage({
      type: 'rules-search-result',
      rules: []
    });
    return;
  }
  
  const keywords = msg.query.toLowerCase().split(/\s+/);
  const rules = ruleCardManager.getRulesByContext(keywords);
  
  figma.ui.postMessage({
    type: 'rules-search-result',
    rules: rules,
    query: msg.query
  });
}

// Create a component in Figma
async function createComponent(componentName) {
  try {
    console.log(`Creating component: ${componentName}`);
    
    const componentInfo = knowledgeBase.components[componentName];
    if (!componentInfo) {
      throw new Error(`Component ${componentName} not found`);
    }
    
    // Create a new frame for the component
    const frame = figma.createFrame();
    frame.name = componentName;
    frame.resize(200, 100);
    
    // Apply tokens based on component type
    await applyTokensToComponent(frame, componentInfo.tokens);
    
    // Add to current page
    figma.currentPage.appendChild(frame);
    
    // Center the component
    frame.x = figma.viewport.center.x - frame.width / 2;
    frame.y = figma.viewport.center.y - frame.height / 2;
    
    figma.notify(`✅ Created ${componentName} component`);
    
    // Send success message to UI
    figma.ui.postMessage({
      type: 'component-created',
      component: componentName,
      success: true
    });
    
  } catch (error) {
    console.error(`Failed to create component ${componentName}:`, error);
    figma.notify(`❌ Failed to create ${componentName}`);
    
    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
  }
}

// Apply design tokens to a component
async function applyTokensToComponent(frame, tokens) {
  for (const tokenName of tokens) {
    const token = knowledgeBase.tokens[tokenName];
    if (!token) continue;
    
    switch (token.type) {
      case 'color':
        if (tokenName.includes('background') || tokenName.includes('surface')) {
          frame.fills = [{ type: 'SOLID', color: hexToRgb(token.value) }];
        } else if (tokenName.includes('border')) {
          frame.strokes = [{ type: 'SOLID', color: hexToRgb(token.value) }];
        }
        break;
      case 'spacing':
        const spacingValue = parseInt(token.value);
        frame.paddingLeft = spacingValue;
        frame.paddingRight = spacingValue;
        frame.paddingTop = spacingValue;
        frame.paddingBottom = spacingValue;
        break;
      case 'radius':
        const radiusValue = parseInt(token.value);
        frame.cornerRadius = radiusValue;
        break;
    }
  }
}

// Convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

// List available components
function listComponents(componentType) {
  const components = Object.keys(knowledgeBase.components);
  const filteredComponents = componentType 
    ? components.filter(comp => comp.toLowerCase().includes(componentType.toLowerCase()))
    : components;
  
  figma.ui.postMessage({
    type: 'components-listed',
    components: filteredComponents,
    componentType: componentType
  });
}

// List available tokens
function listTokens(tokenType) {
  const tokens = Object.keys(knowledgeBase.tokens);
  const filteredTokens = tokenType 
    ? tokens.filter(token => token.includes(tokenType))
    : tokens;
  
  figma.ui.postMessage({
    type: 'tokens-listed',
    tokens: filteredTokens,
    tokenType: tokenType
  });
}

// Audit design tokens
async function auditTokens() {
  try {
    console.log("🔍 Running token audit...");
    
    const auditResults = {
      total_tokens: Object.keys(knowledgeBase.tokens).length,
      unused_tokens: [],
      inconsistent_naming: [],
      missing_tokens: [],
      recommendations: []
    };
    
    // Check for unused tokens (simplified check)
    for (const [tokenName, token] of Object.entries(knowledgeBase.tokens)) {
      let isUsed = false;
      
      for (const [componentName, component] of Object.entries(knowledgeBase.components)) {
        if (component.tokens.includes(tokenName)) {
          isUsed = true;
          break;
        }
      }
      
      if (!isUsed) {
        auditResults.unused_tokens.push(tokenName);
      }
    }
    
    // Check for naming inconsistencies
    const colorTokens = Object.keys(knowledgeBase.tokens).filter(t => t.includes('color'));
    const brandTokens = Object.keys(knowledgeBase.tokens).filter(t => t.includes('brand'));
    
    if (colorTokens.length > 0 && brandTokens.length > 0) {
      auditResults.inconsistent_naming.push('Mixed color and brand token naming');
    }
    
    // Generate recommendations
    if (auditResults.unused_tokens.length > 0) {
      auditResults.recommendations.push('Consider removing unused tokens or finding components that use them');
    }
    
    if (auditResults.inconsistent_naming.length > 0) {
      auditResults.recommendations.push('Standardize token naming conventions');
    }
    
    figma.ui.postMessage({
      type: 'audit-complete',
      results: auditResults
    });
    
    figma.notify(`✅ Token audit complete: ${auditResults.unused_tokens.length} unused tokens found`);
    
  } catch (error) {
    console.error("Token audit failed:", error);
    figma.notify("❌ Token audit failed");
    
    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
  }
}

// Create a layout
async function createLayout(layoutType) {
  try {
    console.log(`Creating ${layoutType} layout...`);
    
    const layoutPattern = knowledgeBase.patterns[layoutType];
    if (!layoutPattern) {
      throw new Error(`Layout pattern ${layoutType} not found`);
    }
    
    // Create a new page for the layout
    const page = figma.createPage();
    page.name = `${layoutType} Layout`;
    
    // Create components based on the pattern
    for (const componentName of layoutPattern.components) {
      if (knowledgeBase.components[componentName]) {
        await createComponent(componentName);
      }
    }
    
    figma.notify(`✅ Created ${layoutType} layout`);
    
    figma.ui.postMessage({
      type: 'layout-created',
      layout: layoutType,
      success: true
    });
    
  } catch (error) {
    console.error(`Failed to create layout ${layoutType}:`, error);
    figma.notify(`❌ Failed to create ${layoutType} layout`);
    
    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
  }
}

// Audit the entire design system
async function auditSystem() {
  try {
    console.log("🔍 Running comprehensive design system audit...");
    
    const auditResults = {
      components: {
        total: Object.keys(knowledgeBase.components).length,
        issues: []
      },
      tokens: {
        total: Object.keys(knowledgeBase.tokens).length,
        issues: []
      },
      consistency: {
        issues: []
      },
      recommendations: []
    };
    
    // Check component consistency
    for (const [componentName, component] of Object.entries(knowledgeBase.components)) {
      if (component.tokens.length === 0) {
        auditResults.components.issues.push(`${componentName} has no token definitions`);
      }
      
      if (!component.usage) {
        auditResults.components.issues.push(`${componentName} missing usage documentation`);
      }
    }
    
    // Check token consistency
    for (const [tokenName, token] of Object.entries(knowledgeBase.tokens)) {
      if (!token.usage) {
        auditResults.tokens.issues.push(`${tokenName} missing usage documentation`);
      }
      
      if (token.type === 'color' && !token.value.startsWith('#')) {
        auditResults.tokens.issues.push(`${tokenName} has invalid color format`);
      }
    }
    
    // Generate recommendations
    if (auditResults.components.issues.length > 0) {
      auditResults.recommendations.push('Fix component documentation and token definitions');
    }
    
    if (auditResults.tokens.issues.length > 0) {
      auditResults.recommendations.push('Fix token documentation and format issues');
    }
    
    if (auditResults.components.issues.length === 0 && auditResults.tokens.issues.length === 0) {
      auditResults.recommendations.push('Design system looks great! Consider adding more components or patterns.');
    }
    
    figma.ui.postMessage({
      type: 'system-audit-complete',
      results: auditResults
    });
    
    const totalIssues = auditResults.components.issues.length + auditResults.tokens.issues.length;
    figma.notify(`✅ System audit complete: ${totalIssues} issues found`);
    
  } catch (error) {
    console.error("System audit failed:", error);
    figma.notify("❌ System audit failed");
    
    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
  }
}

// Suggest components based on query
function suggestComponent(query) {
  const suggestions = [];
  const queryLower = query.toLowerCase();
  
  for (const [componentName, component] of Object.entries(knowledgeBase.components)) {
    const relevance = calculateRelevance(queryLower, componentName, component.description, component.usage);
    if (relevance > 0.3) {
      suggestions.push({
        name: componentName,
        description: component.description,
        relevance: relevance,
        tokens: component.tokens
      });
    }
  }
  
  suggestions.sort((a, b) => b.relevance - a.relevance);
  
  figma.ui.postMessage({
    type: 'component-suggestions',
    query: query,
    suggestions: suggestions.slice(0, 5)
  });
}

// Calculate relevance score for component suggestions
function calculateRelevance(query, name, description, usage) {
  let score = 0;
  const queryWords = query.split(' ');
  
  // Check name match
  for (const word of queryWords) {
    if (name.toLowerCase().includes(word)) {
      score += 0.4;
    }
  }
  
  // Check description match
  for (const word of queryWords) {
    if (description.toLowerCase().includes(word)) {
      score += 0.3;
    }
  }
  
  // Check usage match
  if (usage) {
    for (const word of queryWords) {
      if (usage.toLowerCase().includes(word)) {
        score += 0.3;
      }
    }
  }
  
  return Math.min(score, 1);
}

// Explain tokens
function explainTokens(query) {
  const explanations = [];
  const queryLower = query.toLowerCase();
  
  for (const [tokenName, token] of Object.entries(knowledgeBase.tokens)) {
    if (tokenName.toLowerCase().includes(queryLower) || 
        (token.usage && token.usage.toLowerCase().includes(queryLower))) {
      explanations.push({
        name: tokenName,
        value: token.value,
        type: token.type,
        usage: token.usage
      });
    }
  }
  
  figma.ui.postMessage({
    type: 'token-explanations',
    query: query,
    explanations: explanations
  });
}

// Send knowledge base to UI
function sendKnowledgeBase() {
  figma.ui.postMessage({
    type: 'knowledge-base-loaded',
    knowledgeBase: knowledgeBase
  });
}

// New AI-powered message handlers
async function handleChatMessage(msg) {
  try {
    if (!aiConnector) {
      figma.ui.postMessage({ 
        type: 'ai-response', 
        response: 'AI features not available. Please check your API key configuration.',
        error: 'AI not initialized'
      });
      return;
    }

    const result = await aiConnector.processQuery(msg.message, msg.messageHistory || []);
    
    if (result.success) {
      figma.ui.postMessage({ 
        type: 'ai-response', 
        response: result.content,
        actions: result.actions || [],
        suggestions: result.suggestions || []
      });
    } else {
      figma.ui.postMessage({ 
        type: 'ai-response', 
        response: `Error: ${result.error}`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Chat message handling error:', error);
    figma.ui.postMessage({ 
      type: 'ai-response', 
      response: `Error processing message: ${error.message}`,
      error: error.message
    });
  }
}

async function handleComponentSuggestion(msg) {
  try {
    if (!componentSuggester) {
      figma.ui.postMessage({ 
        type: 'component-suggestions', 
        suggestions: [],
        error: 'Component suggester not available'
      });
      return;
    }

    const result = await componentSuggester.suggestComponents(msg.query, msg.context || {});
    
    if (result.success) {
      figma.ui.postMessage({ 
        type: 'component-suggestions', 
        suggestions: result.suggestions,
        intent: result.intent,
        gaps: result.gaps,
        confidence: result.confidence
      });
    } else {
      figma.ui.postMessage({ 
        type: 'component-suggestions', 
        suggestions: [],
        error: result.error
      });
    }
  } catch (error) {
    console.error('Component suggestion error:', error);
    figma.ui.postMessage({ 
      type: 'component-suggestions', 
      suggestions: [],
      error: error.message
    });
  }
}

async function handleLayoutAssembly(msg) {
  try {
    if (!designAssembler) {
      figma.ui.postMessage({ 
        type: 'layout-assembly', 
        success: false,
        error: 'Design assembler not available'
      });
      return;
    }

    const result = await designAssembler.assembleLayout(msg.description, msg.context || {});
    
    if (result.success) {
      figma.ui.postMessage({ 
        type: 'layout-assembly', 
        success: true,
        layout: result.layout,
        frame: result.frame,
        components: result.components,
        spec: result.spec
      });
    } else {
      figma.ui.postMessage({ 
        type: 'layout-assembly', 
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Layout assembly error:', error);
    figma.ui.postMessage({ 
      type: 'layout-assembly', 
      success: false,
      error: error.message
    });
  }
}

async function handleApiKeySetting(msg) {
  try {
    if (!aiConnector) {
      figma.ui.postMessage({ 
        type: 'api-key-result', 
        success: false,
        error: 'AI connector not available'
      });
      return;
    }

    const result = await aiConnector.setApiKey(msg.apiKey);
    
    figma.ui.postMessage({ 
      type: 'api-key-result', 
      success: result.success,
      error: result.error
    });
  } catch (error) {
    console.error('API key setting error:', error);
    figma.ui.postMessage({ 
      type: 'api-key-result', 
      success: false,
      error: error.message
    });
  }
}

// Initialize the plugin when it loads
initializePlugin();
