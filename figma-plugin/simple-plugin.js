// Simple Design System GPT Plugin - No AI Required
// This version works without OpenAI API for testing

figma.showUI(__html__, { width: 400, height: 600 });

// Simple knowledge base
const knowledgeBase = {
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
      description: 'Generic content container',
      tokens: ['surface-base', 'text-primary', 'space-lg', 'radius-large'],
      usage: 'Content grouping, information display',
      variants: ['elevated', 'outlined', 'flat']
    },
    'KPI Card': {
      description: 'Card for displaying key performance indicators',
      tokens: ['surface-base', 'text-primary', 'kpi-positive', 'space-md'],
      usage: 'Metrics display, dashboard cards, data visualization',
      variants: ['positive', 'negative', 'neutral']
    },
    'Input Field': {
      description: 'Standard input component',
      tokens: ['surface-base', 'text-primary', 'border-default', 'space-sm'],
      usage: 'Forms, data entry, search fields',
      variants: ['text', 'email', 'password', 'number']
    }
  },
  tokens: {
    'brand-primary': { value: '#4d79c7', type: 'color', category: 'brand' },
    'brand-secondary': { value: '#5ca5a5', type: 'color', category: 'brand' },
    'kpi-positive': { value: '#5ca5a5', type: 'color', category: 'kpi' },
    'kpi-negative': { value: '#ef4444', type: 'color', category: 'kpi' },
    'surface-base': { value: '#ffffff', type: 'color', category: 'surface' },
    'text-primary': { value: '#1a1a1a', type: 'color', category: 'text' },
    'space-sm': { value: '8px', type: 'spacing', category: 'spacing' },
    'space-md': { value: '16px', type: 'spacing', category: 'spacing' },
    'space-lg': { value: '24px', type: 'spacing', category: 'spacing' },
    'radius-md': { value: '8px', type: 'radius', category: 'border' },
    'radius-large': { value: '12px', type: 'radius', category: 'border' }
  }
};

// Function to convert hex to RGB for Figma
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// Function to get fallback response
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('data table') || lowerMessage.includes('table')) {
    return `For data table integrations, I recommend these patterns:

**Table Component Patterns:**
• **Sortable Headers** - Use \`Button Secondary\` for sort controls
• **Action Buttons** - Use \`Button Primary\` for main actions, \`Button Secondary\` for secondary actions
• **Status Indicators** - Use \`KPI Card\` components for status badges
• **Row Selection** - Use \`Input Field\` (checkbox variant) for selection

**Integration Features:**
• **Filtering** - Add \`Input Field\` components above the table
• **Pagination** - Use \`Button Secondary\` for page controls
• **Export** - Use \`Button Primary\` for export actions

**Layout Structure:**
1. Filter bar (Input Field components)
2. Table with sortable headers
3. Action bar (Button components)
4. Pagination controls

Would you like me to create a specific table layout for you?`;
  }
  
  if (lowerMessage.includes('component') || lowerMessage.includes('button') || lowerMessage.includes('card')) {
    return `I can help you find the right components! Here are some options:

**Available Components:**
• **Button Primary** - For main actions and CTAs
• **Button Secondary** - For secondary actions
• **Card Default** - For content containers
• **KPI Card** - For displaying metrics and data
• **Input Field** - For forms and data entry

**Quick Actions:**
• Ask me to "show me all components"
• Ask "what component should I use for [specific need]"
• Ask "create a [component type] for me"

What specific component are you looking for?`;
  }
  
  if (lowerMessage.includes('token') || lowerMessage.includes('color') || lowerMessage.includes('spacing')) {
    return `I can help you understand your design tokens! Here's what's available:

**Color Tokens:**
• \`brand-primary\` - Your main brand color (#4d79c7)
• \`brand-secondary\` - Secondary brand color (#5ca5a5)
• \`kpi-positive\` - Success/positive indicators (#5ca5a5)
• \`kpi-negative\` - Error/negative indicators (#ef4444)
• \`surface-base\` - Background colors (#ffffff)
• \`text-primary\` - Main text color (#1a1a1a)

**Spacing Tokens:**
• \`space-sm\` - Small spacing (8px)
• \`space-md\` - Medium spacing (16px)
• \`space-lg\` - Large spacing (24px)

**Usage:**
• Use semantic tokens (like \`brand-primary\`) instead of primitive colors
• Apply spacing tokens consistently across components
• Check contrast ratios for accessibility

Would you like me to explain any specific tokens or show you how to use them?`;
  }
  
  return `I'm here to help with your design system! I can assist with:

• **Component recommendations** - Find the right components for your needs
• **Token explanations** - Understand design tokens and their usage
• **Layout suggestions** - Get recommendations for UI patterns
• **Design patterns** - Learn best practices for your design system

**Quick Tips:**
• Be specific about what you're trying to build
• Ask about components, tokens, or patterns
• I can create layouts and suggest improvements

What would you like to know about your design system?`;
}

// Handle messages from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'chat-message') {
    // Simulate AI response with fallback
    setTimeout(() => {
      const response = getFallbackResponse(msg.message);
      figma.ui.postMessage({ 
        type: 'ai-response', 
        response: response,
        actions: []
      });
    }, 1000); // 1 second delay to simulate thinking
  } else if (msg.type === 'create-component') {
    createComponent(msg.componentName);
  } else if (msg.type === 'list-components') {
    listComponents();
  } else if (msg.type === 'explain-tokens') {
    explainTokens(msg.query);
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Create a component in Figma
function createComponent(componentName) {
  try {
    const componentInfo = knowledgeBase.components[componentName];
    if (!componentInfo) {
      figma.notify(`Component ${componentName} not found`);
      return;
    }
    
    // Create a simple representation
    const frame = figma.createFrame();
    frame.name = componentName;
    frame.resize(200, 100);
    
    // Apply styling based on component type
    if (componentName === 'Button Primary') {
      frame.fills = [{ type: 'SOLID', color: hexToRgb('#4d79c7') }];
      frame.cornerRadius = 8;
    } else if (componentName === 'Card Default') {
      frame.fills = [{ type: 'SOLID', color: hexToRgb('#ffffff') }];
      frame.cornerRadius = 12;
      frame.strokes = [{ type: 'SOLID', color: hexToRgb('#e5e7eb') }];
    } else if (componentName === 'KPI Card') {
      frame.fills = [{ type: 'SOLID', color: hexToRgb('#ffffff') }];
      frame.cornerRadius = 8;
    } else if (componentName === 'Input Field') {
      frame.fills = [{ type: 'SOLID', color: hexToRgb('#ffffff') }];
      frame.cornerRadius = 8;
      frame.strokes = [{ type: 'SOLID', color: hexToRgb('#d1d5db') }];
    }
    
    // Add to current page
    figma.currentPage.appendChild(frame);
    
    // Center it
    frame.x = figma.viewport.center.x - frame.width / 2;
    frame.y = figma.viewport.center.y - frame.height / 2;
    
    // Add text label
    const text = figma.createText();
    text.characters = componentName;
    text.fontSize = 14;
    text.fills = [{ type: 'SOLID', color: hexToRgb('#1a1a1a') }];
    text.x = frame.x + 10;
    text.y = frame.y + 40;
    
    figma.currentPage.appendChild(text);
    
    figma.notify(`Created: ${componentName}`);
    figma.viewport.scrollAndZoomIntoView([frame]);
    
  } catch (error) {
    console.error('Error creating component:', error);
    figma.notify(`Error creating component: ${error.message}`);
  }
}

// List all available components
function listComponents() {
  const componentList = Object.keys(knowledgeBase.components).map(name => {
    const info = knowledgeBase.components[name];
    return `**${name}**: ${info.description}`;
  }).join('\n');
  
  figma.ui.postMessage({
    type: 'ai-response',
    response: `Here are all available components:\n\n${componentList}\n\nAsk me to create any of these components or explain how to use them!`,
    actions: []
  });
}

// Explain tokens
function explainTokens(query) {
  const lowerQuery = query.toLowerCase();
  const matchingTokens = Object.entries(knowledgeBase.tokens)
    .filter(([name, info]) => 
      name.toLowerCase().includes(lowerQuery) || 
      info.category.toLowerCase().includes(lowerQuery)
    )
    .map(([name, info]) => `**${name}**: ${info.value} (${info.category})`)
    .join('\n');
  
  if (matchingTokens) {
    figma.ui.postMessage({
      type: 'ai-response',
      response: `Here are the tokens matching "${query}":\n\n${matchingTokens}`,
      actions: []
    });
  } else {
    figma.ui.postMessage({
      type: 'ai-response',
      response: `No tokens found matching "${query}". Try asking about colors, spacing, or specific token names.`,
      actions: []
    });
  }
}





