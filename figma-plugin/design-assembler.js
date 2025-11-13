// Design Assembly Bot
// Composes layouts from existing components based on user descriptions

class DesignAssembler {
  constructor(aiConnector, componentSuggester) {
    this.aiConnector = aiConnector;
    this.componentSuggester = componentSuggester;
    this.layoutTemplates = {};
    this.spacingRules = {};
  }

  async initialize() {
    try {
      this.layoutTemplates = await this.loadLayoutTemplates();
      this.spacingRules = await this.loadSpacingRules();
      return { success: true };
    } catch (error) {
      console.error('Design Assembler initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async loadLayoutTemplates() {
    return {
      'dashboard': {
        name: 'Dashboard Layout',
        description: 'Standard dashboard with header, sidebar, and main content area',
        structure: {
          header: { component: 'Button Primary', position: 'top', width: '100%' },
          sidebar: { component: 'Card Default', position: 'left', width: '250px' },
          main: { 
            components: ['KPI Card', 'Card Default'], 
            position: 'center', 
            layout: 'grid',
            columns: 2
          }
        },
        spacing: {
          container: 'space-lg',
          between: 'space-md',
          padding: 'space-lg'
        }
      },
      'form': {
        name: 'Form Layout',
        description: 'Standard form with input fields and submit button',
        structure: {
          container: { component: 'Card Default', position: 'center' },
          fields: { 
            components: ['Input Field'], 
            layout: 'vertical',
            spacing: 'space-md'
          },
          actions: { 
            component: 'Button Primary', 
            position: 'bottom-right',
            alignment: 'right'
          }
        },
        spacing: {
          container: 'space-lg',
          between: 'space-md',
          padding: 'space-lg'
        }
      },
      'card-grid': {
        name: 'Card Grid Layout',
        description: 'Grid of cards for displaying multiple items',
        structure: {
          container: { 
            components: ['Card Default'], 
            layout: 'grid',
            columns: 3,
            responsive: true
          }
        },
        spacing: {
          container: 'space-lg',
          between: 'space-md',
          padding: 'space-lg'
        }
      }
    };
  }

  async loadSpacingRules() {
    return {
      'space-xs': 4,
      'space-sm': 8,
      'space-md': 16,
      'space-lg': 24,
      'space-xl': 32
    };
  }

  async assembleLayout(description, context = {}) {
    try {
      // Analyze the description to determine layout type
      const layoutType = this.analyzeLayoutType(description);
      
      // Get component suggestions
      const suggestions = await this.componentSuggester.suggestComponents(description, context);
      
      // Select appropriate template or create custom layout
      let layout;
      if (this.layoutTemplates[layoutType]) {
        layout = this.layoutTemplates[layoutType];
      } else {
        layout = await this.createCustomLayout(description, suggestions);
      }
      
      // Generate Figma frame
      const frame = await this.createFigmaFrame(layout, context);
      
      return {
        success: true,
        layout: layout,
        frame: frame,
        components: suggestions.suggestions || [],
        spec: this.generateHandoffSpec(layout, suggestions)
      };
    } catch (error) {
      console.error('Layout assembly failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  analyzeLayoutType(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('dashboard') || desc.includes('overview')) return 'dashboard';
    if (desc.includes('form') || desc.includes('input')) return 'form';
    if (desc.includes('grid') || desc.includes('cards')) return 'card-grid';
    if (desc.includes('list') || desc.includes('table')) return 'list';
    
    return 'custom';
  }

  async createCustomLayout(description, suggestions) {
    const components = suggestions.suggestions || [];
    
    return {
      name: 'Custom Layout',
      description: description,
      structure: {
        container: { 
          components: components.map(c => c.component),
          layout: 'vertical',
          spacing: 'space-md'
        }
      },
      spacing: {
        container: 'space-lg',
        between: 'space-md',
        padding: 'space-lg'
      }
    };
  }

  async createFigmaFrame(layout, context) {
    try {
      // Create main frame
      const frame = figma.createFrame();
      frame.name = layout.name;
      frame.resize(800, 600);
      frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // White background
      frame.cornerRadius = 8;
      
      // Add to current page
      figma.currentPage.appendChild(frame);
      
      // Position frame
      frame.x = figma.viewport.center.x - frame.width / 2;
      frame.y = figma.viewport.center.y - frame.height / 2;
      
      // Create components based on layout structure
      await this.createLayoutComponents(frame, layout, context);
      
      // Apply spacing
      this.applySpacing(frame, layout.spacing);
      
      // Center and zoom to frame
      figma.viewport.scrollAndZoomIntoView([frame]);
      
      return {
        id: frame.id,
        name: frame.name,
        width: frame.width,
        height: frame.height
      };
    } catch (error) {
      console.error('Figma frame creation failed:', error);
      throw error;
    }
  }

  async createLayoutComponents(parentFrame, layout, context) {
    const structure = layout.structure;
    
    // Create header if specified
    if (structure.header) {
      await this.createComponent(parentFrame, structure.header, { x: 0, y: 0 });
    }
    
    // Create sidebar if specified
    if (structure.sidebar) {
      await this.createComponent(parentFrame, structure.sidebar, { x: 0, y: 60 });
    }
    
    // Create main content area
    if (structure.main) {
      const mainX = structure.sidebar ? 250 : 0;
      await this.createMainContent(parentFrame, structure.main, { x: mainX, y: 60 });
    }
    
    // Create container components
    if (structure.container) {
      await this.createContainerComponents(parentFrame, structure.container, { x: 20, y: 20 });
    }
  }

  async createComponent(parentFrame, componentSpec, position) {
    const componentName = componentSpec.component;
    
    // Create a simple representation of the component
    const rect = figma.createRectangle();
    rect.name = componentName;
    rect.resize(200, 100);
    
    // Apply component-specific styling
    if (componentName === 'Button Primary') {
      rect.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.47, b: 0.78 } }]; // Brand primary
      rect.cornerRadius = 8;
    } else if (componentName === 'Card Default') {
      rect.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }]; // Surface base
      rect.cornerRadius = 12;
    } else if (componentName === 'KPI Card') {
      rect.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }]; // Surface base
      rect.cornerRadius = 8;
    } else if (componentName === 'Input Field') {
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // White
      rect.cornerRadius = 8;
      rect.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }]; // Border
    }
    
    // Position the component
    rect.x = position.x;
    rect.y = position.y;
    
    // Add to parent frame
    parentFrame.appendChild(rect);
    
    // Add text label
    const text = figma.createText();
    text.characters = componentName;
    text.fontSize = 12;
    text.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }]; // Text primary
    text.x = position.x + 10;
    text.y = position.y + 40;
    
    parentFrame.appendChild(text);
    
    return rect;
  }

  async createMainContent(parentFrame, mainSpec, position) {
    const components = mainSpec.components || [];
    const layout = mainSpec.layout || 'vertical';
    const columns = mainSpec.columns || 1;
    
    let currentY = position.y;
    let currentX = position.x;
    
    components.forEach((componentName, index) => {
      if (layout === 'grid') {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = position.x + (col * 220);
        const y = position.y + (row * 120);
        
        this.createComponent(parentFrame, { component: componentName }, { x, y });
      } else {
        this.createComponent(parentFrame, { component: componentName }, { x: currentX, y: currentY });
        currentY += 120;
      }
    });
  }

  async createContainerComponents(parentFrame, containerSpec, position) {
    const components = containerSpec.components || [];
    const layout = containerSpec.layout || 'vertical';
    const spacing = containerSpec.spacing || 'space-md';
    
    let currentY = position.y;
    let currentX = position.x;
    const spacingValue = this.spacingRules[spacing] || 16;
    
    components.forEach((componentName, index) => {
      this.createComponent(parentFrame, { component: componentName }, { x: currentX, y: currentY });
      
      if (layout === 'vertical') {
        currentY += 100 + spacingValue;
      } else if (layout === 'horizontal') {
        currentX += 200 + spacingValue;
      }
    });
  }

  applySpacing(frame, spacingRules) {
    // Apply padding to the frame
    const padding = spacingRules.padding ? this.spacingRules[spacingRules.padding] : 20;
    frame.paddingLeft = padding;
    frame.paddingRight = padding;
    frame.paddingTop = padding;
    frame.paddingBottom = padding;
  }

  generateHandoffSpec(layout, suggestions) {
    const spec = {
      title: layout.name,
      description: layout.description,
      components: [],
      tokens: new Set(),
      spacing: layout.spacing,
      accessibility: [],
      notes: []
    };
    
    // Extract component information
    if (suggestions.suggestions) {
      suggestions.suggestions.forEach(suggestion => {
        spec.components.push({
          name: suggestion.component,
          reason: suggestion.reason,
          tokens: suggestion.tokens || [],
          variants: suggestion.variants || []
        });
        
        // Collect tokens
        if (suggestion.tokens) {
          suggestion.tokens.forEach(token => spec.tokens.add(token));
        }
      });
    }
    
    // Add accessibility notes
    spec.components.forEach(comp => {
      if (comp.variants.includes('accessibility')) {
        spec.accessibility.push(`${comp.name} includes accessibility features`);
      }
    });
    
    // Add implementation notes
    spec.notes.push('Generated by Design System GPT');
    spec.notes.push('All components use semantic tokens for consistency');
    spec.notes.push('Responsive design considerations included');
    
    return spec;
  }

  async generateCodePreview(layout, suggestions) {
    // Generate code preview for the assembled layout
    const spec = this.generateHandoffSpec(layout, suggestions);
    
    const codePreview = {
      react: this.generateReactCode(spec),
      css: this.generateCSSCode(spec),
      tokens: this.generateTokenUsage(spec)
    };
    
    return codePreview;
  }

  generateReactCode(spec) {
    let code = `// ${spec.title}\n`;
    code += `// Generated by Design System GPT\n\n`;
    code += `import { tokens } from '@/styles/tokens';\n\n`;
    code += `export const ${spec.title.replace(/\s+/g, '')} = () => {\n`;
    code += `  return (\n`;
    code += `    <div className="layout-container" style={{\n`;
    code += `      padding: tokens.space.${spec.spacing.padding},\n`;
    code += `      display: 'flex',\n`;
    code += `      flexDirection: 'column',\n`;
    code += `      gap: tokens.space.${spec.spacing.between}\n`;
    code += `    }}>\n`;
    
    spec.components.forEach(comp => {
      code += `      <${comp.name.replace(/\s+/g, '')} />\n`;
    });
    
    code += `    </div>\n`;
    code += `  );\n`;
    code += `};\n`;
    
    return code;
  }

  generateCSSCode(spec) {
    let css = `/* ${spec.title} Styles */\n`;
    css += `/* Generated by Design System GPT */\n\n`;
    css += `.layout-container {\n`;
    css += `  padding: var(--space-${spec.spacing.padding});\n`;
    css += `  display: flex;\n`;
    css += `  flex-direction: column;\n`;
    css += `  gap: var(--space-${spec.spacing.between});\n`;
    css += `}\n\n`;
    
    return css;
  }

  generateTokenUsage(spec) {
    const tokens = Array.from(spec.tokens);
    return {
      used: tokens,
      categories: {
        color: tokens.filter(t => t.startsWith('color.')),
        spacing: tokens.filter(t => t.startsWith('space.')),
        radius: tokens.filter(t => t.startsWith('radius.'))
      }
    };
  }
}

// Export for use in plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesignAssembler;
} else {
  window.DesignAssembler = DesignAssembler;
}





