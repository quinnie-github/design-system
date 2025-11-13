# 🤖 Smart Component Mapper - Feature Spec

## Overview

A feature that helps clients with basic websites automatically discover which components they need from your design system and intelligently map their brand colors to your semantic tokens.

---

## User Flow

### 1. Client Opens Variable Updater
```
Sees three tabs:
- ⚡ Quick (existing - manual color input)
- 🧹 Cleanup (existing - color standardization)
- 🤖 Smart Setup (NEW - AI-powered mapping)
```

### 2. Client Provides Website URL
```
Input field: "Enter your website URL"
https://clientwebsite.com
[Analyze Website] button
```

### 3. Backend Analyzes Website

**What it extracts:**
- Main brand colors (3-5 colors)
- Existing UI patterns (buttons, forms, cards, etc.)
- Component types detected on site
- Color usage patterns

**How:**
- Screenshot website pages
- Run vision analysis (Claude with images)
- Extract color palette from DOM/screenshots
- Identify UI component types
- Map to your component library

### 4. AI Generates Recommendations

**Color Mapping Intelligence:**
```javascript
// Analyze client's color usage
clientColors = {
  primary: "#2563eb" (used on buttons, links - 87 times),
  secondary: "#10b981" (used on success messages - 23 times),
  accent: "#f59e0b" (used on warnings, highlights - 15 times)
}

// Map to your design system tokens
tokenMapping = {
  // Primary → interactive elements
  "button/background/primary": "#2563eb",
  "link/text/default": "#2563eb",
  "input/border/focus": "#2563eb",

  // Secondary → positive states
  "alert/background/success": "#10b981",
  "badge/background/success": "#10b981",
  "stepper/indicator/complete": "#10b981",

  // Accent → attention/warning
  "alert/background/warning": "#f59e0b",
  "badge/background/warning": "#f59e0b",
  "spinner/color": "#f59e0b"
}
```

**Component Recommendations:**
```javascript
recommendedComponents = [
  {
    name: "Button",
    priority: "high",
    reason: "Found 12 call-to-action buttons on site",
    variants: ["primary", "secondary", "outline"],
    colorsNeeded: ["button/background", "button/text", "button/border"]
  },
  {
    name: "Input Field",
    priority: "high",
    reason: "Contact form with 5 input fields detected",
    variants: ["text", "email", "textarea"],
    colorsNeeded: ["input/background", "input/border", "input/text"]
  },
  {
    name: "Alert",
    priority: "medium",
    reason: "Form validation needs success/error states",
    variants: ["success", "error", "warning", "info"],
    colorsNeeded: ["alert/background", "alert/border", "alert/text"]
  }
]
```

### 5. Client Reviews & Approves

**UI Shows:**
```
🎨 Color Mapping Preview
Your Blue (#2563eb) will be used for:
  [Preview] Primary Buttons
  [Preview] Active Links
  [Preview] Focus States
[Adjust Mapping]

📦 Recommended Components (8/20)
☑ Button - High Priority
  "12 buttons found on your site"
  [Preview] [Customize]

☑ Input Field - High Priority
  "Contact form detected"
  [Preview] [Customize]

☐ Progress Bar - Low Priority
  "No progress indicators found"
  [Add Anyway?]

[Apply All] [Customize Selection]
```

### 6. One-Click Application

```
[Apply All] clicked

Backend:
1. Creates Figma variables for all mapped tokens
2. Applies color values from client's palette
3. Duplicates selected components from your library
4. Applies new variables to components
5. Creates new page: "Client Name - Component Library"
6. Organizes components by category

Result in Figma:
✅ Page: "Acme Corp - Component Library"
   ├── Buttons (Primary, Secondary, Outline)
   ├── Inputs (Text, Email, Textarea)
   ├── Alerts (Success, Error, Warning, Info)
   ├── Cards
   ├── Badges
   └── Spinner

✅ Variables Collection: "Acme Corp Tokens"
   ├── button/background/primary: #2563eb
   ├── button/text/primary: #ffffff
   ├── alert/background/success: #10b981
   └── ... (15 variables total)

Time: 30 seconds
vs. Manual: 2 hours
```

---

## Technical Architecture

### Frontend (Plugin UI)

**New Tab: Smart Setup**
```html
<div id="smartTab" class="tab-content">
  <div class="section">
    <h3>🤖 Smart Component Setup</h3>
    <p>Let AI analyze your website and recommend components</p>

    <input
      type="url"
      id="websiteUrl"
      placeholder="https://yourwebsite.com"
    />
    <button onclick="analyzeWebsite()">
      Analyze Website
    </button>
  </div>

  <!-- Results section (hidden until analysis complete) -->
  <div id="analysisResults" style="display: none">
    <div class="section">
      <h4>🎨 Detected Colors</h4>
      <div id="detectedColors"></div>
    </div>

    <div class="section">
      <h4>🎯 Color Mapping</h4>
      <div id="colorMapping"></div>
    </div>

    <div class="section">
      <h4>📦 Recommended Components</h4>
      <div id="componentList"></div>
      <button onclick="applyRecommendations()">
        Apply All Recommendations
      </button>
    </div>
  </div>
</div>
```

### Backend Integration

**Option A: Use Your Existing design-system-gpt API**

You already have a backend! Connect Variable Updater to it:

```javascript
// In ui.html
async function analyzeWebsite() {
  const url = document.getElementById('websiteUrl').value;
  showStatus('Analyzing website...', 'info');

  // Call your design-system-gpt API
  const response = await fetch('http://localhost:3000/api/analyze-website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url })
  });

  const analysis = await response.json();

  // Send to plugin backend
  parent.postMessage({
    pluginMessage: {
      type: 'apply-smart-setup',
      colors: analysis.colors,
      components: analysis.recommendedComponents,
      mapping: analysis.tokenMapping
    }
  }, '*');
}
```

**Option B: Direct Anthropic API Call**

```javascript
// Simplified version without backend
async function analyzeWebsite() {
  const url = document.getElementById('websiteUrl').value;

  // Take screenshot using Figma's API or external service
  const screenshot = await captureWebsite(url);

  // Analyze with Claude (via Anthropic API)
  const analysis = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': 'your-api-key',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: screenshot
            }
          },
          {
            type: 'text',
            text: `Analyze this website screenshot. Extract:
              1. Main brand colors (hex codes)
              2. UI components visible (buttons, forms, cards, etc.)
              3. Color usage patterns
              Return as JSON.`
          }
        ]
      }]
    })
  });

  return analysis;
}
```

### Plugin Backend (figma-variable-updater-plugin.js)

**New Message Handler:**
```javascript
figma.ui.onmessage = (msg) => {
  // ... existing handlers

  if (msg.type === 'apply-smart-setup') {
    applySmartSetup(msg.colors, msg.components, msg.mapping);
  }
};

async function applySmartSetup(colors, components, mapping) {
  try {
    figma.notify('🤖 Applying smart setup...');

    // 1. Create new page for client
    const clientPage = figma.createPage();
    clientPage.name = 'Client Component Library';
    figma.currentPage = clientPage;

    // 2. Create variables collection
    const collection = figma.variables.createVariableCollection('Client Tokens');
    const lightMode = collection.modes[0];

    // 3. Create variables for all mapped tokens
    let variableMap = {};
    for (const [tokenName, hexColor] of Object.entries(mapping)) {
      const variable = figma.variables.createVariable(
        tokenName,
        collection.id,
        'COLOR'
      );
      const rgb = hexToRgb(hexColor);
      variable.setValueForMode(lightMode.modeId, rgb);
      variableMap[tokenName] = variable.id;
    }

    // 4. Duplicate recommended components from library
    // (Assumes components exist in your master design system file)
    for (const component of components) {
      if (component.selected) {
        await duplicateAndCustomizeComponent(
          component.name,
          variableMap
        );
      }
    }

    figma.notify('✅ Smart setup complete! ' + components.length + ' components ready');

  } catch (error) {
    figma.notify('❌ Error: ' + error.message);
  }
}

async function duplicateAndCustomizeComponent(componentName, variableMap) {
  // Find component in your library
  // This requires your design system file to be open or linked
  const component = figma.root.findOne(
    node => node.type === 'COMPONENT' && node.name === componentName
  );

  if (!component) return;

  // Create instance on client page
  const instance = component.createInstance();
  instance.x = 100;
  instance.y = yOffset; // Track vertical position
  figma.currentPage.appendChild(instance);

  // Apply variables to instance
  // (Would need to traverse instance and bind fills to variables)

  yOffset += instance.height + 50; // Space between components
}
```

---

## Intelligence Layer: Color Mapping Logic

### How to Map Client Colors to Your Tokens

**Your Design System Structure:**
```
tokens/
  button/
    background/primary
    background/secondary
    text/primary
    border/default
  alert/
    background/success
    background/error
    background/warning
    text/success
  input/
    background/default
    border/default
    border/focus
    text/default
```

**Mapping Algorithm:**
```javascript
function intelligentColorMapping(clientColors, yourTokens) {
  // clientColors: { primary: '#2563eb', secondary: '#10b981', accent: '#f59e0b' }

  // Analyze semantic meaning from client's website
  const colorUsage = analyzeColorUsage(clientColors);
  // Example result:
  // {
  //   primary: { usage: 'interactive', frequency: 'high', contexts: ['button', 'link'] },
  //   secondary: { usage: 'success', frequency: 'medium', contexts: ['badge', 'alert'] }
  // }

  const mapping = {};

  // Map primary color to interactive elements
  if (colorUsage.primary.usage === 'interactive') {
    mapping['button/background/primary'] = clientColors.primary;
    mapping['link/text/default'] = clientColors.primary;
    mapping['input/border/focus'] = clientColors.primary;
    mapping['progress/fill'] = clientColors.primary;
    mapping['stepper/indicator/active'] = clientColors.primary;
  }

  // Map secondary to positive states
  if (colorUsage.secondary.usage === 'success') {
    mapping['alert/background/success'] = clientColors.secondary;
    mapping['badge/background/success'] = clientColors.secondary;
    mapping['stepper/indicator/complete'] = clientColors.secondary;
  }

  // Map accent to attention/warning
  if (colorUsage.accent.usage === 'attention') {
    mapping['alert/background/warning'] = clientColors.accent;
    mapping['badge/background/warning'] = clientColors.accent;
    mapping['spinner/color'] = clientColors.accent;
  }

  // Generate neutral colors from primary
  mapping['text/primary'] = darken(clientColors.primary, 40);
  mapping['text/secondary'] = darken(clientColors.primary, 20);
  mapping['border/default'] = lighten(clientColors.primary, 70);
  mapping['background/surface'] = '#ffffff';

  return mapping;
}
```

---

## Component Recommendation Logic

### How to Decide Which Components Client Needs

**Website Analysis:**
```javascript
function analyzeWebsiteForComponents(websiteData) {
  const components = [];

  // Check for forms
  if (websiteData.hasForms) {
    components.push({
      name: 'Input Field',
      priority: 'high',
      reason: 'Contact form detected',
      count: websiteData.inputCount
    });
    components.push({
      name: 'Button',
      priority: 'high',
      reason: 'Form submission buttons needed',
      count: websiteData.buttonCount
    });
    components.push({
      name: 'Alert',
      priority: 'high',
      reason: 'Form validation feedback needed'
    });
  }

  // Check for loading states
  if (websiteData.hasAsyncContent) {
    components.push({
      name: 'Spinner',
      priority: 'medium',
      reason: 'Loading indicators for async content'
    });
  }

  // Check for navigation
  if (websiteData.hasMultiStepProcess) {
    components.push({
      name: 'Stepper',
      priority: 'medium',
      reason: 'Multi-step checkout/signup detected'
    });
    components.push({
      name: 'Progress',
      priority: 'medium',
      reason: 'Progress tracking for multi-step flow'
    });
  }

  // Check for content display
  if (websiteData.hasCardLayouts) {
    components.push({
      name: 'Card',
      priority: 'high',
      reason: websiteData.cardCount + ' card-style elements found'
    });
  }

  // Check for status indicators
  if (websiteData.hasStatusLabels) {
    components.push({
      name: 'Badge',
      priority: 'medium',
      reason: 'Status labels and tags detected'
    });
  }

  // Check for lists
  if (websiteData.hasListContent) {
    components.push({
      name: 'List',
      priority: 'low',
      reason: 'List-based content detected'
    });
  }

  return components.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
}
```

---

## MVP Implementation Plan

### Phase 1: Manual Color Mapping (2 hours)
Skip AI analysis for now. Let client manually enter:
- 3 colors
- Select which components they want
- Plugin maps colors intelligently

```
UI:
[Input] Primary Color: #2563eb
[Input] Secondary Color: #10b981
[Input] Accent Color: #f59e0b

Components to include:
☑ Button
☑ Input
☑ Alert
☐ Card
☐ Badge
☐ Spinner
☐ Progress
☐ Stepper
☐ List

[Generate Component Library]
```

### Phase 2: AI Analysis (4 hours)
Add website analysis:
- Screenshot capture
- Claude vision API
- Automatic color extraction
- Component recommendation

### Phase 3: Advanced Mapping (8 hours)
- Contextual color analysis
- Usage pattern detection
- Custom token generation
- Preview before apply

---

## Value Proposition

### For Your Clients:
✅ No design knowledge needed
✅ Professional components in 30 seconds
✅ Consistent with their brand
✅ Production-ready Figma file
✅ All components match their colors

### For You (Agency):
✅ Reuse your design system across clients
✅ 2 hours → 30 seconds setup time
✅ Consistent quality
✅ Easy upsell ("Add more components for $X")
✅ Clients see immediate value

### Pricing Idea:
```
Base Setup: $500
- Website analysis
- 5 core components
- Color mapping
- Basic variables

Add-On Components: $50 each
- Stepper
- Progress
- Spinner
- Custom components

Full Library: $1500
- All 20 components
- Advanced tokens
- Dark mode
- Ongoing updates
```

---

## Next Steps

Would you like me to:

1. **Build the MVP** (Phase 1 - manual color mapping)?
   - Add "Smart Setup" tab to Variable Updater
   - Implement component selection UI
   - Create intelligent color mapping
   - Test with your design system

2. **Connect to your design-system-gpt API**?
   - Integrate with existing backend
   - Add website analysis endpoint
   - Implement component recommendation logic

3. **Create a demo video/prototype**?
   - Show the full flow
   - Demonstrate value to potential clients
   - Use for sales pitches

Let me know which direction you want to go! 🚀
