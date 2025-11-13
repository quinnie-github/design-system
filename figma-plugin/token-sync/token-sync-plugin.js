// Design System GPT - Token Sync Plugin
// Extracts Figma Variables and syncs to local API

figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'extract-tokens') {
    await extractAndSyncTokens();
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Main function to extract tokens from Figma Variables
async function extractAndSyncTokens() {
  try {
    figma.ui.postMessage({ type: 'status', message: 'Extracting tokens from Figma...' });

    const tokens = await extractDesignTokens();
    const stats = calculateStats(tokens);

    // Get Figma filename and generate client ID
    const fileName = figma.root.name;
    const clientId = fileName
      .toLowerCase()
      .replace(/\.fig$/i, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Send extracted tokens to UI
    figma.ui.postMessage({
      type: 'tokens-extracted',
      tokens: tokens,
      stats: stats,
      fileName: fileName,
      clientId: clientId
    });

  } catch (error) {
    console.error('Error extracting tokens:', error);
    figma.notify('Error extracting tokens: ' + error.message, { error: true });
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

// Extract design tokens from Figma Variables API
async function extractDesignTokens() {
  const tokens = {};

  // Get all variable collections
  const collections = figma.variables.getLocalVariableCollections();

  for (const collection of collections) {
    const collectionTokens = await extractCollectionTokens(collection);
    Object.assign(tokens, collectionTokens);
  }

  return tokens;
}

// Extract tokens from a specific collection
function extractCollectionTokens(collection) {
  const tokens = {};

  // Get all variables in this collection
  const variables = collection.variableIds
    .map(id => figma.variables.getVariableById(id))
    .filter(v => v !== null);

  for (const variable of variables) {
    // Parse the variable name into a token path
    // e.g., "color/semantic/primary" -> ["color", "semantic", "primary"]
    const path = variable.name.split('/').map(part =>
      part.trim().toLowerCase().replace(/\s+/g, '-')
    );

    // Get the default mode value
    const defaultMode = collection.modes[0];
    const value = variable.valuesByMode[defaultMode.modeId];

    // Convert Figma value to token value
    const tokenValue = convertFigmaValueToToken(value, variable.resolvedType);

    // Create nested token structure
    setNestedValue(tokens, path, {
      $value: tokenValue,
      $type: getTokenType(variable.resolvedType),
      $description: variable.description || undefined,
      $extensions: {
        figma: {
          id: variable.id,
          key: variable.key,
          collectionId: collection.id,
          scopes: variable.scopes
        }
      }
    });
  }

  return tokens;
}

// Convert Figma variable value to W3C Design Token value
function convertFigmaValueToToken(value, type) {
  // Handle variable aliases (references to other variables)
  if (typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    const referencedVar = figma.variables.getVariableById(value.id);
    if (referencedVar) {
      // Return a token reference using the variable name
      const refPath = referencedVar.name.split('/').map(part =>
        part.trim().toLowerCase().replace(/\s+/g, '-')
      );
      return `{${refPath.join('.')}}`;
    }
  }

  // Convert based on type
  switch (type) {
    case 'COLOR':
      if (typeof value === 'object' && 'r' in value) {
        return rgbaToHex(value);
      }
      return value;

    case 'FLOAT':
      return Number(value);

    case 'STRING':
      return String(value);

    case 'BOOLEAN':
      return Boolean(value);

    default:
      return value;
  }
}

// Convert Figma RGBA color to hex
function rgbaToHex(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);

  const hex = [r, g, b]
    .map(c => c.toString(16).padStart(2, '0'))
    .join('');

  // If alpha is fully opaque, return hex without alpha
  if (a === 255) {
    return `#${hex}`;
  }

  // Include alpha channel
  const alphaHex = a.toString(16).padStart(2, '0');
  return `#${hex}${alphaHex}`;
}

// Map Figma variable type to W3C Design Token type
function getTokenType(figmaType) {
  const typeMap = {
    'COLOR': 'color',
    'FLOAT': 'number',
    'STRING': 'string',
    'BOOLEAN': 'string' // W3C doesn't have a boolean type
  };
  return typeMap[figmaType] || 'string';
}

// Set a value in a nested object using a path array
function setNestedValue(obj, path, value) {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[path[path.length - 1]] = value;
}

// Calculate statistics about extracted tokens
function calculateStats(tokens) {
  let totalTokens = 0;
  const byType = {};

  function traverse(obj) {
    for (const key in obj) {
      const value = obj[key];

      if (value && typeof value === 'object') {
        if ('$value' in value) {
          // This is a token
          totalTokens++;
          const type = value.$type || 'unknown';
          byType[type] = (byType[type] || 0) + 1;
        } else {
          // This is a nested collection
          traverse(value);
        }
      }
    }
  }

  traverse(tokens);

  return {
    totalTokens,
    byType,
    collections: Object.keys(tokens).length
  };
}
