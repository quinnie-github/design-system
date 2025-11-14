// Minimal test plugin
figma.showUI(__html__, {
  width: 480,
  height: 680,
  title: 'Test Plugin'
});

figma.ui.onmessage = (msg) => {
  if (msg.type === 'test') {
    figma.notify('Plugin is working!');
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
