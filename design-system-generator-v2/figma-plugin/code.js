/**
 * Design System Generator v2.0 - Figma Plugin
 *
 * This plugin imports JSON from the web app and generates:
 * - Figma variables for colors, typography, spacing
 * - Component library with proper styling
 * - Organized design system page
 */

// Show the UI
figma.showUI(__html__, {
  width: 480,
  height: 680,
  title: 'Design System Generator v2.0'
});

// Store the imported data
let designSystemData = null;

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'import-json') {
      designSystemData = msg.data;
      figma.ui.postMessage({
        type: 'json-imported',
        success: true,
        summary: generateSummary(designSystemData)
      });
    }

    if (msg.type === 'generate-system') {
      if (!designSystemData) {
        figma.ui.postMessage({
          type: 'error',
          message: 'No design system data loaded. Please import JSON first.'
        });
        return;
      }

      const options = msg.options;
      const systemName = msg.systemName || 'Design System';

      figma.ui.postMessage({
        type: 'generation-started',
        message: 'Starting design system generation...'
      });

      // Generate the design system
      const result = await generateDesignSystem(designSystemData, systemName, options);

      figma.ui.postMessage({
        type: 'generation-complete',
        success: true,
        result: result
      });

      // Notify user
      figma.notify('✨ Design system generated successfully!');
    }

    if (msg.type === 'cancel') {
      figma.closePlugin();
    }

  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error.message || 'An unexpected error occurred'
    });
    figma.notify('❌ Error: ' + error.message, { error: true });
  }
};

/**
 * Generate summary of imported design system data
 */
function generateSummary(data) {
  const summary = {
    colors: 0,
    typography: 0,
    spacing: 0,
    buttons: 0,
    gradients: 0,
    hasAppInsights: false
  };

  if (data.colors) {
    ['primary', 'secondary', 'text', 'background', 'accent'].forEach(category => {
      if (data.colors[category]) {
        summary.colors += data.colors[category].length;
      }
    });
  }

  if (data.typography) {
    if (data.typography.fontFamilies) summary.typography += data.typography.fontFamilies.length;
    if (data.typography.fontSizes) summary.typography += data.typography.fontSizes.length;
  }

  if (data.spacing && data.spacing.scale) {
    summary.spacing = data.spacing.scale.length;
  }

  if (data.buttons && data.buttons.variants) {
    summary.buttons = data.buttons.variants.length;
  }

  if (data.gradients) {
    summary.gradients = data.gradients.length;
  }

  if (data.applicationInsights) {
    summary.hasAppInsights = true;
  }

  return summary;
}

/**
 * Main function to generate design system
 */
async function generateDesignSystem(data, systemName, options) {
  const result = {
    variableCollectionId: null,
    componentsCreated: [],
    pageCreated: false,
    errors: []
  };

  try {
    // Create a new page for the design system
    if (options.createPage) {
      const page = figma.createPage();
      page.name = systemName;
      figma.currentPage = page;
      result.pageCreated = true;
    }

    // Create variable collection
    if (options.createVariables) {
      const collectionId = await createVariableCollection(data, systemName);
      result.variableCollectionId = collectionId;
    }

    // Generate components
    if (options.generateComponents) {
      const components = await createComponents(data, systemName, result.variableCollectionId);
      result.componentsCreated = components;
    }

    return result;

  } catch (error) {
    console.error('Generation error:', error);
    result.errors.push(error.message);
    throw error;
  }
}

/**
 * Create variable collection from design system data
 */
async function createVariableCollection(data, systemName) {
  try {
    // Create or find collection
    const collections = figma.variables.getLocalVariableCollections();
    let collection = collections.find(c => c.name === systemName);

    if (!collection) {
      collection = figma.variables.createVariableCollection(systemName);
    }

    // Get the default mode
    const modeId = collection.modes[0].modeId;

    // Track created variables
    const createdVariables = {
      colors: [],
      typography: [],
      spacing: []
    };

    // Create color variables
    if (data.colors) {
      await createColorVariables(data.colors, collection, modeId, createdVariables);
    }

    // Create spacing variables
    if (data.spacing && data.spacing.scale) {
      await createSpacingVariables(data.spacing.scale, collection, modeId, createdVariables);
    }

    figma.notify(`✅ Created ${createdVariables.colors.length} color variables and ${createdVariables.spacing.length} spacing variables`);

    return collection.id;

  } catch (error) {
    console.error('Error creating variables:', error);
    throw new Error('Failed to create variables: ' + error.message);
  }
}

/**
 * Create color variables
 */
async function createColorVariables(colors, collection, modeId, createdVariables) {
  const categories = ['primary', 'secondary', 'text', 'background', 'accent'];

  for (const category of categories) {
    if (!colors[category] || colors[category].length === 0) continue;

    colors[category].forEach((color, index) => {
      try {
        const colorValue = typeof color === 'string' ? color : (color.hex || color.value);
        if (!colorValue) return;

        // Parse hex color
        const rgb = hexToRgb(colorValue);
        if (!rgb) return;

        // Create variable name
        const varName = `color/${category}${colors[category].length > 1 ? '/' + (index + 1) : ''}`;

        // Create variable
        const variable = figma.variables.createVariable(varName, collection, 'COLOR');
        variable.setValueForMode(modeId, rgb);

        // Add description if available
        if (typeof color === 'object' && color.usage) {
          variable.description = color.usage;
        }

        createdVariables.colors.push(variable);

      } catch (error) {
        console.error(`Error creating color variable for ${category}:`, error);
      }
    });
  }
}

/**
 * Create spacing variables
 */
async function createSpacingVariables(spacingScale, collection, modeId, createdVariables) {
  spacingScale.forEach((value, index) => {
    try {
      // Parse spacing value (e.g., "8px", "16", "1rem")
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;

      // Create variable name
      const varName = `spacing/${index + 1}`;

      // Create variable
      const variable = figma.variables.createVariable(varName, collection, 'FLOAT');
      variable.setValueForMode(modeId, numValue);

      createdVariables.spacing.push(variable);

    } catch (error) {
      console.error(`Error creating spacing variable for ${value}:`, error);
    }
  });
}

/**
 * Create components from design system data
 */
async function createComponents(data, systemName, variableCollectionId) {
  const components = [];

  try {
    // Create a frame to hold all components
    const containerFrame = figma.createFrame();
    containerFrame.name = `${systemName} - Components`;
    containerFrame.resize(1200, 800);
    containerFrame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
    containerFrame.layoutMode = 'VERTICAL';
    containerFrame.primaryAxisSizing = 'AUTO';
    containerFrame.counterAxisSizing = 'AUTO';
    containerFrame.paddingLeft = 40;
    containerFrame.paddingRight = 40;
    containerFrame.paddingTop = 40;
    containerFrame.paddingBottom = 40;
    containerFrame.itemSpacing = 32;

    // Create header
    const header = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    header.characters = systemName;
    header.fontSize = 32;
    header.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    containerFrame.appendChild(header);

    // Create color palette
    if (data.colors) {
      const colorSection = await createColorPalette(data.colors, variableCollectionId);
      if (colorSection) {
        containerFrame.appendChild(colorSection);
        components.push('Color Palette');
      }
    }

    // Create button components
    if (data.buttons && data.buttons.variants) {
      const buttonComponents = await createButtonComponents(data.buttons.variants, data.colors, variableCollectionId);
      buttonComponents.forEach(btn => {
        containerFrame.appendChild(btn);
        components.push(btn.name);
      });
    }

    // Position the container
    containerFrame.x = 100;
    containerFrame.y = 100;

    figma.viewport.scrollAndZoomIntoView([containerFrame]);

    return components;

  } catch (error) {
    console.error('Error creating components:', error);
    throw new Error('Failed to create components: ' + error.message);
  }
}

/**
 * Create color palette display
 */
async function createColorPalette(colors, variableCollectionId) {
  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

    const paletteFrame = figma.createFrame();
    paletteFrame.name = 'Color Palette';
    paletteFrame.layoutMode = 'VERTICAL';
    paletteFrame.primaryAxisSizing = 'AUTO';
    paletteFrame.counterAxisSizing = 'AUTO';
    paletteFrame.itemSpacing = 16;

    const categories = ['primary', 'secondary', 'text', 'background', 'accent'];

    for (const category of categories) {
      if (!colors[category] || colors[category].length === 0) continue;

      // Category label
      const label = figma.createText();
      label.characters = category.charAt(0).toUpperCase() + category.slice(1);
      label.fontSize = 16;
      label.fontName = { family: 'Inter', style: 'Medium' };
      label.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
      paletteFrame.appendChild(label);

      // Color swatches
      const swatchRow = figma.createFrame();
      swatchRow.name = `${category}-row`;
      swatchRow.layoutMode = 'HORIZONTAL';
      swatchRow.primaryAxisSizing = 'AUTO';
      swatchRow.counterAxisSizing = 'AUTO';
      swatchRow.itemSpacing = 12;

      colors[category].forEach((color, index) => {
        const colorValue = typeof color === 'string' ? color : (color.hex || color.value);
        const rgb = hexToRgb(colorValue);

        if (rgb) {
          const swatch = figma.createFrame();
          swatch.name = `${category}-${index + 1}`;
          swatch.resize(80, 80);
          swatch.fills = [{ type: 'SOLID', color: rgb }];
          swatch.cornerRadius = 8;

          // Add color value label
          const colorLabel = figma.createText();
          colorLabel.characters = colorValue;
          colorLabel.fontSize = 10;
          colorLabel.fontName = { family: 'Inter', style: 'Regular' };

          // Choose text color based on background lightness
          const lightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
          colorLabel.fills = [{
            type: 'SOLID',
            color: lightness > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 }
          }];

          swatch.appendChild(colorLabel);
          colorLabel.x = 8;
          colorLabel.y = 8;

          swatchRow.appendChild(swatch);
        }
      });

      paletteFrame.appendChild(swatchRow);
    }

    return paletteFrame;

  } catch (error) {
    console.error('Error creating color palette:', error);
    return null;
  }
}

/**
 * Create button components
 */
async function createButtonComponents(buttonVariants, colors, variableCollectionId) {
  const buttonComponents = [];

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

    // Get primary color
    let primaryColor = { r: 0.4, g: 0.4, b: 0.9 }; // default
    if (colors && colors.primary && colors.primary[0]) {
      const colorValue = typeof colors.primary[0] === 'string' ? colors.primary[0] : colors.primary[0].hex;
      primaryColor = hexToRgb(colorValue) || primaryColor;
    }

    // Create at least one button component
    const variantsToCreate = buttonVariants.length > 0 ? buttonVariants.slice(0, 3) : [{ name: 'Primary', type: 'primary' }];

    variantsToCreate.forEach((variant, index) => {
      const variantName = typeof variant === 'string' ? variant : (variant.name || variant.type || `Button ${index + 1}`);

      // Create button frame
      const button = figma.createFrame();
      button.name = `Button/${variantName}`;
      button.resize(140, 44);
      button.cornerRadius = 8;
      button.fills = [{ type: 'SOLID', color: primaryColor }];
      button.layoutMode = 'HORIZONTAL';
      button.primaryAxisAlignItems = 'CENTER';
      button.counterAxisAlignItems = 'CENTER';
      button.paddingLeft = 24;
      button.paddingRight = 24;
      button.paddingTop = 12;
      button.paddingBottom = 12;

      // Add text
      const buttonText = figma.createText();
      buttonText.characters = variantName;
      buttonText.fontSize = 14;
      buttonText.fontName = { family: 'Inter', style: 'Medium' };
      buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      button.appendChild(buttonText);

      // Create component
      const component = figma.createComponentFromNode(button);
      component.name = `Button/${variantName}`;

      buttonComponents.push(component);
    });

    return buttonComponents;

  } catch (error) {
    console.error('Error creating button components:', error);
    return [];
  }
}

/**
 * Helper: Convert hex color to RGB
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle shorthand hex (e.g., #fff)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  if (hex.length !== 6) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r, g, b };
}
