#!/bin/bash

# Figma Plugin Installation Script
echo "🎨 Installing Tokens Creator Plugin for Figma..."

# Check if Figma directory exists
FIGMA_DIR="$HOME/Library/Application Support/Figma/Plugins"
if [ ! -d "$FIGMA_DIR" ]; then
    echo "❌ Figma plugins directory not found. Creating it..."
    mkdir -p "$FIGMA_DIR"
fi

# Copy plugin files
echo "📁 Copying plugin files..."
cp figma-plugin/tokens-creator-plugin.js "$FIGMA_DIR/"
cp figma-plugin/tokens-creator-ui.html "$FIGMA_DIR/"
cp figma-plugin/tokens-creator-manifest.json "$FIGMA_DIR/"

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 644 "$FIGMA_DIR/tokens-creator-*"

# Verify installation
echo "✅ Verifying installation..."
ls -la "$FIGMA_DIR/tokens-creator-*"

echo ""
echo "🎉 Plugin installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Restart Figma completely"
echo "2. Go to Plugins → Development → Import plugin from manifest..."
echo "3. Navigate to: $FIGMA_DIR"
echo "4. Select: tokens-creator-manifest.json"
echo "5. Click Import"
echo ""
echo "🚀 Then run the plugin:"
echo "   Plugins → Development → Tokens Creator"
