// Simple test plugin to verify basic functionality
figma.showUI(__html__, { width: 400, height: 600 });

// Test basic functionality without network access
figma.ui.onmessage = (msg) => {
  if (msg.type === 'test-connection') {
    figma.ui.postMessage({
      type: 'connection-success',
      message: 'Design System GPT is working!'
    });
  } else if (msg.type === 'create-test-component') {
    // Create a simple test component
    const frame = figma.createFrame();
    frame.name = 'Test Component';
    frame.resize(200, 100);
    frame.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.5, b: 0.8 } }];
    frame.cornerRadius = 8;
    
    // Add to current page
    figma.currentPage.appendChild(frame);
    
    // Center it
    frame.x = figma.viewport.center.x - frame.width / 2;
    frame.y = figma.viewport.center.y - frame.height / 2;
    
    figma.notify('✅ Test component created!');
    
    figma.ui.postMessage({
      type: 'component-created',
      success: true
    });
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Send initial message
figma.ui.postMessage({
  type: 'plugin-ready',
  message: 'Design System GPT is ready for testing!'
});





