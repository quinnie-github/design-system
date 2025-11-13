/**
 * Design System Generator v2.0 - Enhanced Figma Plugin
 *
 * Creates a comprehensive design system with:
 * - Application insights
 * - Complete component library
 * - Usage examples and documentation
 * - Figma variables
 */

// Show the UI
figma.showUI(__html__, {
  width: 480,
  height: 680,
  title: 'Design System Generator v2.0'
});

let designSystemData = null;

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

      const result = await generateDesignSystem(designSystemData, systemName, options);

      figma.ui.postMessage({
        type: 'generation-complete',
        success: true,
        result: result
      });

      figma.notify('✨ Complete design system generated!');
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
 * Main generation function - creates comprehensive design system
 */
async function generateDesignSystem(data, systemName, options) {
  const result = {
    variableCollectionId: null,
    componentsCreated: [],
    pageCreated: false,
    errors: []
  };

  try {
    // Load required fonts
    await loadRequiredFonts();

    // Create new page
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

    // Generate comprehensive components and documentation
    if (options.generateComponents) {
      const mainFrame = await createDesignSystemLayout(data, systemName, result.variableCollectionId);
      result.componentsCreated.push('Complete Design System');

      // Zoom to view the entire system
      figma.viewport.scrollAndZoomIntoView([mainFrame]);
    }

    return result;

  } catch (error) {
    console.error('Generation error:', error);
    result.errors.push(error.message);
    throw error;
  }
}

/**
 * Load fonts needed for the design system
 */
async function loadRequiredFonts() {
  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  } catch (error) {
    console.warn('Could not load Inter font, using default');
  }
}

/**
 * Create the main design system layout with all sections
 */
async function createDesignSystemLayout(data, systemName, variableCollectionId) {
  const mainFrame = figma.createFrame();
  mainFrame.name = systemName;
  mainFrame.resize(1600, 3000);
  mainFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
  mainFrame.x = 100;
  mainFrame.y = 100;

  let yOffset = 80;

  // 1. Header
  const header = await createHeader(systemName, data);
  mainFrame.appendChild(header);
  header.x = 80;
  header.y = yOffset;
  yOffset += header.height + 60;

  // 2. Application Insights (if available)
  if (data.applicationInsights) {
    const insights = await createInsightsSection(data.applicationInsights);
    mainFrame.appendChild(insights);
    insights.x = 80;
    insights.y = yOffset;
    yOffset += insights.height + 60;
  }

  // 3. Color Palette
  const colorSection = await createColorSection(data.colors, variableCollectionId);
  mainFrame.appendChild(colorSection);
  colorSection.x = 80;
  colorSection.y = yOffset;
  yOffset += colorSection.height + 60;

  // 4. Typography
  const typoSection = await createTypographySection(data.typography);
  mainFrame.appendChild(typoSection);
  typoSection.x = 80;
  typoSection.y = yOffset;
  yOffset += typoSection.height + 60;

  // 5. Spacing
  const spacingSection = await createSpacingSection(data.spacing);
  mainFrame.appendChild(spacingSection);
  spacingSection.x = 80;
  spacingSection.y = yOffset;
  yOffset += spacingSection.height + 60;

  // 6. Components
  const componentsSection = await createComponentsSection(data, variableCollectionId);
  mainFrame.appendChild(componentsSection);
  componentsSection.x = 80;
  componentsSection.y = yOffset;
  yOffset += componentsSection.height + 60;

  // 7. Usage Examples
  const examplesSection = await createUsageExamples(data, variableCollectionId);
  mainFrame.appendChild(examplesSection);
  examplesSection.x = 80;
  examplesSection.y = yOffset;

  return mainFrame;
}

/**
 * Create header section
 */
async function createHeader(systemName, data) {
  const headerFrame = figma.createFrame();
  headerFrame.name = 'Header';
  headerFrame.layoutMode = 'VERTICAL';
  headerFrame.primaryAxisSizing = 'AUTO';
  headerFrame.counterAxisSizing = 'AUTO';
  headerFrame.itemSpacing = 12;
  headerFrame.fills = [];

  // Title
  const title = figma.createText();
  title.characters = systemName;
  title.fontSize = 48;
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fills = [{ type: 'SOLID', color: { r: 0.05, g: 0.05, b: 0.05 } }];
  headerFrame.appendChild(title);

  // Subtitle
  const subtitle = figma.createText();
  subtitle.characters = 'Complete Design System • Generated with AI';
  subtitle.fontSize = 16;
  subtitle.fontName = { family: 'Inter', style: 'Regular' };
  subtitle.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  headerFrame.appendChild(subtitle);

  // Metadata
  if (data.metadata) {
    const meta = figma.createText();
    meta.characters = `Generated: ${new Date(data.metadata.generatedAt).toLocaleDateString()}`;
    meta.fontSize = 12;
    meta.fontName = { family: 'Inter', style: 'Regular' };
    meta.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
    headerFrame.appendChild(meta);
  }

  return headerFrame;
}

/**
 * Create application insights section
 */
async function createInsightsSection(insights) {
  const section = figma.createFrame();
  section.name = 'Application Insights';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizing = 'AUTO';
  section.counterAxisSizing = 'FIXED';
  section.resize(1440, 100);
  section.itemSpacing = 24;
  section.paddingTop = 32;
  section.paddingBottom = 32;
  section.paddingLeft = 32;
  section.paddingRight = 32;
  section.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
  section.cornerRadius = 12;

  // Section title
  const titleText = figma.createText();
  titleText.characters = '💡 Application Insights';
  titleText.fontSize = 24;
  titleText.fontName = { family: 'Inter', style: 'Semi Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(titleText);

  // Insights grid
  const grid = figma.createFrame();
  grid.layoutMode = 'HORIZONTAL';
  grid.primaryAxisSizing = 'AUTO';
  grid.counterAxisSizing = 'AUTO';
  grid.itemSpacing = 24;
  grid.fills = [];

  const insightFields = [
    { label: 'Type', value: insights.type },
    { label: 'Purpose', value: insights.primaryPurpose },
    { label: 'Audience', value: insights.targetAudience },
    { label: 'Style', value: insights.designStyle }
  ];

  for (const field of insightFields) {
    if (field.value) {
      const card = await createInsightCard(field.label, field.value);
      grid.appendChild(card);
    }
  }

  section.appendChild(grid);

  // Key features
  if (insights.keyFeatures && insights.keyFeatures.length > 0) {
    const featuresTitle = figma.createText();
    featuresTitle.characters = 'Key Features:';
    featuresTitle.fontSize = 14;
    featuresTitle.fontName = { family: 'Inter', style: 'Semi Bold' };
    featuresTitle.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
    section.appendChild(featuresTitle);

    const featuresList = figma.createText();
    featuresList.characters = insights.keyFeatures.map((f, i) => `• ${f}`).join('\n');
    featuresList.fontSize = 13;
    featuresList.fontName = { family: 'Inter', style: 'Regular' };
    featuresList.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
    section.appendChild(featuresList);
  }

  return section;
}

/**
 * Create insight card
 */
async function createInsightCard(label, value) {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizing = 'AUTO';
  card.counterAxisSizing = 'AUTO';
  card.itemSpacing = 6;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.cornerRadius = 8;
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.05 },
    offset: { x: 0, y: 2 },
    radius: 4,
    visible: true,
    blendMode: 'NORMAL'
  }];

  const labelText = figma.createText();
  labelText.characters = label.toUpperCase();
  labelText.fontSize = 11;
  labelText.fontName = { family: 'Inter', style: 'Semi Bold' };
  labelText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
  labelText.letterSpacing = { value: 0.5, unit: 'PIXELS' };
  card.appendChild(labelText);

  const valueText = figma.createText();
  valueText.characters = value;
  valueText.fontSize = 14;
  valueText.fontName = { family: 'Inter', style: 'Medium' };
  valueText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  card.appendChild(valueText);

  return card;
}

/**
 * Create color section with swatches and documentation
 */
async function createColorSection(colors, variableCollectionId) {
  const section = figma.createFrame();
  section.name = 'Colors';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizing = 'AUTO';
  section.counterAxisSizing = 'FIXED';
  section.resize(1440, 100);
  section.itemSpacing = 24;
  section.fills = [];

  const titleText = figma.createText();
  titleText.characters = '🎨 Color Palette';
  titleText.fontSize = 28;
  titleText.fontName = { family: 'Inter', style: 'Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(titleText);

  const categories = ['primary', 'secondary', 'text', 'background', 'accent'];

  for (const category of categories) {
    if (!colors || !colors[category] || colors[category].length === 0) continue;

    const categoryFrame = figma.createFrame();
    categoryFrame.name = category;
    categoryFrame.layoutMode = 'VERTICAL';
    categoryFrame.primaryAxisSizing = 'AUTO';
    categoryFrame.counterAxisSizing = 'AUTO';
    categoryFrame.itemSpacing = 12;
    categoryFrame.fills = [];

    const categoryLabel = figma.createText();
    categoryLabel.characters = category.charAt(0).toUpperCase() + category.slice(1);
    categoryLabel.fontSize = 16;
    categoryLabel.fontName = { family: 'Inter', style: 'Semi Bold' };
    categoryLabel.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
    categoryFrame.appendChild(categoryLabel);

    const swatchRow = figma.createFrame();
    swatchRow.name = `${category}-swatches`;
    swatchRow.layoutMode = 'HORIZONTAL';
    swatchRow.primaryAxisSizing = 'AUTO';
    swatchRow.counterAxisSizing = 'AUTO';
    swatchRow.itemSpacing = 12;
    swatchRow.fills = [];

    colors[category].forEach((color, index) => {
      const colorValue = typeof color === 'string' ? color : (color.hex || color.value);
      const rgb = hexToRgb(colorValue);

      if (rgb) {
        const swatch = createColorSwatch(colorValue, rgb, `${category}-${index + 1}`);
        swatchRow.appendChild(swatch);
      }
    });

    categoryFrame.appendChild(swatchRow);
    section.appendChild(categoryFrame);
  }

  return section;
}

/**
 * Create typography section
 */
async function createTypographySection(typography) {
  const section = figma.createFrame();
  section.name = 'Typography';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizing = 'AUTO';
  section.counterAxisSizing = 'FIXED';
  section.resize(1440, 100);
  section.itemSpacing = 24;
  section.fills = [];

  const titleText = figma.createText();
  titleText.characters = '✍️ Typography';
  titleText.fontSize = 28;
  titleText.fontName = { family: 'Inter', style: 'Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(titleText);

  if (!typography) return section;

  // Font families
  if (typography.fontFamilies && typography.fontFamilies.length > 0) {
    const fontsFrame = await createInfoCard('Font Families', typography.fontFamilies.join(', '));
    section.appendChild(fontsFrame);
  }

  // Type scale examples
  if (typography.fontSizes && typography.fontSizes.length > 0) {
    const scaleTitle = figma.createText();
    scaleTitle.characters = 'Type Scale';
    scaleTitle.fontSize = 16;
    scaleTitle.fontName = { family: 'Inter', style: 'Semi Bold' };
    scaleTitle.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
    section.appendChild(scaleTitle);

    const scaleFrame = figma.createFrame();
    scaleFrame.layoutMode = 'VERTICAL';
    scaleFrame.primaryAxisSizing = 'AUTO';
    scaleFrame.counterAxisSizing = 'AUTO';
    scaleFrame.itemSpacing = 16;
    scaleFrame.fills = [];

    typography.fontSizes.slice(0, 6).forEach((size) => {
      const example = figma.createText();
      const fontSize = parseInt(size);
      example.characters = `${size} - The quick brown fox jumps`;
      example.fontSize = fontSize;
      example.fontName = { family: 'Inter', style: 'Regular' };
      example.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
      scaleFrame.appendChild(example);
    });

    section.appendChild(scaleFrame);
  }

  return section;
}

/**
 * Create spacing section
 */
async function createSpacingSection(spacing) {
  const section = figma.createFrame();
  section.name = 'Spacing';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizing = 'AUTO';
  section.counterAxisSizing = 'FIXED';
  section.resize(1440, 100);
  section.itemSpacing = 24;
  section.fills = [];

  const titleText = figma.createText();
  titleText.characters = '📏 Spacing Scale';
  titleText.fontSize = 28;
  titleText.fontName = { family: 'Inter', style: 'Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(titleText);

  if (!spacing || !spacing.scale) return section;

  const spacingGrid = figma.createFrame();
  spacingGrid.layoutMode = 'HORIZONTAL';
  spacingGrid.primaryAxisSizing = 'AUTO';
  spacingGrid.counterAxisSizing = 'AUTO';
  spacingGrid.itemSpacing = 16;
  spacingGrid.fills = [];

  spacing.scale.slice(0, 8).forEach((value) => {
    const numValue = parseInt(value);
    const spacingBox = figma.createFrame();
    spacingBox.layoutMode = 'VERTICAL';
    spacingBox.primaryAxisSizing = 'AUTO';
    spacingBox.counterAxisSizing = 'AUTO';
    spacingBox.itemSpacing = 8;
    spacingBox.fills = [];

    const visualBox = figma.createFrame();
    visualBox.resize(numValue, numValue);
    visualBox.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.6, b: 0.9 } }];
    visualBox.cornerRadius = 4;
    spacingBox.appendChild(visualBox);

    const label = figma.createText();
    label.characters = value;
    label.fontSize = 12;
    label.fontName = { family: 'Inter', style: 'Medium' };
    label.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
    spacingBox.appendChild(label);

    spacingGrid.appendChild(spacingBox);
  });

  section.appendChild(spacingGrid);
  return section;
}

/**
 * Create comprehensive components section
 */
async function createComponentsSection(data, variableCollectionId) {
  const section = figma.createFrame();
  section.name = 'Components';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizing = 'AUTO';
  section.counterAxisSizing = 'FIXED';
  section.resize(1440, 100);
  section.itemSpacing = 32;
  section.fills = [];

  const titleText = figma.createText();
  titleText.characters = '🧩 Component Library';
  titleText.fontSize = 28;
  titleText.fontName = { family: 'Inter', style: 'Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(titleText);

  // Get primary color
  let primaryColor = { r: 0.4, g: 0.4, b: 0.9 };
  if (data.colors && data.colors.primary && data.colors.primary[0]) {
    const colorValue = typeof data.colors.primary[0] === 'string' ? data.colors.primary[0] : data.colors.primary[0].hex;
    primaryColor = hexToRgb(colorValue) || primaryColor;
  }

  // Buttons
  const buttonSection = await createButtonComponents(data.buttons, primaryColor);
  section.appendChild(buttonSection);

  // Input Fields
  const inputSection = await createInputComponents(primaryColor);
  section.appendChild(inputSection);

  // Cards
  const cardSection = await createCardComponents(primaryColor);
  section.appendChild(cardSection);

  // Badges & Tags
  const badgeSection = await createBadgeComponents(primaryColor);
  section.appendChild(badgeSection);

  return section;
}

/**
 * Create button components with variants
 */
async function createButtonComponents(buttonData, primaryColor) {
  const buttonFrame = figma.createFrame();
  buttonFrame.name = 'Buttons';
  buttonFrame.layoutMode = 'VERTICAL';
  buttonFrame.primaryAxisSizing = 'AUTO';
  buttonFrame.counterAxisSizing = 'AUTO';
  buttonFrame.itemSpacing = 16;
  buttonFrame.fills = [];

  const label = figma.createText();
  label.characters = 'Buttons';
  label.fontSize = 18;
  label.fontName = { family: 'Inter', style: 'Semi Bold' };
  label.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  buttonFrame.appendChild(label);

  const buttonsRow = figma.createFrame();
  buttonsRow.layoutMode = 'HORIZONTAL';
  buttonsRow.primaryAxisSizing = 'AUTO';
  buttonsRow.counterAxisSizing = 'AUTO';
  buttonsRow.itemSpacing = 16;
  buttonsRow.fills = [];

  // Primary button
  const primaryBtn = createButton('Primary', primaryColor, { r: 1, g: 1, b: 1 });
  buttonsRow.appendChild(primaryBtn);

  // Secondary button
  const secondaryBtn = createButton('Secondary', { r: 1, g: 1, b: 1 }, primaryColor, 2);
  buttonsRow.appendChild(secondaryBtn);

  // Outline button
  const outlineBtn = createButton('Outline', { r: 1, g: 1, b: 1 }, primaryColor, 1);
  buttonsRow.appendChild(outlineBtn);

  // Ghost button
  const ghostBtn = createButton('Ghost', { r: 0, g: 0, b: 0, a: 0 }, primaryColor);
  buttonsRow.appendChild(ghostBtn);

  buttonFrame.appendChild(buttonsRow);
  return buttonFrame;
}

/**
 * Create input field components
 */
async function createInputComponents(primaryColor) {
  const inputFrame = figma.createFrame();
  inputFrame.name = 'Input Fields';
  inputFrame.layoutMode = 'VERTICAL';
  inputFrame.primaryAxisSizing = 'AUTO';
  inputFrame.counterAxisSizing = 'AUTO';
  inputFrame.itemSpacing = 16;
  inputFrame.fills = [];

  const label = figma.createText();
  label.characters = 'Input Fields';
  label.fontSize = 18;
  label.fontName = { family: 'Inter', style: 'Semi Bold' };
  label.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  inputFrame.appendChild(label);

  const inputsRow = figma.createFrame();
  inputsRow.layoutMode = 'HORIZONTAL';
  inputsRow.primaryAxisSizing = 'AUTO';
  inputsRow.counterAxisSizing = 'AUTO';
  inputsRow.itemSpacing = 16;
  inputsRow.fills = [];

  // Text input
  const textInput = createInput('Text input', 'Default');
  inputsRow.appendChild(textInput);

  // Focus state
  const focusInput = createInput('Text input', 'Focus', primaryColor);
  inputsRow.appendChild(focusInput);

  inputFrame.appendChild(inputsRow);
  return inputFrame;
}

/**
 * Create card components
 */
async function createCardComponents(primaryColor) {
  const cardFrame = figma.createFrame();
  cardFrame.name = 'Cards';
  cardFrame.layoutMode = 'VERTICAL';
  cardFrame.primaryAxisSizing = 'AUTO';
  cardFrame.counterAxisSizing = 'AUTO';
  cardFrame.itemSpacing = 16;
  cardFrame.fills = [];

  const label = figma.createText();
  label.characters = 'Cards';
  label.fontSize = 18;
  label.fontName = { family: 'Inter', style: 'Semi Bold' };
  label.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  cardFrame.appendChild(label);

  const cardsRow = figma.createFrame();
  cardsRow.layoutMode = 'HORIZONTAL';
  cardsRow.primaryAxisSizing = 'AUTO';
  cardsRow.counterAxisSizing = 'AUTO';
  cardsRow.itemSpacing = 16;
  cardsRow.fills = [];

  // Basic card
  const card1 = await createCard('Feature Card', 'This is a description of the feature', primaryColor);
  cardsRow.appendChild(card1);

  // Product card
  const card2 = await createCard('Product Card', '$99.99 • In Stock', primaryColor);
  cardsRow.appendChild(card2);

  cardFrame.appendChild(cardsRow);
  return cardFrame;
}

/**
 * Create badge components
 */
async function createBadgeComponents(primaryColor) {
  const badgeFrame = figma.createFrame();
  badgeFrame.name = 'Badges & Tags';
  badgeFrame.layoutMode = 'VERTICAL';
  badgeFrame.primaryAxisSizing = 'AUTO';
  badgeFrame.counterAxisSizing = 'AUTO';
  badgeFrame.itemSpacing = 16;
  badgeFrame.fills = [];

  const label = figma.createText();
  label.characters = 'Badges & Tags';
  label.fontSize = 18;
  label.fontName = { family: 'Inter', style: 'Semi Bold' };
  label.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  badgeFrame.appendChild(label);

  const badgesRow = figma.createFrame();
  badgesRow.layoutMode = 'HORIZONTAL';
  badgesRow.primaryAxisSizing = 'AUTO';
  badgesRow.counterAxisSizing = 'AUTO';
  badgesRow.itemSpacing = 12;
  badgesRow.fills = [];

  const badge1 = createBadge('New', primaryColor);
  const badge2 = createBadge('Popular', { r: 0.56, g: 0.27, b: 0.68 });
  const badge3 = createBadge('Sale', { r: 0.95, g: 0.26, b: 0.21 });

  badgesRow.appendChild(badge1);
  badgesRow.appendChild(badge2);
  badgesRow.appendChild(badge3);

  badgeFrame.appendChild(badgesRow);
  return badgeFrame;
}

/**
 * Create usage examples section
 */
async function createUsageExamples(data, variableCollectionId) {
  const section = figma.createFrame();
  section.name = 'Usage Examples';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizing = 'AUTO';
  section.counterAxisSizing = 'FIXED';
  section.resize(1440, 100);
  section.itemSpacing = 24;
  section.fills = [];

  const titleText = figma.createText();
  titleText.characters = '📖 Usage Examples';
  titleText.fontSize = 28;
  titleText.fontName = { family: 'Inter', style: 'Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(titleText);

  // Get primary color
  let primaryColor = { r: 0.4, g: 0.4, b: 0.9 };
  if (data.colors && data.colors.primary && data.colors.primary[0]) {
    const colorValue = typeof data.colors.primary[0] === 'string' ? data.colors.primary[0] : data.colors.primary[0].hex;
    primaryColor = hexToRgb(colorValue) || primaryColor;
  }

  // Example: Hero section
  const heroExample = await createHeroExample(primaryColor);
  section.appendChild(heroExample);

  // Example: Form layout
  const formExample = await createFormExample(primaryColor);
  section.appendChild(formExample);

  return section;
}

/**
 * Create hero section example
 */
async function createHeroExample(primaryColor) {
  const hero = figma.createFrame();
  hero.name = 'Hero Section Example';
  hero.resize(1200, 400);
  hero.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  hero.layoutMode = 'VERTICAL';
  hero.primaryAxisAlignItems = 'CENTER';
  hero.counterAxisAlignItems = 'CENTER';
  hero.paddingTop = 80;
  hero.paddingBottom = 80;
  hero.paddingLeft = 60;
  hero.paddingRight = 60;
  hero.itemSpacing = 24;
  hero.cornerRadius = 12;

  const heading = figma.createText();
  heading.characters = 'Build Amazing Products';
  heading.fontSize = 48;
  heading.fontName = { family: 'Inter', style: 'Bold' };
  heading.fills = [{ type: 'SOLID', color: { r: 0.05, g: 0.05, b: 0.05 } }];
  heading.textAlignHorizontal = 'CENTER';
  hero.appendChild(heading);

  const subheading = figma.createText();
  subheading.characters = 'Using this comprehensive design system';
  subheading.fontSize = 20;
  subheading.fontName = { family: 'Inter', style: 'Regular' };
  subheading.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  subheading.textAlignHorizontal = 'CENTER';
  hero.appendChild(subheading);

  const cta = createButton('Get Started', primaryColor, { r: 1, g: 1, b: 1 });
  hero.appendChild(cta);

  return hero;
}

/**
 * Create form layout example
 */
async function createFormExample(primaryColor) {
  const form = figma.createFrame();
  form.name = 'Form Layout Example';
  form.resize(500, 400);
  form.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  form.layoutMode = 'VERTICAL';
  form.paddingTop = 32;
  form.paddingBottom = 32;
  form.paddingLeft = 32;
  form.paddingRight = 32;
  form.itemSpacing = 20;
  form.cornerRadius = 12;
  form.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 4 },
    radius: 12,
    visible: true,
    blendMode: 'NORMAL'
  }];

  const formTitle = figma.createText();
  formTitle.characters = 'Contact Us';
  formTitle.fontSize = 24;
  formTitle.fontName = { family: 'Inter', style: 'Bold' };
  formTitle.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  form.appendChild(formTitle);

  const input1 = createInput('Email address', 'Default');
  const input2 = createInput('Full name', 'Default');
  const submitBtn = createButton('Submit', primaryColor, { r: 1, g: 1, b: 1 });
  submitBtn.resize(436, 44);

  form.appendChild(input1);
  form.appendChild(input2);
  form.appendChild(submitBtn);

  return form;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createColorSwatch(hexValue, rgb, name) {
  const swatch = figma.createFrame();
  swatch.name = name;
  swatch.layoutMode = 'VERTICAL';
  swatch.primaryAxisSizing = 'AUTO';
  swatch.counterAxisSizing = 'AUTO';
  swatch.itemSpacing = 8;
  swatch.fills = [];

  const colorBox = figma.createFrame();
  colorBox.resize(80, 80);
  colorBox.fills = [{ type: 'SOLID', color: rgb }];
  colorBox.cornerRadius = 8;
  colorBox.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 2 },
    radius: 4,
    visible: true,
    blendMode: 'NORMAL'
  }];
  swatch.appendChild(colorBox);

  const label = figma.createText();
  label.characters = hexValue;
  label.fontSize = 11;
  label.fontName = { family: 'Inter', style: 'Medium' };
  label.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  swatch.appendChild(label);

  return swatch;
}

function createButton(text, bgColor, textColor, borderWidth = 0) {
  const button = figma.createFrame();
  button.name = `Button/${text}`;
  button.resize(140, 44);
  button.cornerRadius = 8;
  button.fills = [{ type: 'SOLID', color: bgColor }];
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisAlignItems = 'CENTER';
  button.counterAxisAlignItems = 'CENTER';
  button.paddingLeft = 24;
  button.paddingRight = 24;

  if (borderWidth > 0) {
    button.strokes = [{ type: 'SOLID', color: textColor }];
    button.strokeWeight = borderWidth;
  }

  const buttonText = figma.createText();
  buttonText.characters = text;
  buttonText.fontSize = 14;
  buttonText.fontName = { family: 'Inter', style: 'Medium' };
  buttonText.fills = [{ type: 'SOLID', color: textColor }];
  button.appendChild(buttonText);

  return button;
}

function createInput(placeholder, state, focusColor) {
  const input = figma.createFrame();
  input.name = `Input/${state}`;
  input.resize(240, 44);
  input.cornerRadius = 6;
  input.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  input.strokes = [{ type: 'SOLID', color: focusColor || { r: 0.85, g: 0.85, b: 0.85 } }];
  input.strokeWeight = state === 'Focus' ? 2 : 1;
  input.layoutMode = 'HORIZONTAL';
  input.paddingLeft = 12;
  input.paddingRight = 12;
  input.primaryAxisAlignItems = 'CENTER';

  const placeholderText = figma.createText();
  placeholderText.characters = placeholder;
  placeholderText.fontSize = 14;
  placeholderText.fontName = { family: 'Inter', style: 'Regular' };
  placeholderText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
  input.appendChild(placeholderText);

  return input;
}

async function createCard(title, description, accentColor) {
  const card = figma.createFrame();
  card.name = 'Card';
  card.resize(250, 200);
  card.cornerRadius = 12;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.layoutMode = 'VERTICAL';
  card.paddingTop = 24;
  card.paddingBottom = 24;
  card.paddingLeft = 24;
  card.paddingRight = 24;
  card.itemSpacing = 12;
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.08 },
    offset: { x: 0, y: 4 },
    radius: 16,
    visible: true,
    blendMode: 'NORMAL'
  }];

  const titleText = figma.createText();
  titleText.characters = title;
  titleText.fontSize = 18;
  titleText.fontName = { family: 'Inter', style: 'Semi Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  card.appendChild(titleText);

  const descText = figma.createText();
  descText.characters = description;
  descText.fontSize = 14;
  descText.fontName = { family: 'Inter', style: 'Regular' };
  descText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
  card.appendChild(descText);

  const accent = figma.createFrame();
  accent.resize(40, 4);
  accent.fills = [{ type: 'SOLID', color: accentColor }];
  accent.cornerRadius = 2;
  card.appendChild(accent);

  return card;
}

function createBadge(text, bgColor) {
  const badge = figma.createFrame();
  badge.name = `Badge/${text}`;
  badge.layoutMode = 'HORIZONTAL';
  badge.primaryAxisSizing = 'AUTO';
  badge.counterAxisSizing = 'AUTO';
  badge.paddingTop = 6;
  badge.paddingBottom = 6;
  badge.paddingLeft = 12;
  badge.paddingRight = 12;
  badge.cornerRadius = 16;
  badge.fills = [{ type: 'SOLID', color: { ...bgColor, a: 0.15 } }];

  const badgeText = figma.createText();
  badgeText.characters = text;
  badgeText.fontSize = 12;
  badgeText.fontName = { family: 'Inter', style: 'Semi Bold' };
  badgeText.fills = [{ type: 'SOLID', color: bgColor }];
  badge.appendChild(badgeText);

  return badge;
}

async function createInfoCard(title, content) {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizing = 'AUTO';
  card.counterAxisSizing = 'FIXED';
  card.resize(1440, 100);
  card.itemSpacing = 8;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.paddingLeft = 20;
  card.paddingRight = 20;
  card.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  card.cornerRadius = 8;

  const titleText = figma.createText();
  titleText.characters = title;
  titleText.fontSize = 13;
  titleText.fontName = { family: 'Inter', style: 'Semi Bold' };
  titleText.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
  card.appendChild(titleText);

  const contentText = figma.createText();
  contentText.characters = content;
  contentText.fontSize = 14;
  contentText.fontName = { family: 'Inter', style: 'Regular' };
  contentText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  card.appendChild(contentText);

  return card;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  if (hex.length !== 6) return null;

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r, g, b };
}

/**
 * Create variable collection
 */
async function createVariableCollection(data, systemName) {
  try {
    const collections = figma.variables.getLocalVariableCollections();
    let collection = collections.find(c => c.name === systemName);

    if (!collection) {
      collection = figma.variables.createVariableCollection(systemName);
    }

    const modeId = collection.modes[0].modeId;

    if (data.colors) {
      ['primary', 'secondary', 'text', 'background', 'accent'].forEach((category, catIndex) => {
        if (!data.colors[category]) return;

        data.colors[category].forEach((color, index) => {
          try {
            const colorValue = typeof color === 'string' ? color : (color.hex || color.value);
            const rgb = hexToRgb(colorValue);
            if (!rgb) return;

            const varName = `color/${category}${data.colors[category].length > 1 ? '/' + (index + 1) : ''}`;
            const variable = figma.variables.createVariable(varName, collection, 'COLOR');
            variable.setValueForMode(modeId, rgb);
          } catch (err) {
            console.error(`Error creating variable for ${category}:`, err);
          }
        });
      });
    }

    return collection.id;
  } catch (error) {
    console.error('Error creating variables:', error);
    throw error;
  }
}
