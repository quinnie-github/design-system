/**
 * Design System Generator - Simplified Version
 * This version has minimal code to ensure Figma can load it
 */

// Show the UI
figma.showUI(__html__, {
  width: 480,
  height: 680,
  title: 'Design System Generator'
});

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'generate-system') {
      const data = msg.data;
      const systemName = msg.systemName || 'My Design System';

      if (!data || !data.colors || !data.typography) {
        figma.ui.postMessage({
          type: 'generation-error',
          message: 'Invalid JSON: Missing required fields (colors, typography)'
        });
        return;
      }

      figma.ui.postMessage({
        type: 'generation-started',
        message: 'Creating design system...'
      });

      // Create main frame
      const mainFrame = figma.createFrame();
      mainFrame.name = systemName;
      mainFrame.resize(1200, 2000);
      mainFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, h: 1 } }];

      let yPos = 40;

      // Create header
      const header = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      header.fontName = { family: "Inter", style: "Bold" };
      header.fontSize = 32;
      header.characters = systemName;
      header.x = 40;
      header.y = yPos;
      mainFrame.appendChild(header);

      yPos += 80;

      // Create colors section
      if (data.colors) {
        const colorTitle = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
        colorTitle.fontName = { family: "Inter", style: "SemiBold" };
        colorTitle.fontSize = 20;
        colorTitle.characters = "Colors";
        colorTitle.x = 40;
        colorTitle.y = yPos;
        mainFrame.appendChild(colorTitle);

        yPos += 50;

        let xPos = 40;
        for (const [category, colors] of Object.entries(data.colors)) {
          if (Array.isArray(colors)) {
            for (const color of colors) {
              const rect = figma.createRectangle();
              rect.resize(80, 80);
              rect.x = xPos;
              rect.y = yPos;

              const rgb = hexToRgb(color);
              if (rgb) {
                rect.fills = [{ type: 'SOLID', color: rgb }];
              }

              const label = figma.createText();
              await figma.loadFontAsync({ family: "Inter", style: "Regular" });
              label.fontName = { family: "Inter", style: "Regular" };
              label.fontSize = 10;
              label.characters = color;
              label.x = xPos;
              label.y = yPos + 85;

              mainFrame.appendChild(rect);
              mainFrame.appendChild(label);

              xPos += 100;
              if (xPos > 1000) {
                xPos = 40;
                yPos += 120;
              }
            }
          }
        }

        yPos += 120;
      }

      // Create typography section
      if (data.typography && data.typography.fontSizes) {
        const typoTitle = figma.createText();
        await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
        typoTitle.fontName = { family: "Inter", style: "SemiBold" };
        typoTitle.fontSize = 20;
        typoTitle.characters = "Typography";
        typoTitle.x = 40;
        typoTitle.y = yPos;
        mainFrame.appendChild(typoTitle);

        yPos += 50;

        for (const size of data.typography.fontSizes) {
          const fontSize = parseInt(size);
          if (isNaN(fontSize)) continue;

          const sample = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          sample.fontName = { family: "Inter", style: "Regular" };
          sample.fontSize = fontSize;
          sample.characters = `${size} - The quick brown fox`;
          sample.x = 40;
          sample.y = yPos;
          mainFrame.appendChild(sample);

          yPos += fontSize + 20;
        }
      }

      figma.currentPage.appendChild(mainFrame);
      figma.viewport.scrollAndZoomIntoView([mainFrame]);

      figma.ui.postMessage({
        type: 'generation-complete',
        success: true
      });

      figma.notify('Design system created!');
    }

    if (msg.type === 'cancel') {
      figma.closePlugin();
    }

  } catch (error) {
    console.error('Error:', error);
    figma.ui.postMessage({
      type: 'generation-error',
      message: error.message || 'Unknown error'
    });
    figma.notify('Error: ' + error.message, { error: true });
  }
};

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}
