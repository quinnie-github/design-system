// Design System Generator - Main Plugin Code
// Transforms any Figma design into a professional design system

// Show UI
figma.showUI(__html__, { width: 400, height: 600 });

// Helper: Convert RGB to Hex
function rgbToHex(color) {
  var r = Math.round(color.r * 255);
  var g = Math.round(color.g * 255);
  var b = Math.round(color.b * 255);
  return '#' + [r, g, b].map(function(x) {
    var hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Helper: Convert Hex to RGB
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

// Helper: Traverse nodes
function traverseNode(node, callback) {
  callback(node);
  if ('children' in node) {
    for (var i = 0; i < node.children.length; i++) {
      traverseNode(node.children[i], callback);
    }
  }
}

// Analyze design and extract colors, components, patterns
function analyzeDesign(nodes) {
  var colorMap = new Map();
  var componentPatterns = {
    buttons: [],
    inputs: [],
    cards: [],
    text: []
  };

  var nodeCount = 0;
  var maxNodes = 10000; // Limit for performance
  var totalVisibleArea = 0;
  var allNodes = []; // Store all nodes for area calculation

  // Traverse all nodes
  for (var i = 0; i < nodes.length; i++) {
    traverseNode(nodes[i], function(node) {
      try {
        nodeCount++;
        if (nodeCount > maxNodes) return;

        // Skip nodes without dimensions (like symbols, instances without width/height)
        if (!node.width || !node.height || typeof node.width !== 'number' || typeof node.height !== 'number') {
          return;
        }

        // Calculate total visible area
        if (node.visible !== false) {
        var nodeArea = node.width * node.height;
        totalVisibleArea += nodeArea;
        allNodes.push(node);
      }

      // Extract colors from fills (including gradients)
      if (node.fills && node.fills.length > 0) {
        for (var j = 0; j < node.fills.length; j++) {
          var fill = node.fills[j];
          if (fill.visible !== false) {
            var opacity = fill.opacity !== undefined ? fill.opacity : 1;
            var nodeArea = node.width * node.height;
            var effectiveArea = nodeArea * opacity;

            if (fill.type === 'SOLID') {
              var hex = rgbToHex(fill.color);
              var colorData = colorMap.get(hex) || { count: 0, area: 0, contexts: [], isGradient: false };
              colorData.count++;
              colorData.area += effectiveArea;

              // Track context
              if (looksLikeButton(node)) colorData.contexts.push('button');
              if (node.type === 'TEXT') colorData.contexts.push('text');
              if (isBackground(node)) colorData.contexts.push('background');

              colorMap.set(hex, colorData);
            }
            // Extract gradient colors
            else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL' ||
                     fill.type === 'GRADIENT_ANGULAR' || fill.type === 'GRADIENT_DIAMOND') {
              if (fill.gradientStops && fill.gradientStops.length > 0) {
                for (var k = 0; k < fill.gradientStops.length; k++) {
                  var stop = fill.gradientStops[k];
                  var stopHex = rgbToHex(stop.color);
                  var stopOpacity = (stop.color.a !== undefined ? stop.color.a : 1) * opacity;
                  // Distribute area among gradient stops proportionally
                  var stopArea = effectiveArea * stopOpacity / fill.gradientStops.length;

                  var colorData = colorMap.get(stopHex) || { count: 0, area: 0, contexts: [], isGradient: true };
                  colorData.count++;
                  colorData.area += stopArea;
                  colorData.isGradient = true;

                  // Track context
                  if (looksLikeButton(node)) colorData.contexts.push('button');
                  if (node.type === 'TEXT') colorData.contexts.push('text');
                  if (isBackground(node)) colorData.contexts.push('background');

                  colorMap.set(stopHex, colorData);
                }
              }
            }
          }
        }
      }

      // Extract colors from strokes
      if (node.strokes && node.strokes.length > 0) {
        for (var j = 0; j < node.strokes.length; j++) {
          var stroke = node.strokes[j];
          if (stroke.type === 'SOLID' && stroke.visible !== false) {
            var hex = rgbToHex(stroke.color);
            var strokeWeight = node.strokeWeight || 1;
            // Approximate stroke area (perimeter * weight)
            var strokeArea = ((node.width + node.height) * 2) * strokeWeight;

            var colorData = colorMap.get(hex) || { count: 0, area: 0, contexts: [], isGradient: false };
            colorData.count++;
            colorData.area += strokeArea;
            colorData.contexts.push('border');
            colorMap.set(hex, colorData);
          }
        }
      }

      // Detect component patterns (also track corner radius)
      if (looksLikeButton(node)) {
        componentPatterns.buttons.push({
          node: node,
          variant: detectButtonVariant(node),
          cornerRadius: node.cornerRadius || 0
        });
      }

      if (looksLikeInput(node)) {
        componentPatterns.inputs.push({
          node: node,
          cornerRadius: node.cornerRadius || 0
        });
      }

      if (looksLikeCard(node)) {
        componentPatterns.cards.push({
          node: node,
          hasStroke: node.strokes && node.strokes.length > 0 && node.strokes[0].visible !== false,
          strokeColor: (node.strokes && node.strokes.length > 0 && node.strokes[0].type === 'SOLID') ? rgbToHex(node.strokes[0].color) : null,
          cornerRadius: node.cornerRadius || 0
        });
      }
      } catch (e) {
        // Silently skip nodes that cause any errors during processing
        return;
      }
    });
  }

  // Calculate visual dominance percentages
  var colorDominance = calculateVisualDominance(colorMap, totalVisibleArea);

  // Classify colors using visual dominance
  var colors = classifyColors(colorMap, componentPatterns, colorDominance);

  // Detect common corner radii
  var cornerRadii = detectCornerRadii(componentPatterns);

  // Count components and analyze their properties
  var cardHasStroke = componentPatterns.cards.some(function(card) {
    return card.hasStroke;
  });

  var components = [
    { name: 'Button', count: componentPatterns.buttons.length, type: 'button', cornerRadius: cornerRadii.button },
    { name: 'Input', count: componentPatterns.inputs.length, type: 'input', cornerRadius: cornerRadii.input },
    { name: 'Card', count: componentPatterns.cards.length, type: 'card', hasStroke: cardHasStroke, cornerRadius: cornerRadii.card }
  ].filter(function(c) { return c.count > 0; });

  return {
    colors: colors,
    components: components,
    patterns: componentPatterns,
    visualDominance: colorDominance
  };
}

// Calculate visual dominance (percentage of screen coverage)
function calculateVisualDominance(colorMap, totalVisibleArea) {
  var dominance = [];

  colorMap.forEach(function(data, hex) {
    var percentage = totalVisibleArea > 0 ? (data.area / totalVisibleArea) * 100 : 0;
    dominance.push({
      hex: hex,
      percentage: percentage,
      area: data.area,
      isGradient: data.isGradient || false
    });
  });

  // Sort by percentage (highest first)
  dominance.sort(function(a, b) {
    return b.percentage - a.percentage;
  });

  return dominance;
}

// Detect most common corner radii from components
function detectCornerRadii(componentPatterns) {
  var radii = {
    button: [],
    input: [],
    card: []
  };

  // Collect all corner radii
  componentPatterns.buttons.forEach(function(btn) {
    if (btn.cornerRadius > 0) {
      radii.button.push(btn.cornerRadius);
    }
  });

  componentPatterns.inputs.forEach(function(input) {
    if (input.cornerRadius > 0) {
      radii.input.push(input.cornerRadius);
    }
  });

  componentPatterns.cards.forEach(function(card) {
    if (card.cornerRadius > 0) {
      radii.card.push(card.cornerRadius);
    }
  });

  // Get most frequent corner radius for each type
  return {
    button: getMostFrequent(radii.button) || 8,
    input: getMostFrequent(radii.input) || 6,
    card: getMostFrequent(radii.card) || 12
  };
}

// Get most frequent value from array
function getMostFrequent(arr) {
  if (arr.length === 0) return null;

  var frequency = {};
  var maxFreq = 0;
  var mostFrequent = null;

  for (var i = 0; i < arr.length; i++) {
    var val = Math.round(arr[i]); // Round to nearest integer
    frequency[val] = (frequency[val] || 0) + 1;

    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mostFrequent = val;
    }
  }

  return mostFrequent;
}

// Classify colors by usage (now using visual dominance + context)
function classifyColors(colorMap, patterns, colorDominance) {
  var allColors = Array.from(colorMap.entries()).map(function(entry) {
    var dominanceData = colorDominance.find(function(d) { return d.hex === entry[0]; });
    return {
      hex: entry[0],
      count: entry[1].count,
      area: entry[1].area,
      percentage: dominanceData ? dominanceData.percentage : 0,
      contexts: entry[1].contexts,
      isGradient: entry[1].isGradient || false
    };
  });

  // Sort by visual dominance (area percentage) instead of just count
  allColors.sort(function(a, b) {
    return b.percentage - a.percentage;
  });

  var classified = [];

  // Strategy: Use visual dominance as primary factor, context as secondary

  // Find primary color - prioritize button colors, but check dominance
  var buttonColors = allColors.filter(function(c) {
    return c.contexts.indexOf('button') >= 0;
  });

  // If we have button colors and the top one is reasonably visible (>5%), use it
  if (buttonColors.length > 0 && buttonColors[0].percentage > 5) {
    classified.push({
      name: 'Primary',
      hex: buttonColors[0].hex,
      count: buttonColors[0].count,
      percentage: buttonColors[0].percentage,
      isGradient: buttonColors[0].isGradient,
      role: 'primary'
    });
  }
  // Otherwise, check if top color by dominance is a background/gradient - that might be brand color
  else if (allColors.length > 0 && allColors[0].percentage > 20) {
    // Large dominant color (>20% screen) - likely main brand color
    classified.push({
      name: 'Primary',
      hex: allColors[0].hex,
      count: allColors[0].count,
      percentage: allColors[0].percentage,
      isGradient: allColors[0].isGradient,
      role: 'primary'
    });
  }

  // Find background colors - should be large area coverage
  var bgColors = allColors.filter(function(c) {
    return c.contexts.indexOf('background') >= 0 && c.percentage > 10;
  }).sort(function(a, b) {
    return b.percentage - a.percentage;
  });

  if (bgColors.length > 0) {
    // Don't duplicate - if already classified as primary, skip
    var alreadyClassified = classified.findIndex(function(cl) { return cl.hex === bgColors[0].hex; }) >= 0;
    if (!alreadyClassified) {
      classified.push({
        name: 'Background',
        hex: bgColors[0].hex,
        count: bgColors[0].count,
        percentage: bgColors[0].percentage,
        isGradient: bgColors[0].isGradient,
        role: 'background'
      });
    }
  }

  // Find text colors - usually small area but high count
  var textColors = allColors.filter(function(c) {
    return c.contexts.indexOf('text') >= 0;
  }).sort(function(a, b) {
    // For text, count matters more than area
    return b.count - a.count;
  });

  if (textColors.length > 0) {
    var alreadyClassified = classified.findIndex(function(cl) { return cl.hex === textColors[0].hex; }) >= 0;
    if (!alreadyClassified) {
      classified.push({
        name: 'Text',
        hex: textColors[0].hex,
        count: textColors[0].count,
        percentage: textColors[0].percentage,
        isGradient: textColors[0].isGradient,
        role: 'text'
      });
    }
  }

  // Find border colors
  var borderColors = allColors.filter(function(c) {
    return c.contexts.indexOf('border') >= 0;
  });
  if (borderColors.length > 0) {
    var alreadyClassified = classified.findIndex(function(cl) { return cl.hex === borderColors[0].hex; }) >= 0;
    if (!alreadyClassified) {
      classified.push({
        name: 'Border',
        hex: borderColors[0].hex,
        count: borderColors[0].count,
        percentage: borderColors[0].percentage,
        isGradient: borderColors[0].isGradient,
        role: 'border'
      });
    }
  }

  // Add top remaining colors by dominance as accent/secondary
  var remaining = allColors.filter(function(c) {
    return classified.findIndex(function(cl) { return cl.hex === c.hex; }) === -1;
  });

  if (remaining.length > 0 && classified.length < 6) {
    classified.push({
      name: 'Secondary',
      hex: remaining[0].hex,
      count: remaining[0].count,
      percentage: remaining[0].percentage,
      isGradient: remaining[0].isGradient,
      role: 'secondary'
    });
  }

  if (remaining.length > 1 && classified.length < 6) {
    classified.push({
      name: 'Accent',
      hex: remaining[1].hex,
      count: remaining[1].count,
      percentage: remaining[1].percentage,
      isGradient: remaining[1].isGradient,
      role: 'accent'
    });
  }

  return classified;
}

// Detect if node looks like a button
function looksLikeButton(node) {
  if (node.type !== 'FRAME' && node.type !== 'RECTANGLE' && node.type !== 'COMPONENT') {
    return false;
  }

  // Skip if dimensions aren't numbers
  if (typeof node.width !== 'number' || typeof node.height !== 'number') {
    return false;
  }

  var hasText = hasChildOfType(node, 'TEXT');
  var hasBackground = node.fills && node.fills.length > 0;
  var hasRoundedCorners = node.cornerRadius && node.cornerRadius > 0;
  var reasonableSize = node.width > 60 && node.width < 400 &&
                       node.height > 30 && node.height < 100;

  var nameHints = ['button', 'btn', 'cta', 'action'];
  var nameMatches = node.name && typeof node.name === 'string' && nameHints.some(function(hint) {
    return node.name.toLowerCase().indexOf(hint) >= 0;
  });

  return (hasText && hasBackground && hasRoundedCorners && reasonableSize) || nameMatches;
}

// Detect button variant
function detectButtonVariant(node) {
  var hasSolidFill = node.fills && node.fills.length > 0 &&
                     node.fills[0].opacity > 0.8;
  var hasStroke = node.strokes && node.strokes.length > 0;

  if (hasSolidFill && !hasStroke) return 'primary';
  if (!hasSolidFill && hasStroke) return 'outline';
  if (hasSolidFill && hasStroke) return 'secondary';
  return 'default';
}

// Detect if node looks like an input
function looksLikeInput(node) {
  if (node.type !== 'FRAME' && node.type !== 'RECTANGLE') {
    return false;
  }

  // Skip if dimensions aren't numbers
  if (typeof node.width !== 'number' || typeof node.height !== 'number') {
    return false;
  }

  var hasText = hasChildOfType(node, 'TEXT');
  var hasLightBackground = node.fills && node.fills.length > 0;
  var hasStroke = node.strokes && node.strokes.length > 0;
  var reasonableSize = node.width > 150 && node.width < 600 &&
                       node.height > 30 && node.height < 60;

  var nameHints = ['input', 'field', 'textbox', 'search'];
  var nameMatches = node.name && typeof node.name === 'string' && nameHints.some(function(hint) {
    return node.name.toLowerCase().indexOf(hint) >= 0;
  });

  return (hasStroke && reasonableSize) || nameMatches;
}

// Detect if node looks like a card
function looksLikeCard(node) {
  if (node.type !== 'FRAME') {
    return false;
  }

  // Skip if dimensions aren't numbers
  if (typeof node.width !== 'number' || typeof node.height !== 'number') {
    return false;
  }

  var hasMultipleChildren = node.children && node.children.length > 2;
  var reasonableSize = node.width > 200 && node.width < 600 &&
                       node.height > 150 && node.height < 800;

  var nameHints = ['card', 'tile', 'item'];
  var nameMatches = node.name && typeof node.name === 'string' && nameHints.some(function(hint) {
    return node.name.toLowerCase().indexOf(hint) >= 0;
  });

  return (hasMultipleChildren && reasonableSize) || nameMatches;
}

// Check if node is likely a background
function isBackground(node) {
  if (node.type !== 'FRAME' && node.type !== 'RECTANGLE') {
    return false;
  }

  // Skip if dimensions aren't numbers
  if (typeof node.width !== 'number' || typeof node.height !== 'number') {
    return false;
  }

  var isLarge = node.width > 800 || node.height > 600;
  var nameHints = ['background', 'bg', 'section', 'hero'];
  var nameMatches = node.name && typeof node.name === 'string' && nameHints.some(function(hint) {
    return node.name.toLowerCase().indexOf(hint) >= 0;
  });

  return isLarge || nameMatches;
}

// Check if node has child of specific type
function hasChildOfType(node, type) {
  if (!node.children) return false;
  for (var i = 0; i < node.children.length; i++) {
    if (node.children[i].type === type) return true;
    if (hasChildOfType(node.children[i], type)) return true;
  }
  return false;
}

// Generate design system
async function generateDesignSystem(systemName, options, analysisData) {
  try {
    figma.notify('✨ Generating design system...');

    // Load fonts
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });

    var results = {
      variablesCreated: 0,
      componentsCreated: 0,
      pageCreated: false
    };

    // Step 1: Create variable collection
    var collection = null;
    if (options.createVariables && analysisData.colors.length > 0) {
      collection = figma.variables.createVariableCollection(systemName);
      var mode = collection.modes[0];

      for (var i = 0; i < analysisData.colors.length; i++) {
        var colorData = analysisData.colors[i];
        var tokenName = 'color/' + colorData.role;
        var variable = figma.variables.createVariable(tokenName, collection, 'COLOR');
        var rgb = hexToRgb(colorData.hex);
        variable.setValueForMode(mode.modeId, rgb);
        results.variablesCreated++;
      }
    }

    // Step 2: Create design system page
    var dsPage = null;
    if (options.createPage) {
      dsPage = figma.createPage();
      dsPage.name = systemName;
      figma.currentPage = dsPage;
      results.pageCreated = true;
    }

    // Step 3: Create components (if page was created)
    if (options.createComponents && dsPage && analysisData.colors.length > 0) {
      var yOffset = 0;
      var primaryColor = analysisData.colors.find(function(c) {
        return c.role === 'primary';
      });
      var textColor = analysisData.colors.find(function(c) {
        return c.role === 'text';
      });
      var borderColor = analysisData.colors.find(function(c) {
        return c.role === 'border';
      });

      // Create components for each detected type
      for (var i = 0; i < analysisData.components.length; i++) {
        var componentType = analysisData.components[i];

        if (componentType.type === 'button' && primaryColor) {
          var rgb = hexToRgb(primaryColor.hex);
          var buttonRadius = componentType.cornerRadius || 8;

          // Create button component
          var buttonFrame = figma.createFrame();
          buttonFrame.name = 'Button/Primary';
          buttonFrame.x = 0;
          buttonFrame.y = yOffset;
          buttonFrame.resize(120, 44);
          buttonFrame.cornerRadius = buttonRadius; // Use detected corner radius
          buttonFrame.fills = [{ type: 'SOLID', color: rgb }];
          dsPage.appendChild(buttonFrame);

          var buttonText = figma.createText();
          buttonText.fontName = { family: "Inter", style: "Medium" };
          buttonText.characters = 'Button';
          buttonText.fontSize = 14;
          buttonText.x = 35;
          buttonText.y = yOffset + 14;
          buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
          dsPage.appendChild(buttonText);

          results.componentsCreated++;
          yOffset += 80;
        }

        if (componentType.type === 'input' && borderColor) {
          var borderRgb = hexToRgb(borderColor.hex);
          var inputRadius = componentType.cornerRadius || 6;

          // Create input component
          var inputFrame = figma.createFrame();
          inputFrame.name = 'Input/Default';
          inputFrame.x = 0;
          inputFrame.y = yOffset;
          inputFrame.resize(240, 40);
          inputFrame.cornerRadius = inputRadius; // Use detected corner radius
          inputFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
          inputFrame.strokes = [{ type: 'SOLID', color: borderRgb }];
          inputFrame.strokeWeight = 1;
          dsPage.appendChild(inputFrame);

          var inputText = figma.createText();
          inputText.fontName = { family: "Inter", style: "Regular" };
          inputText.characters = 'Enter text...';
          inputText.fontSize = 13;
          inputText.x = 12;
          inputText.y = yOffset + 13;
          inputText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
          dsPage.appendChild(inputText);

          results.componentsCreated++;
          yOffset += 80;
        }

        if (componentType.type === 'card') {
          var cardTextRgb = textColor ? hexToRgb(textColor.hex) : { r: 0.2, g: 0.2, b: 0.2 };
          var cardRadius = componentType.cornerRadius || 12;

          // Create card component
          var cardFrame = figma.createFrame();
          cardFrame.name = 'Card/Default';
          cardFrame.x = 0;
          cardFrame.y = yOffset;
          cardFrame.resize(280, 160);
          cardFrame.cornerRadius = cardRadius; // Use detected corner radius
          cardFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

          // Only add stroke if original cards had strokes
          if (componentType.hasStroke && borderColor) {
            var cardBorderRgb = hexToRgb(borderColor.hex);
            cardFrame.strokes = [{ type: 'SOLID', color: cardBorderRgb }];
            cardFrame.strokeWeight = 1;
          }

          dsPage.appendChild(cardFrame);

          var cardTitle = figma.createText();
          cardTitle.fontName = { family: "Inter", style: "Bold" };
          cardTitle.characters = 'Card Title';
          cardTitle.fontSize = 16;
          cardTitle.x = 16;
          cardTitle.y = yOffset + 16;
          cardTitle.fills = [{ type: 'SOLID', color: cardTextRgb }];
          dsPage.appendChild(cardTitle);

          var cardDesc = figma.createText();
          cardDesc.fontName = { family: "Inter", style: "Regular" };
          cardDesc.characters = 'Card description text';
          cardDesc.fontSize = 13;
          cardDesc.x = 16;
          cardDesc.y = yOffset + 45;
          cardDesc.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
          dsPage.appendChild(cardDesc);

          results.componentsCreated++;
          yOffset += 200;
        }
      }
    }

    figma.ui.postMessage({
      type: 'generation-complete',
      message: 'Created ' + results.variablesCreated + ' variables and ' +
               results.componentsCreated + ' components'
    });

  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Generation failed: ' + error.message
    });
  }
}

// Capture viewport as screenshot
async function captureViewportScreenshot() {
  try {
    // Export the current viewport as PNG
    var viewport = figma.viewport.bounds;
    var nodes = figma.currentPage.findAll(function(node) {
      // Find all visible nodes in viewport
      if (!node.visible) return false;
      var bounds = node.absoluteBoundingBox;
      if (!bounds) return false;

      // Check if node overlaps with viewport
      return bounds.x < viewport.x + viewport.width &&
             bounds.x + bounds.width > viewport.x &&
             bounds.y < viewport.y + viewport.height &&
             bounds.y + bounds.height > viewport.y;
    });

    if (nodes.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'No visible nodes in viewport to capture'
      });
      return;
    }

    // Create a temporary frame that covers the viewport
    var tempFrame = figma.createFrame();
    tempFrame.x = viewport.x;
    tempFrame.y = viewport.y;
    tempFrame.resize(viewport.width, viewport.height);
    tempFrame.fills = [];

    // Export as PNG
    var imageBytes = await tempFrame.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 1 }
    });

    // Convert to base64
    var base64 = figma.base64Encode(imageBytes);
    var dataUrl = 'data:image/png;base64,' + base64;

    // Clean up
    tempFrame.remove();

    figma.ui.postMessage({
      type: 'viewport-captured',
      imageData: dataUrl
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Failed to capture viewport: ' + error.message
    });
  }
}

// Analyze screenshot with Claude Vision API
async function analyzeWithClaudeVision(base64ImageData) {
  try {
    figma.ui.postMessage({
      type: 'info',
      message: '🤖 Analyzing with AI...'
    });

    // NOTE: Figma plugins cannot make external HTTP requests directly
    // We need to use figma.ui.postMessage to send data to UI,
    // then the UI can make the API call via fetch

    // For now, send back to UI to handle the API call
    figma.ui.postMessage({
      type: 'request-ai-analysis',
      imageData: base64ImageData
    });

  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: 'AI analysis failed: ' + error.message
    });
  }
}

// Handle messages from UI
figma.ui.onmessage = function(msg) {
  if (msg.type === 'get-selection-count') {
    figma.ui.postMessage({
      type: 'selection-count',
      count: figma.currentPage.selection.length
    });
  }

  if (msg.type === 'analyze-design') {
    var nodesToAnalyze = [];

    if (msg.source === 'selection') {
      if (figma.currentPage.selection.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select at least one frame to analyze'
        });
        return;
      }
      nodesToAnalyze = figma.currentPage.selection;
    } else if (msg.source === 'page') {
      nodesToAnalyze = figma.currentPage.children;
    }

    figma.ui.postMessage({
      type: 'info',
      message: 'Analyzing ' + nodesToAnalyze.length + ' frames...'
    });

    var analysis = analyzeDesign(nodesToAnalyze);

    figma.ui.postMessage({
      type: 'analysis-complete',
      data: analysis
    });
  }

  if (msg.type === 'generate-system') {
    generateDesignSystem(msg.systemName, msg.options, msg.analysisData);
  }

  if (msg.type === 'capture-viewport') {
    captureViewportScreenshot();
  }

  if (msg.type === 'analyze-screenshot') {
    analyzeWithClaudeVision(msg.imageData);
  }
};
