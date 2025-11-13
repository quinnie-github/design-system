// Minimal test plugin to verify basic loading works
console.log('Plugin loaded successfully!');

figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'test') {
    figma.notify('Plugin is working!');
  }
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
