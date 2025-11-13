// Plugin metadata
figma.showUI(__html__, { width: 400, height: 600 });

// Your brand-specific tonal palette data - Full spectrum 50-950 to match existing Orange/Amber/Yellow structure
const tonalPalettes = {
  red: {
    50: "#fef2f2",
    100: "#fee2e2", 
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#d46a6a", // Your brand red base
    600: "#b91c1c",
    700: "#991b1b",
    800: "#7f1d1d",
    900: "#450a0a",
    950: "#2d0a0a"
  },
  piGreen: {
    50: "#f0f5f5",
    100: "#deeced",
    200: "#bddbda",
    300: "#9cc9c5",
    400: "#7bb7b0",
    500: "#5ca5a5", // Your PI Green base
    600: "#4a8a8a",
    700: "#386f6f",
    800: "#265454",
    900: "#143939",
    950: "#0a1e1e"
  },
  blue: {
    50: "#f0f1f5",
    100: "#dee3ed",
    200: "#b8c3e0",
    300: "#8cabd9",
    400: "#6093d2",
    500: "#4d79c7", // Your brand blue base
    600: "#2b58b6",
    700: "#1d3e91",
    800: "#113269",
    900: "#081e3f",
    950: "#040f1f"
  },
  piYellow: {
    50: "#fefce8",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // PI Yellow base - warm golden yellow
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03"
  }
};

// Meaningful names for each shade to help designers choose the right color
const shadeNames = {
  50: "Lightest",
  100: "Very Light",
  200: "Light",
  300: "Lighter",
  400: "Light Base",
  500: "Base",
  600: "Dark Base",
  700: "Darker",
  800: "Dark",
  900: "Very Dark",
  950: "Darkest"
};

// Helper function to convert hex to RGB for Figma
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// Function to create Tokens collection
async function createTokensCollection() {
  try {
    const collections = figma.variables.getLocalVariableCollections();
    
    // Check if Tokens collection already exists
    let tokensCollection = collections.find(collection => 
      collection.name === "Tokens"
    );
    
    if (!tokensCollection) {
      // Create new Tokens collection
      tokensCollection = figma.variables.createVariableCollection("Tokens");
      
      // Add Dark mode
      const darkMode = figma.variables.createVariableMode(tokensCollection.id, "Dark");
    } else {
      figma.notify("⚠️ Tokens collection exists - will add semantic variables to it");
    }
    
    // Create semantic variables (using valid Figma naming)
    const semanticVars = [
      { name: "Brand Primary", type: "COLOR", light: "#4d79c7", dark: "#4d79c7" },
      { name: "Brand Secondary", type: "COLOR", light: "#5ca5a5", dark: "#5ca5a5" },
      { name: "Brand Accent", type: "COLOR", light: "#d46a6a", dark: "#d46a6a" },
      { name: "KPI Positive", type: "COLOR", light: "#5ca5a5", dark: "#5ca5a5" },
      { name: "KPI Negative", type: "COLOR", light: "#d46a6a", dark: "#d46a6a" },
      { name: "Surface Base", type: "COLOR", light: "#ffffff", dark: "#0f172a" },
      { name: "Text Primary", type: "COLOR", light: "#1a1a1a", dark: "#f5f5f5" },
      { name: "Radius Medium", type: "FLOAT", light: 8, dark: 8 },
      { name: "Radius Large", type: "FLOAT", light: 12, dark: 12 },
      { name: "Space Small", type: "FLOAT", light: 4, dark: 4 },
      { name: "Space Medium", type: "FLOAT", light: 8, dark: 8 }
    ];
    
    const lightMode = tokensCollection.modes[0];
    const darkMode = tokensCollection.modes.find(mode => mode.name === "Dark") || tokensCollection.modes[0];
    
    for (const varConfig of semanticVars) {
      const variable = figma.variables.createVariable(varConfig.name, tokensCollection.id, varConfig.type);
      
      if (varConfig.type === "COLOR") {
        const lightColor = hexToRgb(varConfig.light);
        const darkColor = hexToRgb(varConfig.dark);
        variable.setValueForMode(lightMode.modeId, lightColor);
        variable.setValueForMode(darkMode.modeId, darkColor);
      } else {
        variable.setValueForMode(lightMode.modeId, varConfig.light);
        variable.setValueForMode(darkMode.modeId, varConfig.dark);
      }
    }
    
    figma.notify(`✅ Created Tokens collection with ${semanticVars.length} variables!`);
    
  } catch (error) {
    figma.notify(`❌ Error creating Tokens: ${error.message}`);
  }
}

// Function to update variables
async function updateVariables(colors) {
  try {
    // Get all variable collections
    const collections = figma.variables.getLocalVariableCollections();

    // Find or create the "Primitives" collection
    let primitivesCollection = collections.find(collection =>
      collection.name === "Primitives"
    );

    if (!primitivesCollection) {
      // Create Primitives collection if it doesn't exist
      primitivesCollection = figma.variables.createVariableCollection("Primitives");
      figma.notify("✅ Created Primitives collection");
    }

    // If no colors provided (initial load), don't update
    if (!colors) {
      figma.ui.postMessage({ type: 'ready' });
      return;
    }

    let updatedCount = 0;
    const results = [];

    // Simplified: Just create/update variables without intelligent analysis
    // (Analysis was causing performance issues on large documents)

    // Define the variables to create/update
    const variableMap = {
      'color/brand/primary': colors.primary,
      'color/brand/secondary': colors.secondary,
      'color/brand/accent': colors.accent
    };

    // Get existing variables
    const variables = primitivesCollection.variableIds.map(id =>
      figma.variables.getVariableById(id)
    );

    // Store variable IDs for binding
    const variableIds = {
      primary: null,
      secondary: null,
      accent: null
    };

    // STEP 4: Update or create each variable
    for (const [varName, hexColor] of Object.entries(variableMap)) {
      // Find existing variable
      let variable = variables.find(v => v.name === varName);

      if (!variable) {
        // Create new variable
        variable = figma.variables.createVariable(varName, primitivesCollection.id, "COLOR");
        results.push(`✅ Created ${varName}`);
      } else {
        results.push(`✅ Updated ${varName}`);
      }

      // Set the color value
      const rgbColor = hexToRgb(hexColor);
      if (rgbColor) {
        const lightMode = primitivesCollection.modes[0];
        const darkMode = primitivesCollection.modes.find(mode => mode.name === "Dark") || lightMode;

        variable.setValueForMode(lightMode.modeId, rgbColor);
        variable.setValueForMode(darkMode.modeId, rgbColor);
        updatedCount++;

        // Store variable ID for binding
        const shortName = varName.split('/').pop(); // 'primary', 'secondary', 'accent'
        variableIds[shortName] = variable.id;
      }
    }

    // Note: Automatic binding disabled for performance
    // You can manually apply variables to elements via the Figma UI

    // Send results to UI
    figma.ui.postMessage({
      type: 'update-complete',
      updatedCount: updatedCount,
      boundCount: 0,
      results: results
    });

    figma.notify(`✅ Updated ${updatedCount} variables! Apply manually to elements.`);

  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
    figma.notify(`❌ Error: ${error.message}`);
  }
}

// Function to analyze document and find most-used colors
async function analyzeDocumentColors() {
  try {
    const colorUsage = new Map(); // Map of color hex -> count

    // Helper function to convert RGB to hex
    function rgbToHex(rgb) {
      const r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
      const g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
      const b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }

    // Helper function to check if color is grayscale or too close to white/black
    function isNeutralColor(rgb) {
      const brightness = (rgb.r + rgb.g + rgb.b) / 3;
      const colorfulness = Math.max(
        Math.abs(rgb.r - rgb.g),
        Math.abs(rgb.g - rgb.b),
        Math.abs(rgb.b - rgb.r)
      );

      // Skip if too bright (close to white), too dark (close to black), or not colorful enough
      return brightness > 0.95 || brightness < 0.05 || colorfulness < 0.1;
    }

    // Traverse all nodes
    async function traverseNode(node) {
      // Check fills
      if ('fills' in node && node.fills !== figma.mixed) {
        const fills = node.fills;
        if (Array.isArray(fills)) {
          for (const fill of fills) {
            if (fill.type === 'SOLID' && fill.color && !isNeutralColor(fill.color)) {
              const hex = rgbToHex(fill.color);
              colorUsage.set(hex, (colorUsage.get(hex) || 0) + 1);
            }
          }
        }
      }

      // Check strokes
      if ('strokes' in node && node.strokes !== figma.mixed) {
        const strokes = node.strokes;
        if (Array.isArray(strokes)) {
          for (const stroke of strokes) {
            if (stroke.type === 'SOLID' && stroke.color && !isNeutralColor(stroke.color)) {
              const hex = rgbToHex(stroke.color);
              colorUsage.set(hex, (colorUsage.get(hex) || 0) + 1);
            }
          }
        }
      }

      // Traverse children
      if ('children' in node) {
        for (const child of node.children) {
          await traverseNode(child);
        }
      }
    }

    // Scan all pages
    for (const page of figma.root.children) {
      await traverseNode(page);
    }

    // Sort by usage and get top 3
    const sortedColors = Array.from(colorUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sortedColors.map(([hex, count]) => ({ hex, count }));
  } catch (error) {
    console.error('Error analyzing colors:', error);
    return [];
  }
}

// Function to replace old colors with new colors throughout document
async function replaceColorsInDocument(colorMap) {
  try {
    let replacedCount = 0;

    // Helper function to check if two colors match
    function colorsMatch(color1, color2, tolerance = 0.02) {
      return (
        Math.abs(color1.r - color2.r) < tolerance &&
        Math.abs(color1.g - color2.g) < tolerance &&
        Math.abs(color1.b - color2.b) < tolerance
      );
    }

    // Traverse all nodes
    async function traverseNode(node) {
      // Check fills
      if ('fills' in node && node.fills !== figma.mixed) {
        const fills = node.fills;
        if (Array.isArray(fills)) {
          let modified = false;
          const newFills = fills.map(fill => {
            if (fill.type === 'SOLID' && fill.color) {
              // Check against each old color
              for (const [oldRgb, newRgb] of colorMap) {
                if (colorsMatch(fill.color, oldRgb)) {
                  modified = true;
                  replacedCount++;
                  return Object.assign({}, fill, { color: newRgb });
                }
              }
            }
            return fill;
          });

          if (modified) {
            try {
              node.fills = newFills;
            } catch (error) {
              // Some nodes can't be modified
            }
          }
        }
      }

      // Check strokes
      if ('strokes' in node && node.strokes !== figma.mixed) {
        const strokes = node.strokes;
        if (Array.isArray(strokes)) {
          let modified = false;
          const newStrokes = strokes.map(stroke => {
            if (stroke.type === 'SOLID' && stroke.color) {
              for (const [oldRgb, newRgb] of colorMap) {
                if (colorsMatch(stroke.color, oldRgb)) {
                  modified = true;
                  replacedCount++;
                  return Object.assign({}, stroke, { color: newRgb });
                }
              }
            }
            return stroke;
          });

          if (modified) {
            try {
              node.strokes = newStrokes;
            } catch (error) {
              // Some nodes can't be modified
            }
          }
        }
      }

      // Traverse children
      if ('children' in node) {
        for (const child of node.children) {
          await traverseNode(child);
        }
      }
    }

    // Scan all pages
    for (const page of figma.root.children) {
      await traverseNode(page);
    }

    return replacedCount;
  } catch (error) {
    console.error('Error replacing colors:', error);
    return 0;
  }
}

// Function to automatically bind colors to variables
async function bindColorsToVariables(colors, variables) {
  try {
    let boundCount = 0;
    const boundNodes = [];

    // Helper function to check if two colors are similar (within tolerance)
    function colorsMatch(color1, color2, tolerance = 0.02) {
      return (
        Math.abs(color1.r - color2.r) < tolerance &&
        Math.abs(color1.g - color2.g) < tolerance &&
        Math.abs(color1.b - color2.b) < tolerance
      );
    }

    // Convert hex colors to RGB for comparison
    const colorMap = {};
    for (const [varName, hexColor] of Object.entries(colors)) {
      colorMap[varName] = hexToRgb(hexColor);
    }

    // Traverse all nodes in all pages
    for (const page of figma.root.children) {
      await traverseNode(page);
    }

    // Recursive function to traverse nodes
    async function traverseNode(node) {
      // Check if node has fills
      if ('fills' in node && node.fills !== figma.mixed) {
        const fills = node.fills;
        if (Array.isArray(fills)) {
          let modified = false;
          const newFills = fills.map(fill => {
            if (fill.type === 'SOLID' && fill.color) {
              // Check against each brand color
              for (const [varName, rgbColor] of Object.entries(colorMap)) {
                if (colorsMatch(fill.color, rgbColor)) {
                  // Find the matching variable
                  const variableId = variables[varName];
                  if (variableId) {
                    modified = true;
                    boundCount++;
                    boundNodes.push({
                      node: node.name,
                      type: node.type,
                      variable: varName
                    });
                    // Return a variable fill instead
                    return {
                      type: 'SOLID',
                      color: fill.color, // Keep color as fallback
                      boundVariables: {
                        color: { type: 'VARIABLE_ALIAS', id: variableId }
                      }
                    };
                  }
                }
              }
            }
            return fill;
          });

          if (modified) {
            try {
              node.fills = newFills;
            } catch (error) {
              // Some nodes can't be modified, skip them
            }
          }
        }
      }

      // Check strokes too
      if ('strokes' in node && node.strokes !== figma.mixed) {
        const strokes = node.strokes;
        if (Array.isArray(strokes)) {
          let modified = false;
          const newStrokes = strokes.map(stroke => {
            if (stroke.type === 'SOLID' && stroke.color) {
              for (const [varName, rgbColor] of Object.entries(colorMap)) {
                if (colorsMatch(stroke.color, rgbColor)) {
                  const variableId = variables[varName];
                  if (variableId) {
                    modified = true;
                    boundCount++;
                    return {
                      type: 'SOLID',
                      color: stroke.color,
                      boundVariables: {
                        color: { type: 'VARIABLE_ALIAS', id: variableId }
                      }
                    };
                  }
                }
              }
            }
            return stroke;
          });

          if (modified) {
            try {
              node.strokes = newStrokes;
            } catch (error) {
              // Some nodes can't be modified, skip them
            }
          }
        }
      }

      // Traverse children
      if ('children' in node) {
        for (const child of node.children) {
          await traverseNode(child);
        }
      }
    }

    return { boundCount, boundNodes };
  } catch (error) {
    console.error('Error binding colors:', error);
    return { boundCount: 0, boundNodes: [] };
  }
}

// Function to create a diff page showing the updated palettes
async function createDiffPage() {
  try {
    const diffPage = figma.createPage();
    diffPage.name = "Color Palette Updates";
    
    let yOffset = 100;
    const pageWidth = 1200;
    const swatchSize = 60;
    const swatchSpacing = 80;
    const rowSpacing = 120;
    
    // Create title
    const title = figma.createText();
    title.characters = "Updated Color Palettes";
    title.fontSize = 24;
    title.fontName = { family: "Inter", style: "Bold" };
    title.x = 100;
    title.y = 50;
    diffPage.appendChild(title);
    
    // Create palette sections
    for (const [paletteName, palette] of Object.entries(tonalPalettes)) {
      const groupName = paletteName === 'piGreen' ? 'PI Green' : 
                       paletteName === 'piYellow' ? 'PI Yellow' : 
                       paletteName === 'red' ? 'PI Red' : 'PI Blue';
      
      // Palette title
      const paletteTitle = figma.createText();
      paletteTitle.characters = groupName;
      paletteTitle.fontSize = 18;
      paletteTitle.fontName = { family: "Inter", style: "Bold" };
      paletteTitle.x = 100;
      paletteTitle.y = yOffset;
      diffPage.appendChild(paletteTitle);
      
      yOffset += 40;
      
      // Create color swatches
      const shades = Object.keys(palette).sort((a, b) => parseInt(a) - parseInt(b));
      
      for (let i = 0; i < shades.length; i++) {
        const step = shades[i];
        const color = palette[step];
        
        // Color swatch
        const swatch = figma.createRectangle();
        swatch.resize(swatchSize, swatchSize);
        swatch.x = 100 + (i * swatchSpacing);
        swatch.y = yOffset;
        swatch.fills = [{
          type: 'SOLID',
          color: hexToRgb(color)
        }];
        diffPage.appendChild(swatch);
        
        // Step label
        const stepLabel = figma.createText();
        stepLabel.characters = step;
        stepLabel.fontSize = 12;
        stepLabel.fontName = { family: "Inter", style: "Medium" };
        stepLabel.x = 100 + (i * swatchSpacing) + (swatchSize / 2) - 10;
        stepLabel.y = yOffset + swatchSize + 5;
        stepLabel.textAlignHorizontal = "CENTER";
        diffPage.appendChild(stepLabel);
        
        // Color hex
        const hexLabel = figma.createText();
        hexLabel.characters = color;
        hexLabel.fontSize = 10;
        hexLabel.fontName = { family: "Inter", style: "Regular" };
        hexLabel.x = 100 + (i * swatchSpacing) + (swatchSize / 2) - 20;
        hexLabel.y = yOffset + swatchSize + 20;
        hexLabel.textAlignHorizontal = "CENTER";
        diffPage.appendChild(hexLabel);
      }
      
      yOffset += rowSpacing;
    }
    
    // Set as current page
    figma.currentPage = diffPage;
    figma.notify("✅ Created diff page with updated palettes!");
    
  } catch (error) {
    figma.notify(`❌ Error creating diff page: ${error.message}`);
  }
}

// Function to get all semantic variables from Tokens collection
async function getTokens() {
  try {
    const collections = figma.variables.getLocalVariableCollections();
    const tokensCollection = collections.find(collection => 
      collection.name === "Tokens"
    );
    
    if (!tokensCollection) {
      figma.ui.postMessage({ type: 'tokens-loaded', tokens: [] });
      return;
    }
    
    const variables = tokensCollection.variableIds.map(id => 
      figma.variables.getVariableById(id)
    );
    
    const tokens = variables.map(variable => {
      const lightMode = tokensCollection.modes[0];
      const darkMode = tokensCollection.modes.find(mode => mode.name === "Dark") || lightMode;
      
      const lightValue = variable.valuesByMode[lightMode.modeId];
      const darkValue = variable.valuesByMode[darkMode.modeId];
      
      return {
        id: variable.id,
        name: variable.name,
        type: variable.resolvedType,
        lightValue: variable.resolvedType === 'COLOR' ? 
          `#${Math.round(lightValue.r * 255).toString(16).padStart(2, '0')}${Math.round(lightValue.g * 255).toString(16).padStart(2, '0')}${Math.round(lightValue.b * 255).toString(16).padStart(2, '0')}` :
          lightValue.toString(),
        darkValue: variable.resolvedType === 'COLOR' ? 
          `#${Math.round(darkValue.r * 255).toString(16).padStart(2, '0')}${Math.round(darkValue.g * 255).toString(16).padStart(2, '0')}${Math.round(darkValue.b * 255).toString(16).padStart(2, '0')}` :
          darkValue.toString()
      };
    });
    
    figma.ui.postMessage({ type: 'tokens-loaded', tokens });
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Function to add a new semantic variable
async function addToken(name, type, lightValue, darkValue) {
  try {
    const collections = figma.variables.getLocalVariableCollections();
    let tokensCollection = collections.find(collection => 
      collection.name === "Tokens"
    );
    
    if (!tokensCollection) {
      // Create Tokens collection if it doesn't exist
      tokensCollection = figma.variables.createVariableCollection("Tokens");
      const darkMode = figma.variables.createVariableMode(tokensCollection.id, "Dark");
    }
    
    const variable = figma.variables.createVariable(name, tokensCollection.id, type);
    const lightMode = tokensCollection.modes[0];
    const darkMode = tokensCollection.modes.find(mode => mode.name === "Dark") || lightMode;
    
    if (type === "COLOR") {
      const lightColor = hexToRgb(lightValue);
      const darkColor = hexToRgb(darkValue);
      variable.setValueForMode(lightMode.modeId, lightColor);
      variable.setValueForMode(darkMode.modeId, darkColor);
    } else {
      variable.setValueForMode(lightMode.modeId, parseFloat(lightValue));
      variable.setValueForMode(darkMode.modeId, parseFloat(darkValue));
    }
    
    figma.ui.postMessage({ type: 'token-added' });
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Function to update a semantic variable
async function updateToken(tokenId, lightValue, darkValue) {
  try {
    const variable = figma.variables.getVariableById(tokenId);
    if (!variable) {
      throw new Error('Variable not found');
    }
    
    const collections = figma.variables.getLocalVariableCollections();
    const tokensCollection = collections.find(collection => 
      collection.name === "Tokens"
    );
    
    if (!tokensCollection) {
      throw new Error('Tokens collection not found');
    }
    
    const lightMode = tokensCollection.modes[0];
    const darkMode = tokensCollection.modes.find(mode => mode.name === "Dark") || lightMode;
    
    if (variable.resolvedType === "COLOR") {
      const lightColor = hexToRgb(lightValue);
      const darkColor = hexToRgb(darkValue);
      variable.setValueForMode(lightMode.modeId, lightColor);
      variable.setValueForMode(darkMode.modeId, darkColor);
    } else {
      variable.setValueForMode(lightMode.modeId, parseFloat(lightValue));
      variable.setValueForMode(darkMode.modeId, parseFloat(darkValue));
    }
    
    figma.ui.postMessage({ type: 'token-updated' });
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Function to delete a semantic variable
async function deleteToken(tokenId) {
  try {
    const variable = figma.variables.getVariableById(tokenId);
    if (!variable) {
      throw new Error('Variable not found');
    }
    
    variable.remove();
    figma.ui.postMessage({ type: 'token-deleted' });
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Function to export tokens to code
async function exportTokens() {
  try {
    const collections = figma.variables.getLocalVariableCollections();
    const tokensCollection = collections.find(collection => 
      collection.name === "Tokens"
    );
    
    if (!tokensCollection) {
      figma.ui.postMessage({ type: 'error', message: 'Tokens collection not found' });
      return;
    }
    
    const variables = tokensCollection.variableIds.map(id => 
      figma.variables.getVariableById(id)
    );
    
    const lightMode = tokensCollection.modes[0];
    const darkMode = tokensCollection.modes.find(mode => mode.name === "Dark") || lightMode;
    
    let cssContent = ':root {\n';
    let darkCssContent = '\n[data-theme="dark"] {\n';
    
    for (const variable of variables) {
      const lightValue = variable.valuesByMode[lightMode.modeId];
      const darkValue = variable.valuesByMode[darkMode.modeId];
      
      const cssName = `--pi-${variable.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      if (variable.resolvedType === 'COLOR') {
        const lightHex = `#${Math.round(lightValue.r * 255).toString(16).padStart(2, '0')}${Math.round(lightValue.g * 255).toString(16).padStart(2, '0')}${Math.round(lightValue.b * 255).toString(16).padStart(2, '0')}`;
        const darkHex = `#${Math.round(darkValue.r * 255).toString(16).padStart(2, '0')}${Math.round(darkValue.g * 255).toString(16).padStart(2, '0')}${Math.round(darkValue.b * 255).toString(16).padStart(2, '0')}`;
        
        cssContent += `  ${cssName}: ${lightHex};\n`;
        darkCssContent += `  ${cssName}: ${darkHex};\n`;
      } else {
        cssContent += `  ${cssName}: ${lightValue}px;\n`;
        darkCssContent += `  ${cssName}: ${darkValue}px;\n`;
      }
    }
    
    cssContent += '}\n' + darkCssContent + '}\n';
    
    // Create a new page with the exported code
    const exportPage = figma.createPage();
    exportPage.name = "Exported Tokens";
    
    const textNode = figma.createText();
    textNode.characters = cssContent;
    textNode.fontSize = 12;
    textNode.x = 100;
    textNode.y = 100;
    textNode.resize(800, 600);
    
    exportPage.appendChild(textNode);
    figma.currentPage = exportPage;
    
    figma.ui.postMessage({ type: 'export-complete' });
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Function to create tonal palette
async function createTonalPalette(paletteName, baseColor, collection, spectrum) {
  try {
    const collections = figma.variables.getLocalVariableCollections();
    let targetCollection = collections.find(col => col.name === collection);
    
    if (!targetCollection && collection === "Custom") {
      // Create new collection
      targetCollection = figma.variables.createVariableCollection(paletteName);
    } else if (!targetCollection) {
      throw new Error(`Collection "${collection}" not found`);
    }
    
    // Create variables for each shade
    for (const swatch of spectrum) {
      const variableName = `${paletteName}/${swatch.shade}`;
      const variable = figma.variables.createVariable(variableName, targetCollection.id, "COLOR");
      
      const lightMode = targetCollection.modes[0];
      const darkMode = targetCollection.modes.find(mode => mode.name === "Dark") || lightMode;
      
      const color = hexToRgb(swatch.hex);
      variable.setValueForMode(lightMode.modeId, color);
      variable.setValueForMode(darkMode.modeId, color);
    }
    
    figma.ui.postMessage({ type: 'palette-created' });
    figma.notify(`✅ Created tonal palette "${paletteName}" with ${spectrum.length} shades!`);
    
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Function to get recent changes
async function getChanges() {
  try {
    // This would typically track changes in a real implementation
    // For now, we'll return a mock list
    const changes = [
      {
        type: 'added',
        variableName: 'Brand Primary',
        description: 'Added new semantic color variable',
        timestamp: new Date().toLocaleString()
      },
      {
        type: 'updated',
        variableName: 'PI Red/500',
        description: 'Updated base color to #d46a6a',
        timestamp: new Date().toLocaleString()
      }
    ];

    figma.ui.postMessage({ type: 'changes-loaded', changes });

  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Function to convert RGB to HSL for better color comparison
function rgbToHsl(r, g, b) {
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h, s: s, l: l };
}

// Function to calculate color distance in HSL space
function colorDistance(rgb1, rgb2) {
  var hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
  var hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

  // Weight hue difference more for similar lightness
  var hueDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 1 - Math.abs(hsl1.h - hsl2.h)) * 2;
  var satDiff = Math.abs(hsl1.s - hsl2.s);
  var lightDiff = Math.abs(hsl1.l - hsl2.l);

  return Math.sqrt(hueDiff * hueDiff + satDiff * satDiff + lightDiff * lightDiff);
}

// Function to analyze design system and group similar colors
async function analyzeDesignSystem() {
  try {
    figma.notify('🔍 Analyzing design system...');

    var colorMap = new Map(); // Map of hex -> { rgb, count }
    var nodeCount = 0;
    var maxNodes = 10000; // Stop after processing 10k nodes to prevent freeze

    // Helper to convert RGB to hex
    function rgbToHex(rgb) {
      var r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
      var g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
      var b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
      return '#' + r + g + b;
    }

    // Traverse all nodes and collect colors - OPTIMIZED
    function traverseNode(node) {
      nodeCount++;
      if (nodeCount > maxNodes) {
        return; // Stop if too many nodes
      }

      // Check fills
      if ('fills' in node && node.fills !== figma.mixed) {
        var fills = node.fills;
        if (Array.isArray(fills)) {
          for (var i = 0; i < fills.length; i++) {
            var fill = fills[i];
            if (fill.type === 'SOLID' && fill.color) {
              var hex = rgbToHex(fill.color);
              if (!colorMap.has(hex)) {
                colorMap.set(hex, { rgb: fill.color, count: 0 });
              }
              colorMap.get(hex).count++;
            }
          }
        }
      }

      // Check strokes
      if ('strokes' in node && node.strokes !== figma.mixed) {
        var strokes = node.strokes;
        if (Array.isArray(strokes)) {
          for (var i = 0; i < strokes.length; i++) {
            var stroke = strokes[i];
            if (stroke.type === 'SOLID' && stroke.color) {
              var hex = rgbToHex(stroke.color);
              if (!colorMap.has(hex)) {
                colorMap.set(hex, { rgb: stroke.color, count: 0 });
              }
              colorMap.get(hex).count++;
            }
          }
        }
      }

      // Traverse children - NON-ASYNC for speed
      if ('children' in node && nodeCount <= maxNodes) {
        for (var i = 0; i < node.children.length; i++) {
          traverseNode(node.children[i]);
        }
      }
    }

    // Scan current page only for speed
    traverseNode(figma.currentPage);

    // Convert map to array
    var allColors = [];
    colorMap.forEach(function(data, hex) {
      allColors.push({
        hex: hex,
        rgb: data.rgb,
        count: data.count
      });
    });

    // Sort by usage
    allColors.sort(function(a, b) { return b.count - a.count; });

    // Group similar colors - OPTIMIZED
    var colorGroups = [];
    var grouped = new Set();
    var threshold = 0.15;
    var maxColors = Math.min(allColors.length, 50); // Only process top 50 colors

    for (var i = 0; i < maxColors; i++) {
      var color = allColors[i];
      if (grouped.has(color.hex)) continue;

      var group = {
        representative: color.hex,
        colors: [{ hex: color.hex, count: color.count }],
        totalCount: color.count
      };
      grouped.add(color.hex);

      // Only check next 20 colors for grouping
      var searchLimit = Math.min(i + 20, maxColors);
      for (var j = i + 1; j < searchLimit; j++) {
        var otherColor = allColors[j];
        if (grouped.has(otherColor.hex)) continue;

        var distance = colorDistance(color.rgb, otherColor.rgb);
        if (distance < threshold) {
          group.colors.push({ hex: otherColor.hex, count: otherColor.count });
          group.totalCount += otherColor.count;
          grouped.add(otherColor.hex);
        }
      }

      colorGroups.push(group);
    }

    // Sort groups by total usage
    colorGroups.sort(function(a, b) { return b.totalCount - a.totalCount; });

    // Send results to UI
    figma.ui.postMessage({
      type: 'analysis-complete',
      totalColors: allColors.length,
      colorGroups: colorGroups.slice(0, 10),
      allColors: allColors.slice(0, 20),
      nodesScanned: nodeCount,
      limitReached: nodeCount >= maxNodes
    });

    var message = '✅ Found ' + allColors.length + ' colors';
    if (nodeCount >= maxNodes) {
      message += ' (scanned 10k nodes, stopped for performance)';
    }
    figma.notify(message);

  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
    figma.notify('❌ Error: ' + error.message);
  }
}

// Function to cleanup design system by consolidating colors
async function cleanupDesignSystem() {
  try {
    figma.notify('🧹 Cleaning up design system...');

    var colorMap = new Map();
    var nodeCount = 0;
    var maxNodes = 5000; // Lower limit for cleanup to prevent freeze

    function rgbToHex(rgb) {
      var r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
      var g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
      var b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
      return '#' + r + g + b;
    }

    // Collect colors - NON-ASYNC for speed
    function collectColors(node) {
      nodeCount++;
      if (nodeCount > maxNodes) return;

      if ('fills' in node && node.fills !== figma.mixed) {
        var fills = node.fills;
        if (Array.isArray(fills)) {
          for (var i = 0; i < fills.length; i++) {
            var fill = fills[i];
            if (fill.type === 'SOLID' && fill.color) {
              var hex = rgbToHex(fill.color);
              if (!colorMap.has(hex)) {
                colorMap.set(hex, { rgb: fill.color, count: 0 });
              }
              colorMap.get(hex).count++;
            }
          }
        }
      }

      if ('strokes' in node && node.strokes !== figma.mixed) {
        var strokes = node.strokes;
        if (Array.isArray(strokes)) {
          for (var i = 0; i < strokes.length; i++) {
            var stroke = strokes[i];
            if (stroke.type === 'SOLID' && stroke.color) {
              var hex = rgbToHex(stroke.color);
              if (!colorMap.has(hex)) {
                colorMap.set(hex, { rgb: stroke.color, count: 0 });
              }
              colorMap.get(hex).count++;
            }
          }
        }
      }

      if ('children' in node && nodeCount <= maxNodes) {
        for (var i = 0; i < node.children.length; i++) {
          collectColors(node.children[i]);
        }
      }
    }

    // Scan current page only
    collectColors(figma.currentPage);

    // Build color groups
    var allColors = [];
    colorMap.forEach(function(data, hex) {
      allColors.push({ hex: hex, rgb: data.rgb, count: data.count });
    });
    allColors.sort(function(a, b) { return b.count - a.count; });

    var colorGroups = [];
    var grouped = new Set();
    var threshold = 0.15;

    for (var i = 0; i < allColors.length; i++) {
      var color = allColors[i];
      if (grouped.has(color.hex)) continue;

      var group = {
        representative: color.hex,
        representativeRgb: color.rgb,
        colors: [color.hex],
        totalCount: color.count
      };
      grouped.add(color.hex);

      for (var j = i + 1; j < allColors.length; j++) {
        var otherColor = allColors[j];
        if (grouped.has(otherColor.hex)) continue;

        var distance = colorDistance(color.rgb, otherColor.rgb);
        if (distance < threshold) {
          group.colors.push(otherColor.hex);
          group.totalCount += otherColor.count;
          grouped.add(otherColor.hex);
        }
      }

      colorGroups.push(group);
    }

    colorGroups.sort(function(a, b) { return b.totalCount - a.totalCount; });

    // Build replacement map: old color -> new representative color
    var replacementMap = new Map();
    for (var i = 0; i < colorGroups.length; i++) {
      var group = colorGroups[i];
      for (var j = 0; j < group.colors.length; j++) {
        var oldHex = group.colors[j];
        if (oldHex !== group.representative) {
          var oldColorData = colorMap.get(oldHex);
          replacementMap.set(oldColorData.rgb, group.representativeRgb);
        }
      }
    }

    // Replace colors in document - NON-ASYNC for speed
    var replacedCount = 0;
    var replaceNodeCount = 0;
    var maxReplaceNodes = 5000;

    function colorsMatch(color1, color2, tolerance) {
      if (tolerance === undefined) tolerance = 0.02;
      return (
        Math.abs(color1.r - color2.r) < tolerance &&
        Math.abs(color1.g - color2.g) < tolerance &&
        Math.abs(color1.b - color2.b) < tolerance
      );
    }

    function replaceColors(node) {
      replaceNodeCount++;
      if (replaceNodeCount > maxReplaceNodes) return;

      if ('fills' in node && node.fills !== figma.mixed) {
        var fills = node.fills;
        if (Array.isArray(fills)) {
          var modified = false;
          var newFills = [];
          for (var i = 0; i < fills.length; i++) {
            var fill = fills[i];
            if (fill.type === 'SOLID' && fill.color) {
              var replaced = false;
              replacementMap.forEach(function(newRgb, oldRgb) {
                if (!replaced && colorsMatch(fill.color, oldRgb)) {
                  newFills.push(Object.assign({}, fill, { color: newRgb }));
                  modified = true;
                  replaced = true;
                  replacedCount++;
                }
              });
              if (!replaced) {
                newFills.push(fill);
              }
            } else {
              newFills.push(fill);
            }
          }
          if (modified) {
            try {
              node.fills = newFills;
            } catch (error) {
              // Skip locked nodes
            }
          }
        }
      }

      if ('strokes' in node && node.strokes !== figma.mixed) {
        var strokes = node.strokes;
        if (Array.isArray(strokes)) {
          var modified = false;
          var newStrokes = [];
          for (var i = 0; i < strokes.length; i++) {
            var stroke = strokes[i];
            if (stroke.type === 'SOLID' && stroke.color) {
              var replaced = false;
              replacementMap.forEach(function(newRgb, oldRgb) {
                if (!replaced && colorsMatch(stroke.color, oldRgb)) {
                  newStrokes.push(Object.assign({}, stroke, { color: newRgb }));
                  modified = true;
                  replaced = true;
                  replacedCount++;
                }
              });
              if (!replaced) {
                newStrokes.push(stroke);
              }
            } else {
              newStrokes.push(stroke);
            }
          }
          if (modified) {
            try {
              node.strokes = newStrokes;
            } catch (error) {
              // Skip locked nodes
            }
          }
        }
      }

      if ('children' in node && replaceNodeCount <= maxReplaceNodes) {
        for (var i = 0; i < node.children.length; i++) {
          replaceColors(node.children[i]);
        }
      }
    }

    // Replace colors on current page only
    replaceColors(figma.currentPage);

    // Create variables for the representative colors
    var collections = figma.variables.getLocalVariableCollections();
    var primitivesCollection = collections.find(function(col) {
      return col.name === 'Primitives';
    });

    if (!primitivesCollection) {
      primitivesCollection = figma.variables.createVariableCollection('Primitives');
    }

    var createdVariables = 0;
    var lightMode = primitivesCollection.modes[0];
    var darkMode = primitivesCollection.modes.find(function(mode) { return mode.name === 'Dark'; }) || lightMode;

    // Create variables for top color groups
    var topGroups = colorGroups.slice(0, 3);
    var roleNames = ['primary', 'secondary', 'accent'];

    for (var i = 0; i < topGroups.length; i++) {
      var group = topGroups[i];
      var varName = 'color/brand/' + roleNames[i];

      var existingVars = primitivesCollection.variableIds.map(function(id) {
        return figma.variables.getVariableById(id);
      });
      var variable = existingVars.find(function(v) { return v.name === varName; });

      if (!variable) {
        variable = figma.variables.createVariable(varName, primitivesCollection.id, 'COLOR');
      }

      variable.setValueForMode(lightMode.modeId, group.representativeRgb);
      variable.setValueForMode(darkMode.modeId, group.representativeRgb);
      createdVariables++;
    }

    // Send results
    figma.ui.postMessage({
      type: 'cleanup-complete',
      before: allColors.length,
      after: colorGroups.length,
      replaced: replacedCount,
      variablesCreated: createdVariables,
      colorGroups: colorGroups.slice(0, 3)
    });

    figma.notify('✅ Cleanup complete! Reduced from ' + allColors.length + ' to ' + colorGroups.length + ' colors.');

  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: error.message });
    figma.notify('❌ Error: ' + error.message);
  }
}

// Function to generate smart component setup
async function generateSmartSetup(colors, components) {
  try {
    figma.notify('🚀 Generating component library...');

    // Load default font first (required for text)
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });

    // Create new page for component library
    var componentPage = figma.createPage();
    componentPage.name = 'Client Component Library';
    figma.currentPage = componentPage;

    // Create or get variables collection
    var collections = figma.variables.getLocalVariableCollections();
    var clientCollection = collections.find(function(col) {
      return col.name === 'Client Tokens';
    });

    if (!clientCollection) {
      clientCollection = figma.variables.createVariableCollection('Client Tokens');
      // Add dark mode to new collection
      figma.variables.createVariableMode(clientCollection.id, 'Dark');
    }

    var lightMode = clientCollection.modes[0];
    var darkMode = clientCollection.modes.length > 1 ? clientCollection.modes[1] : lightMode;

    // Intelligent token mapping based on color semantics
    var tokenMapping = generateTokenMapping(colors);

    // Create variables for all tokens
    var tokensCreated = 0;
    var variableIds = {};

    for (var tokenName in tokenMapping) {
      var existingVars = clientCollection.variableIds.map(function(id) {
        return figma.variables.getVariableById(id);
      });
      var variable = existingVars.find(function(v) { return v.name === tokenName; });

      if (!variable) {
        variable = figma.variables.createVariable(tokenName, clientCollection.id, 'COLOR');
      }

      var rgb = hexToRgb(tokenMapping[tokenName]);
      if (rgb) {
        variable.setValueForMode(lightMode.modeId, rgb);
        variable.setValueForMode(darkMode.modeId, rgb);
        variableIds[tokenName] = variable.id;
        tokensCreated++;
      }
    }

    // Generate component placeholders
    var yOffset = 100;
    var componentsCreated = 0;

    for (var i = 0; i < components.length; i++) {
      var componentName = components[i];
      createComponentPlaceholder(componentName, yOffset, variableIds, colors);
      yOffset += 200;
      componentsCreated++;
    }

    // Send success message to UI
    figma.ui.postMessage({
      type: 'smart-setup-complete',
      componentsCount: componentsCreated,
      tokensCount: tokensCreated,
      pageName: 'Client Component Library'
    });

    figma.notify('✅ Generated ' + componentsCreated + ' components with ' + tokensCreated + ' tokens!');

  } catch (error) {
    console.error('Smart setup error:', error);
    console.error('Error stack:', error.stack);
    figma.ui.postMessage({ type: 'error', message: error.message });
    figma.notify('❌ Error: ' + error.message);
  }
}

// Generate intelligent token mapping from brand colors
function generateTokenMapping(colors) {
  var primary = colors.primary;
  var secondary = colors.secondary;
  var accent = colors.accent;

  // Intelligent mapping based on semantic meaning
  var mapping = {};

  // Button tokens
  mapping['button/background/primary'] = primary;
  mapping['button/background/secondary'] = secondary;
  mapping['button/text/primary'] = '#ffffff';
  mapping['button/border/default'] = primary;

  // Input tokens
  mapping['input/background/default'] = '#ffffff';
  mapping['input/border/default'] = '#cbd5e1';
  mapping['input/border/focus'] = primary;
  mapping['input/text/default'] = '#1e293b';

  // Alert tokens
  mapping['alert/background/success'] = secondary;
  mapping['alert/background/error'] = '#ef4444';
  mapping['alert/background/warning'] = accent;
  mapping['alert/background/info'] = primary;

  // Card tokens
  mapping['card/background/default'] = '#ffffff';
  mapping['card/border/default'] = '#e2e8f0';
  mapping['card/text/title'] = '#1e293b';

  // Badge tokens
  mapping['badge/background/primary'] = primary;
  mapping['badge/background/success'] = secondary;
  mapping['badge/background/warning'] = accent;
  mapping['badge/text/default'] = '#ffffff';

  // Progress/Spinner tokens
  mapping['progress/fill'] = primary;
  mapping['progress/background'] = '#e2e8f0';
  mapping['spinner/color'] = primary;

  // Stepper tokens
  mapping['stepper/active'] = primary;
  mapping['stepper/complete'] = secondary;
  mapping['stepper/inactive'] = '#cbd5e1';

  // List tokens
  mapping['list/background/default'] = '#ffffff';
  mapping['list/background/hover'] = '#f8fafc';
  mapping['list/border/default'] = '#e2e8f0';

  return mapping;
}

// Create a realistic component with proper styling
function createComponentPlaceholder(componentName, yOffset, variableIds, colors) {
  var sectionFrame = figma.createFrame();
  sectionFrame.name = componentName.charAt(0).toUpperCase() + componentName.slice(1) + ' Section';
  sectionFrame.x = 100;
  sectionFrame.y = yOffset;
  sectionFrame.resize(800, 200);
  sectionFrame.fills = [];
  sectionFrame.clipsContent = false;

  // Add section title
  var sectionTitle = figma.createText();
  sectionTitle.fontName = { family: "Inter", style: "Bold" };
  sectionTitle.characters = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  sectionTitle.fontSize = 16;
  sectionTitle.x = 0;
  sectionTitle.y = 0;
  sectionTitle.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.16, b: 0.23 } }];
  sectionFrame.appendChild(sectionTitle);

  // Create the actual visual component
  createComponentExample(componentName, sectionFrame, colors, 40);

  figma.currentPage.appendChild(sectionFrame);
}

// Create realistic visual components
function createComponentExample(componentName, parentFrame, colors, yStart) {
  var primaryRgb = hexToRgb(colors.primary);
  var secondaryRgb = hexToRgb(colors.secondary);
  var accentRgb = hexToRgb(colors.accent);

  if (componentName === 'button') {
    createButtonComponents(parentFrame, yStart, primaryRgb, secondaryRgb);
  } else if (componentName === 'input') {
    createInputComponents(parentFrame, yStart, primaryRgb);
  } else if (componentName === 'alert') {
    createAlertComponents(parentFrame, yStart, primaryRgb, secondaryRgb, accentRgb);
  } else if (componentName === 'card') {
    createCardComponent(parentFrame, yStart, primaryRgb);
  } else if (componentName === 'badge') {
    createBadgeComponents(parentFrame, yStart, primaryRgb, secondaryRgb, accentRgb);
  } else if (componentName === 'progress') {
    createProgressComponent(parentFrame, yStart, primaryRgb);
  } else if (componentName === 'spinner') {
    createSpinnerComponent(parentFrame, yStart, primaryRgb);
  } else if (componentName === 'stepper') {
    createStepperComponent(parentFrame, yStart, primaryRgb, secondaryRgb);
  } else if (componentName === 'list') {
    createListComponent(parentFrame, yStart, primaryRgb);
  }
}

// Create button components
function createButtonComponents(parent, yStart, primary, secondary) {
  var xPos = 0;
  var spacing = 120;

  // Primary button
  var btnPrimary = figma.createRectangle();
  btnPrimary.x = xPos;
  btnPrimary.y = yStart;
  btnPrimary.resize(110, 40);
  btnPrimary.cornerRadius = 8;
  btnPrimary.fills = [{ type: 'SOLID', color: primary }];
  parent.appendChild(btnPrimary);

  var btnPrimaryText = figma.createText();
  btnPrimaryText.fontName = { family: "Inter", style: "Medium" };
  btnPrimaryText.characters = 'Primary';
  btnPrimaryText.fontSize = 14;
  btnPrimaryText.x = xPos + 28;
  btnPrimaryText.y = yStart + 12;
  btnPrimaryText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  parent.appendChild(btnPrimaryText);

  // Secondary button
  var btnSecondary = figma.createRectangle();
  btnSecondary.x = xPos + spacing;
  btnSecondary.y = yStart;
  btnSecondary.resize(110, 40);
  btnSecondary.cornerRadius = 8;
  btnSecondary.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  btnSecondary.strokes = [{ type: 'SOLID', color: primary }];
  btnSecondary.strokeWeight = 2;
  parent.appendChild(btnSecondary);

  var btnSecondaryText = figma.createText();
  btnSecondaryText.fontName = { family: "Inter", style: "Medium" };
  btnSecondaryText.characters = 'Secondary';
  btnSecondaryText.fontSize = 14;
  btnSecondaryText.x = xPos + spacing + 20;
  btnSecondaryText.y = yStart + 12;
  btnSecondaryText.fills = [{ type: 'SOLID', color: primary }];
  parent.appendChild(btnSecondaryText);

  // Disabled button
  var btnDisabled = figma.createRectangle();
  btnDisabled.x = xPos + spacing * 2;
  btnDisabled.y = yStart;
  btnDisabled.resize(110, 40);
  btnDisabled.cornerRadius = 8;
  btnDisabled.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  parent.appendChild(btnDisabled);

  var btnDisabledText = figma.createText();
  btnDisabledText.fontName = { family: "Inter", style: "Medium" };
  btnDisabledText.characters = 'Disabled';
  btnDisabledText.fontSize = 14;
  btnDisabledText.x = xPos + spacing * 2 + 24;
  btnDisabledText.y = yStart + 12;
  btnDisabledText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
  parent.appendChild(btnDisabledText);
}

// Create input components
function createInputComponents(parent, yStart, primary) {
  // Input field
  var input = figma.createRectangle();
  input.x = 0;
  input.y = yStart;
  input.resize(300, 44);
  input.cornerRadius = 8;
  input.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  input.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.84, b: 0.88 } }];
  input.strokeWeight = 1;
  parent.appendChild(input);

  var inputText = figma.createText();
  inputText.fontName = { family: "Inter", style: "Regular" };
  inputText.characters = 'Enter your text...';
  inputText.fontSize = 14;
  inputText.x = 12;
  inputText.y = yStart + 14;
  inputText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.64, b: 0.68 } }];
  parent.appendChild(inputText);

  // Focused input (with primary border)
  var inputFocused = figma.createRectangle();
  inputFocused.x = 320;
  inputFocused.y = yStart;
  inputFocused.resize(300, 44);
  inputFocused.cornerRadius = 8;
  inputFocused.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  inputFocused.strokes = [{ type: 'SOLID', color: primary }];
  inputFocused.strokeWeight = 2;
  parent.appendChild(inputFocused);

  var inputFocusedText = figma.createText();
  inputFocusedText.fontName = { family: "Inter", style: "Regular" };
  inputFocusedText.characters = 'Focused state';
  inputFocusedText.fontSize = 14;
  inputFocusedText.x = 332;
  inputFocusedText.y = yStart + 14;
  inputFocusedText.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.16, b: 0.23 } }];
  parent.appendChild(inputFocusedText);
}

// Create alert components
function createAlertComponents(parent, yStart, primary, secondary, accent) {
  var alerts = [
    { color: secondary, text: 'Success alert message', label: 'Success', y: 0 },
    { color: accent, text: 'Warning alert message', label: 'Warning', y: 70 },
    { color: { r: 0.94, g: 0.27, b: 0.27 }, text: 'Error alert message', label: 'Error', y: 140 }
  ];

  for (var i = 0; i < alerts.length; i++) {
    var alert = alerts[i];
    var alertBg = figma.createRectangle();
    alertBg.x = 0;
    alertBg.y = yStart + alert.y;
    alertBg.resize(600, 50);
    alertBg.cornerRadius = 8;
    alertBg.fills = [{ type: 'SOLID', color: alert.color, opacity: 0.1 }];
    alertBg.strokes = [{ type: 'SOLID', color: alert.color }];
    alertBg.strokeWeight = 1;
    parent.appendChild(alertBg);

    var alertText = figma.createText();
    alertText.fontName = { family: "Inter", style: "Medium" };
    alertText.characters = alert.text;
    alertText.fontSize = 14;
    alertText.x = 16;
    alertText.y = yStart + alert.y + 17;
    alertText.fills = [{ type: 'SOLID', color: alert.color }];
    parent.appendChild(alertText);
  }
}

// Create card component
function createCardComponent(parent, yStart, primary) {
  var card = figma.createRectangle();
  card.x = 0;
  card.y = yStart;
  card.resize(350, 200);
  card.cornerRadius = 12;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.91, b: 0.93 } }];
  card.strokeWeight = 1;
  parent.appendChild(card);

  var cardTitle = figma.createText();
  cardTitle.fontName = { family: "Inter", style: "Bold" };
  cardTitle.characters = 'Card Title';
  cardTitle.fontSize = 18;
  cardTitle.x = 20;
  cardTitle.y = yStart + 20;
  cardTitle.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.16, b: 0.23 } }];
  parent.appendChild(cardTitle);

  var cardDesc = figma.createText();
  cardDesc.fontName = { family: "Inter", style: "Regular" };
  cardDesc.characters = 'This is a card component with your\nbrand styling applied.';
  cardDesc.fontSize = 14;
  cardDesc.x = 20;
  cardDesc.y = yStart + 55;
  cardDesc.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.49, b: 0.55 } }];
  parent.appendChild(cardDesc);

  var cardButton = figma.createRectangle();
  cardButton.x = 20;
  cardButton.y = yStart + 140;
  cardButton.resize(100, 36);
  cardButton.cornerRadius = 6;
  cardButton.fills = [{ type: 'SOLID', color: primary }];
  parent.appendChild(cardButton);

  var cardButtonText = figma.createText();
  cardButtonText.fontName = { family: "Inter", style: "Medium" };
  cardButtonText.characters = 'Learn More';
  cardButtonText.fontSize = 13;
  cardButtonText.x = 32;
  cardButtonText.y = yStart + 150;
  cardButtonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  parent.appendChild(cardButtonText);
}

// Create badge components
function createBadgeComponents(parent, yStart, primary, secondary, accent) {
  var badges = [
    { color: primary, text: 'Primary', x: 0 },
    { color: secondary, text: 'Success', x: 100 },
    { color: accent, text: 'Warning', x: 200 },
    { color: { r: 0.6, g: 0.64, b: 0.68 }, text: 'Default', x: 300 }
  ];

  for (var i = 0; i < badges.length; i++) {
    var badge = badges[i];
    var badgeBg = figma.createRectangle();
    badgeBg.x = badge.x;
    badgeBg.y = yStart;
    badgeBg.resize(80, 28);
    badgeBg.cornerRadius = 14;
    badgeBg.fills = [{ type: 'SOLID', color: badge.color }];
    parent.appendChild(badgeBg);

    var badgeText = figma.createText();
    badgeText.fontName = { family: "Inter", style: "Medium" };
    badgeText.characters = badge.text;
    badgeText.fontSize = 12;
    badgeText.x = badge.x + (badge.text === 'Primary' ? 18 : badge.text === 'Success' ? 16 : badge.text === 'Warning' ? 14 : 16);
    badgeText.y = yStart + 8;
    badgeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    parent.appendChild(badgeText);
  }
}

// Create progress component
function createProgressComponent(parent, yStart, primary) {
  var progressBg = figma.createRectangle();
  progressBg.x = 0;
  progressBg.y = yStart;
  progressBg.resize(400, 8);
  progressBg.cornerRadius = 4;
  progressBg.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.91, b: 0.93 } }];
  parent.appendChild(progressBg);

  var progressFill = figma.createRectangle();
  progressFill.x = 0;
  progressFill.y = yStart;
  progressFill.resize(240, 8);
  progressFill.cornerRadius = 4;
  progressFill.fills = [{ type: 'SOLID', color: primary }];
  parent.appendChild(progressFill);

  var progressText = figma.createText();
  progressText.fontName = { family: "Inter", style: "Medium" };
  progressText.characters = '60% Complete';
  progressText.fontSize = 13;
  progressText.x = 0;
  progressText.y = yStart + 20;
  progressText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.49, b: 0.55 } }];
  parent.appendChild(progressText);
}

// Create spinner component
function createSpinnerComponent(parent, yStart, primary) {
  var spinner = figma.createEllipse();
  spinner.x = 0;
  spinner.y = yStart;
  spinner.resize(40, 40);
  spinner.fills = [];
  spinner.strokes = [{ type: 'SOLID', color: primary }];
  spinner.strokeWeight = 4;
  spinner.dashPattern = [15, 10];
  parent.appendChild(spinner);

  var spinnerText = figma.createText();
  spinnerText.fontName = { family: "Inter", style: "Regular" };
  spinnerText.characters = 'Loading spinner';
  spinnerText.fontSize = 13;
  spinnerText.x = 60;
  spinnerText.y = yStart + 13;
  spinnerText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.49, b: 0.55 } }];
  parent.appendChild(spinnerText);
}

// Create stepper component
function createStepperComponent(parent, yStart, primary, secondary) {
  var steps = [
    { label: 'Step 1', complete: true, x: 0 },
    { label: 'Step 2', complete: true, x: 120 },
    { label: 'Step 3', complete: false, x: 240 }
  ];

  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    var circle = figma.createEllipse();
    circle.x = step.x;
    circle.y = yStart;
    circle.resize(32, 32);
    circle.fills = [{ type: 'SOLID', color: step.complete ? secondary : { r: 0.9, g: 0.91, b: 0.93 } }];
    parent.appendChild(circle);

    var stepText = figma.createText();
    stepText.fontName = { family: "Inter", style: "Bold" };
    stepText.characters = (i + 1).toString();
    stepText.fontSize = 14;
    stepText.x = step.x + 11;
    stepText.y = yStart + 9;
    stepText.fills = [{ type: 'SOLID', color: step.complete ? { r: 1, g: 1, b: 1 } : { r: 0.6, g: 0.64, b: 0.68 } }];
    parent.appendChild(stepText);

    var stepLabel = figma.createText();
    stepLabel.fontName = { family: "Inter", style: "Regular" };
    stepLabel.characters = step.label;
    stepLabel.fontSize = 12;
    stepLabel.x = step.x;
    stepLabel.y = yStart + 40;
    stepLabel.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.49, b: 0.55 } }];
    parent.appendChild(stepLabel);

    // Add line between steps
    if (i < steps.length - 1) {
      var line = figma.createRectangle();
      line.x = step.x + 36;
      line.y = yStart + 15;
      line.resize(80, 2);
      line.fills = [{ type: 'SOLID', color: step.complete ? secondary : { r: 0.9, g: 0.91, b: 0.93 } }];
      parent.appendChild(line);
    }
  }
}

// Create list component
function createListComponent(parent, yStart, primary) {
  var items = ['First list item', 'Second list item', 'Third list item'];

  for (var i = 0; i < items.length; i++) {
    var itemBg = figma.createRectangle();
    itemBg.x = 0;
    itemBg.y = yStart + (i * 50);
    itemBg.resize(500, 45);
    itemBg.cornerRadius = 6;
    itemBg.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    itemBg.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.91, b: 0.93 } }];
    itemBg.strokeWeight = 1;
    parent.appendChild(itemBg);

    var itemText = figma.createText();
    itemText.fontName = { family: "Inter", style: "Regular" };
    itemText.characters = items[i];
    itemText.fontSize = 14;
    itemText.x = 16;
    itemText.y = yStart + (i * 50) + 15;
    itemText.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.16, b: 0.23 } }];
    parent.appendChild(itemText);
  }
}

// Handle messages from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'update-variables') {
    updateVariables(msg.colors);
  } else if (msg.type === 'create-tokens') {
    createTokensCollection();
  } else if (msg.type === 'get-tokens') {
    getTokens();
  } else if (msg.type === 'add-token') {
    addToken(msg.name, msg.type, msg.lightValue, msg.darkValue);
  } else if (msg.type === 'update-token') {
    updateToken(msg.tokenId, msg.lightValue, msg.darkValue);
  } else if (msg.type === 'delete-token') {
    deleteToken(msg.tokenId);
  } else if (msg.type === 'export-tokens') {
    exportTokens();
  } else if (msg.type === 'create-tonal-palette') {
    createTonalPalette(msg.paletteName, msg.baseColor, msg.collection, msg.spectrum);
  } else if (msg.type === 'get-changes') {
    getChanges();
  } else if (msg.type === 'create-diff-page') {
    createDiffPage();
  } else if (msg.type === 'analyze-design') {
    analyzeDesignSystem();
  } else if (msg.type === 'cleanup-design') {
    cleanupDesignSystem();
  } else if (msg.type === 'generate-smart-setup') {
    generateSmartSetup(msg.colors, msg.components);
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Auto-run on plugin start
updateVariables();
