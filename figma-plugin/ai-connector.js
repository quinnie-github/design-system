// AI Connector for Design System GPT
// Handles OpenAI API communication and response processing

class AIConnector {
  constructor() {
    this.apiKey = null;
    this.model = 'gpt-4o-mini'; // Cost-effective model
    this.maxTokens = 2000; // Increased for Rule Card context
    this.temperature = 0.7;
    this.knowledgeBase = null;
    this.componentMap = null;
    this.ruleCardManager = null;
  }

  async initialize(ruleCardManager = null) {
    try {
      // Load knowledge base and component map
      this.knowledgeBase = await this.loadKnowledgeBase();
      this.componentMap = await this.loadComponentMap();
      
      // Set Rule Card Manager
      this.ruleCardManager = ruleCardManager;
      
      // Get API key from storage
      this.apiKey = await figma.clientStorage.getAsync('openai_api_key');
      
      // Note: API key is optional - we can provide Rule Card-based responses without AI
      if (!this.apiKey) {
        console.warn('OpenAI API key not configured - will use Rule Card-based responses only');
      }
      
      return { success: true };
    } catch (error) {
      console.error('AI Connector initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async loadKnowledgeBase() {
    // In a real implementation, this would load from the generated JSON
    // For now, return a mock knowledge base
    return {
      rules: {
        colors: {
          categories: [
            { name: 'brand', description: 'Primary brand colors' },
            { name: 'kpi', description: 'Colors for metrics and data' },
            { name: 'surface', description: 'Background and container colors' },
            { name: 'text', description: 'Text colors for hierarchy' }
          ]
        },
        components: {
          available: ['Button Primary', 'Card Default', 'KPI Card', 'Input Field']
        }
      },
      tokens: {
        semantic: [
          { name: 'color.brand.primary', type: 'color', category: 'brand' },
          { name: 'color.kpi.positive', type: 'color', category: 'kpi' },
          { name: 'color.surface.base', type: 'color', category: 'surface' },
          { name: 'color.text.primary', type: 'color', category: 'text' }
        ]
      }
    };
  }

  async loadComponentMap() {
    // In a real implementation, this would load from component-token-map.json
    // For now, return mock data
    return {
      'Button Primary': {
        tokens: [
          { name: 'color.brand.primary', type: 'color', value: '#4d79c7' },
          { name: 'color.text.inverse', type: 'color', value: '#ffffff' },
          { name: 'space.md', type: 'number', value: 8 },
          { name: 'radius.medium', type: 'number', value: 8 }
        ],
        usageCount: 15
      },
      'Card Default': {
        tokens: [
          { name: 'color.surface.base', type: 'color', value: '#ffffff' },
          { name: 'color.text.primary', type: 'color', value: '#1a1a1a' },
          { name: 'space.lg', type: 'number', value: 16 },
          { name: 'radius.large', type: 'number', value: 12 }
        ],
        usageCount: 8
      }
    };
  }

  async processQuery(userMessage, messageHistory = []) {
    try {
      // Build context from Rule Cards and Feature Templates
      const ruleCardContext = this.ruleCardManager 
        ? this.ruleCardManager.buildContextForAI(userMessage)
        : null;

      // If we have Rule Card context, use it for response
      if (ruleCardContext && ruleCardContext.matchedTemplate) {
        return this.buildResponseFromRuleCards(userMessage, ruleCardContext);
      }

      // If we have relevant rules but no template match, use rules
      if (ruleCardContext && ruleCardContext.relevantRules.length > 0) {
        return this.buildResponseFromRules(userMessage, ruleCardContext);
      }

      // Fall back to AI if API key is available
      if (this.apiKey) {
        return await this.processWithAI(userMessage, messageHistory, ruleCardContext);
      }

      // No AI and no Rule Cards - provide helpful message
      return {
        success: true,
        content: `I can help you with design system questions! Here's what I know:\n\n` +
          `**Available Components:** ${Object.keys(this.componentMap || {}).join(', ')}\n\n` +
          `**Token Categories:** ${this.knowledgeBase?.rules?.colors?.categories?.map(c => c.name).join(', ') || 'N/A'}\n\n` +
          `To get AI-powered responses, please configure your OpenAI API key in settings.`,
        actions: [],
        suggestions: []
      };
    } catch (error) {
      console.error('AI query processing failed:', error);
      return {
        success: false,
        error: `Processing failed: ${error.message}`
      };
    }
  }

  // Build response from Feature Template
  buildResponseFromRuleCards(prompt, context) {
    const template = context.matchedTemplate;
    const rules = context.relevantRules;

    let response = `## ${template.feature}\n\n`;
    response += `**Intent:** ${template.intent}\n\n`;
    
    if (template.businessRules && template.businessRules.length > 0) {
      response += `### Business Rules:\n`;
      template.businessRules.forEach(rule => {
        response += `- ${rule}\n`;
      });
      response += `\n`;
    }

    if (rules.length > 0) {
      response += `### Design System Rules Applied:\n\n`;
      rules.forEach(rule => {
        response += `**${rule.title}** (${rule.id})\n`;
        response += `- *Rationale:* ${rule.rationale}\n`;
        if (rule.whenToUse && rule.whenToUse.length > 0) {
          response += `- *When to use:* ${rule.whenToUse.join(', ')}\n`;
        }
        response += `\n`;
      });
    }

    if (template.patterns && template.patterns.length > 0) {
      response += `### Recommended Patterns:\n`;
      template.patterns.forEach(pattern => {
        response += `- ${pattern}\n`;
      });
      response += `\n`;
    }

    if (template.a11y && template.a11y.length > 0) {
      response += `### Accessibility Requirements:\n`;
      template.a11y.forEach(req => {
        response += `- ${req}\n`;
      });
      response += `\n`;
    }

    if (template.metrics && template.metrics.length > 0) {
      response += `### Success Metrics:\n`;
      template.metrics.forEach(metric => {
        response += `- ${metric}\n`;
      });
    }

    // Extract actions from template
    const actions = [];
    if (template.outputs?.design) {
      template.outputs.design.forEach(component => {
        actions.push({
          text: `Show ${component}`,
          action: 'show-component',
          component: component,
          type: 'primary'
        });
      });
    }

    return {
      success: true,
      content: response,
      actions: actions,
      suggestions: [],
      template: template,
      rules: rules,
      confidence: context.confidence
    };
  }

  // Build response from Rules only
  buildResponseFromRules(prompt, context) {
    const rules = context.relevantRules;

    let response = `## Design System Guidance\n\n`;
    response += `Based on your question, here are relevant design system rules:\n\n`;

    rules.forEach(rule => {
      response += `### ${rule.title} (${rule.id})\n\n`;
      response += `**Layer:** ${rule.layer}\n\n`;
      response += `**Decision:** ${typeof rule.decision === 'string' ? rule.decision : JSON.stringify(rule.decision)}\n\n`;
      response += `**Rationale:** ${rule.rationale}\n\n`;
      
      if (rule.whenToUse && rule.whenToUse.length > 0) {
        response += `**When to use:**\n`;
        rule.whenToUse.forEach(use => {
          response += `- ${use}\n`;
        });
        response += `\n`;
      }

      if (rule.whenNotToUse && rule.whenNotToUse.length > 0) {
        response += `**When NOT to use:**\n`;
        rule.whenNotToUse.forEach(notUse => {
          response += `- ${notUse}\n`;
        });
        response += `\n`;
      }

      if (rule.dependencies?.components && rule.dependencies.components.length > 0) {
        response += `**Related components:** ${rule.dependencies.components.join(', ')}\n\n`;
      }

      if (rule.accessibility && rule.accessibility.length > 0) {
        response += `**Accessibility:** ${rule.accessibility.join(', ')}\n\n`;
      }

      response += `---\n\n`;
    });

    return {
      success: true,
      content: response,
      actions: [],
      suggestions: [],
      rules: rules
    };
  }

  // Process with AI (fallback)
  async processWithAI(userMessage, messageHistory, ruleCardContext) {
    // Build context from knowledge base and component map
    const context = this.buildContext(ruleCardContext);
    
    // Create system prompt
    const systemPrompt = this.createSystemPrompt(context, ruleCardContext);
    
    // Prepare messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory,
      { role: 'user', content: userMessage }
    ];

    // Call OpenAI API
    const response = await this.callOpenAI(messages);
    
    if (response.success) {
      // Parse response for actions
      const parsedResponse = this.parseResponse(response.content);
      return {
        success: true,
        content: parsedResponse.content,
        actions: parsedResponse.actions,
        suggestions: parsedResponse.suggestions,
        aiGenerated: true
      };
    } else {
      return response;
    }
  }

  buildContext(ruleCardContext = null) {
    const context = {
      designSystem: {
        name: 'Design System GPT',
        version: '1.0.0'
      },
      rules: this.knowledgeBase?.rules || {},
      tokens: this.knowledgeBase?.tokens || {},
      components: this.componentMap || {},
      availableComponents: Object.keys(this.componentMap || {}),
      tokenCategories: this.knowledgeBase?.rules?.colors?.categories || []
    };

    // Add Rule Card context if available
    if (ruleCardContext) {
      context.ruleCards = ruleCardContext.relevantRules || [];
      context.matchedTemplate = ruleCardContext.matchedTemplate || null;
      context.customRules = ruleCardContext.customRules || [];
    }

    return context;
  }

  createSystemPrompt(context, ruleCardContext = null) {
    let prompt = `You are Design System GPT, an intelligent design system assistant. You help Product Managers, Designers, and Developers discover, understand, and work with their design system components and tokens.

## Your Knowledge Base:
- **Available Components:** ${context.availableComponents.join(', ')}
- **Token Categories:** ${context.tokenCategories.map(c => c.name).join(', ')}
- **Design System:** ${context.designSystem.name} v${context.designSystem.version}

## Your Capabilities:
1. **Component Discovery** - Help users find the right components for their needs
2. **Token Explanation** - Explain what tokens do and when to use them
3. **Design Patterns** - Suggest layouts and component combinations
4. **System Audits** - Identify inconsistencies and improvements
5. **PM-Focused Guidance** - Help PMs understand design system decisions and rationale

## Response Format:
Always provide:
- Clear, actionable advice
- Specific component recommendations when relevant
- Token usage explanations
- Design system rationale (why decisions were made)
- Follow-up questions to clarify needs
- Accessibility considerations
- Business rule implications

## Component Information:
${Object.entries(context.components).map(([name, data]) => 
  `**${name}**: Uses ${data.tokens.length} tokens, used ${data.usageCount} times`
).join('\n')}

## Token Information:
${context.tokens.semantic?.map(token => 
  `**${token.name}** (${token.type}): ${token.category} category`
).join('\n')}`;

    // Add Rule Card context if available
    if (ruleCardContext && ruleCardContext.relevantRules && ruleCardContext.relevantRules.length > 0) {
      prompt += `\n\n## Relevant Design System Rules:\n`;
      ruleCardContext.relevantRules.forEach(rule => {
        prompt += `\n**${rule.title}** (${rule.id})\n`;
        prompt += `- Layer: ${rule.layer}\n`;
        prompt += `- Rationale: ${rule.rationale}\n`;
        if (rule.whenToUse) {
          prompt += `- When to use: ${rule.whenToUse.join(', ')}\n`;
        }
      });
    }

    if (ruleCardContext && ruleCardContext.matchedTemplate) {
      prompt += `\n\n## Matched Feature Template:\n`;
      prompt += `**${ruleCardContext.matchedTemplate.feature}**\n`;
      prompt += `- Intent: ${ruleCardContext.matchedTemplate.intent}\n`;
      prompt += `- Patterns: ${ruleCardContext.matchedTemplate.patterns.join(', ')}\n`;
      if (ruleCardContext.matchedTemplate.businessRules) {
        prompt += `- Business Rules: ${ruleCardContext.matchedTemplate.businessRules.join(', ')}\n`;
      }
    }

    prompt += `\n\nBe helpful, specific, and always reference actual components, tokens, and rules from the design system. When explaining decisions, always include the rationale from the Rule Cards.`;

    return prompt;
  }

  async callOpenAI(messages) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return {
          success: true,
          content: data.choices[0].message.content,
          usage: data.usage
        };
      } else {
        throw new Error('No response from OpenAI API');
      }
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  parseResponse(content) {
    // Parse the AI response to extract actions and suggestions
    const actions = [];
    const suggestions = [];
    
    // Look for component recommendations
    const componentMatches = content.match(/\*\*([^*]+)\*\*/g);
    if (componentMatches) {
      componentMatches.forEach(match => {
        const componentName = match.replace(/\*\*/g, '');
        if (this.componentMap[componentName]) {
          actions.push({
            text: `Show ${componentName}`,
            action: 'show-component',
            component: componentName,
            type: 'primary'
          });
        }
      });
    }

    // Look for token references
    const tokenMatches = content.match(/`([^`]+)`/g);
    if (tokenMatches) {
      tokenMatches.forEach(match => {
        const tokenName = match.replace(/`/g, '');
        suggestions.push({
          text: `Explain ${tokenName}`,
          action: 'explain-token',
          token: tokenName
        });
      });
    }

    return {
      content: content,
      actions: actions,
      suggestions: suggestions
    };
  }

  async setApiKey(apiKey) {
    try {
      await figma.clientStorage.setAsync('openai_api_key', apiKey);
      this.apiKey = apiKey;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getApiKey() {
    return await figma.clientStorage.getAsync('openai_api_key');
  }

  // Component suggestion methods
  suggestComponentsForUseCase(useCase) {
    const suggestions = [];
    
    // Simple keyword matching for now
    const lowerCase = useCase.toLowerCase();
    
    if (lowerCase.includes('button') || lowerCase.includes('action')) {
      suggestions.push({
        component: 'Button Primary',
        confidence: 0.9,
        reason: 'Perfect for primary actions and CTAs'
      });
    }
    
    if (lowerCase.includes('card') || lowerCase.includes('container')) {
      suggestions.push({
        component: 'Card Default',
        confidence: 0.8,
        reason: 'Great for grouping related content'
      });
    }
    
    if (lowerCase.includes('kpi') || lowerCase.includes('metric') || lowerCase.includes('data')) {
      suggestions.push({
        component: 'KPI Card',
        confidence: 0.9,
        reason: 'Designed specifically for displaying metrics and KPIs'
      });
    }
    
    if (lowerCase.includes('input') || lowerCase.includes('form') || lowerCase.includes('field')) {
      suggestions.push({
        component: 'Input Field',
        confidence: 0.8,
        reason: 'Standard input component for forms'
      });
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  getComponentTokenUsage(componentName) {
    return this.componentMap[componentName] || null;
  }

  getTokenUsage(tokenName) {
    const usage = [];
    
    Object.entries(this.componentMap).forEach(([componentName, data]) => {
      const tokenUsage = data.tokens.find(t => t.name === tokenName);
      if (tokenUsage) {
        usage.push({
          component: componentName,
          value: tokenUsage.value,
          type: tokenUsage.type
        });
      }
    });
    
    return usage;
  }
}

// Export for use in plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIConnector;
} else {
  window.AIConnector = AIConnector;
}





