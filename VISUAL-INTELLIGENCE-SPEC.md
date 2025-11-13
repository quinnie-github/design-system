# 🧠 Visual Intelligence System - Full Specification

## 🎯 Vision

Transform the Design System Generator into an **AI-powered visual analysis tool** that understands design like a human designer would - recognizing visual dominance, style patterns, color harmony, and translating web aesthetics into design systems.

---

## 🔥 Core Problem Being Solved

**Current State (Why People Won't Use It):**
```
❌ Counts button instances, misses gradient covering 80% of screen
❌ Extracts random colors, ignores beautiful color harmony
❌ Creates 8px radius buttons when original has 24px
❌ Adds borders to cards that have no borders
❌ Can't understand gradients or image-based styling
❌ No visual intelligence - just basic extraction
```

**Future State (Game-Changing Plugin):**
```
✅ Understands visual dominance by area coverage
✅ Detects color harmony and gradients
✅ Matches exact corner radius from original
✅ Respects stroke presence/absence
✅ Analyzes screenshots with Claude Vision
✅ Provides intelligent style recommendations
✅ Translates web aesthetics to Figma perfectly
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         DESIGN SYSTEM GENERATOR 2.0             │
│          (Visual Intelligence Edition)          │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
   ┌────▼─────┐              ┌───────▼──────┐
   │  INPUT   │              │   ANALYSIS   │
   │  LAYER   │              │    ENGINE    │
   └────┬─────┘              └───────┬──────┘
        │                            │
  ┌─────┴──────┐            ┌────────┴────────┐
  │ • Figma    │            │ • Visual        │
  │   Frames   │            │   Dominance     │
  │ • Screen   │            │ • Corner Radius │
  │   shot     │            │ • Gradients     │
  │ • URL      │            │ • Color Harmony │
  └────────────┘            │ • Claude Vision │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │   GENERATION    │
                            │     ENGINE      │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │  DESIGN SYSTEM  │
                            │   (Accurate!)   │
                            └─────────────────┘
```

---

## 📊 Feature Breakdown

### **Phase 1: Enhanced Frame Analysis** (Week 1)

#### 1.1 Visual Dominance Calculator
```javascript
/**
 * Calculate color importance by VISUAL AREA, not count
 */
function calculateVisualDominance(colorMap, nodes) {
  var totalVisibleArea = 0;
  var colorAreas = new Map();

  nodes.forEach(function(node) {
    if (node.visible === false) return;

    var nodeArea = node.width * node.height;
    totalVisibleArea += nodeArea;

    // Calculate fill area
    if (node.fills) {
      node.fills.forEach(function(fill) {
        if (fill.visible === false) return;

        var opacity = fill.opacity || 1;
        var effectiveArea = nodeArea * opacity;

        if (fill.type === 'SOLID') {
          var hex = rgbToHex(fill.color);
          var current = colorAreas.get(hex) || 0;
          colorAreas.set(hex, current + effectiveArea);
        }

        if (fill.type.includes('GRADIENT')) {
          // Extract gradient colors
          fill.gradientStops.forEach(function(stop) {
            var hex = rgbToHex(stop.color);
            var stopArea = effectiveArea * 0.5; // Share area between stops
            var current = colorAreas.get(hex) || 0;
            colorAreas.set(hex, current + stopArea);
          });
        }
      });
    }
  });

  // Calculate percentages
  var dominance = [];
  colorAreas.forEach(function(area, hex) {
    var percentage = (area / totalVisibleArea) * 100;
    dominance.push({
      hex: hex,
      area: area,
      percentage: percentage.toFixed(1) + '%',
      score: percentage // For sorting
    });
  });

  // Sort by visual dominance
  dominance.sort(function(a, b) {
    return b.score - a.score;
  });

  return dominance;
}
```

**Result**:
```
🎨 Visual Dominance Analysis:
1. Cyan→Green Gradient: 76.3% (HERO/PRIMARY!)
2. White: 15.2% (Background)
3. Dark Gray: 5.1% (Text)
4. Button Blue: 2.4% (Accent)
5. Card Border: 1.0% (Border)
```

#### 1.2 Corner Radius Detection
```javascript
/**
 * Detect most common corner radius for each component type
 */
function detectCornerRadii(componentPatterns) {
  var radii = {
    button: [],
    card: [],
    input: []
  };

  // Collect all radii
  componentPatterns.buttons.forEach(function(btn) {
    if (btn.node.cornerRadius) {
      radii.button.push(btn.node.cornerRadius);
    }
  });

  componentPatterns.cards.forEach(function(card) {
    if (card.node.cornerRadius) {
      radii.card.push(card.node.cornerRadius);
    }
  });

  // Find most common
  return {
    button: getMostFrequent(radii.button) || 8,
    card: getMostFrequent(radii.card) || 12,
    input: getMostFrequent(radii.input) || 6
  };
}

function getMostFrequent(arr) {
  if (arr.length === 0) return null;
  var frequency = {};
  var maxCount = 0;
  var mostFrequent = arr[0];

  arr.forEach(function(val) {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxCount) {
      maxCount = frequency[val];
      mostFrequent = val;
    }
  });

  return mostFrequent;
}
```

**Result**:
```
📐 Detected Corner Radii:
• Buttons: 24px (found in 8/10 buttons)
• Cards: 16px (found in 6/6 cards)
• Inputs: 8px (found in 3/3 inputs)

✅ Generated components will match!
```

#### 1.3 Gradient Detection & Extraction
```javascript
/**
 * Extract gradient colors and classify as primary
 */
function analyzeGradients(nodes) {
  var gradients = [];

  traverseNodes(nodes, function(node) {
    if (!node.fills) return;

    node.fills.forEach(function(fill) {
      if (fill.type === 'GRADIENT_LINEAR' ||
          fill.type === 'GRADIENT_RADIAL' ||
          fill.type === 'GRADIENT_ANGULAR' ||
          fill.type === 'GRADIENT_DIAMOND') {

        var gradientInfo = {
          type: fill.type,
          colors: [],
          nodeSize: node.width * node.height,
          nodeName: node.name
        };

        fill.gradientStops.forEach(function(stop) {
          gradientInfo.colors.push({
            hex: rgbToHex(stop.color),
            position: stop.position
          });
        });

        gradients.push(gradientInfo);
      }
    });
  });

  // Find largest gradient (hero section)
  gradients.sort(function(a, b) {
    return b.nodeSize - a.nodeSize;
  });

  return gradients;
}
```

**Result**:
```
🌈 Gradient Analysis:
1. Hero Gradient (1440x600px) - 86% coverage
   Colors: #00D4AA → #B7FF9C
   Type: Linear
   Recommendation: Use as PRIMARY color scheme

2. Card Overlay (300x200px) - 2% coverage
   Colors: rgba(0,0,0,0) → rgba(0,0,0,0.3)
   Type: Linear
   Recommendation: Use for shadows/overlays
```

---

### **Phase 2: Screenshot Analysis** (Week 2)

#### 2.1 Screenshot Upload Interface
```html
<div class="section">
  <div class="section-title">📸 Screenshot Analysis (Enhanced)</div>
  <div class="section-description">
    Upload a screenshot for AI-powered visual analysis
  </div>

  <div class="upload-zone" id="uploadZone">
    <div class="upload-icon">📸</div>
    <div class="upload-text">
      <strong>Drop screenshot here</strong> or click to browse
    </div>
    <div class="upload-hint">
      Supports: PNG, JPG, WebP • Max 10MB
    </div>
    <input type="file" id="screenshotInput" accept="image/*" style="display: none;">
  </div>

  <div id="screenshotPreview" style="display: none;">
    <img id="previewImage" style="max-width: 100%; border-radius: 8px;">
    <button onclick="removeScreenshot()">Remove</button>
  </div>
</div>
```

#### 2.2 Claude Vision Integration
```javascript
/**
 * Analyze screenshot with Claude Vision API
 */
async function analyzeScreenshotWithClaude(base64Image) {
  var prompt = `Analyze this website/design screenshot and extract design system information.

IMPORTANT: Provide exact analysis in this format:

1. VISUAL HIERARCHY
   - What are the most visually dominant colors? (by screen area, not count)
   - List in order of visual dominance with estimated percentage

2. COLOR PALETTE
   - Primary color (most dominant/hero section)
   - Secondary color (accents, CTAs)
   - Text colors (headings, body)
   - Background colors
   - Border/divider colors

3. COMPONENT STYLES
   - Button corner radius (in px)
   - Card corner radius (in px)
   - Input corner radius (in px)
   - Do cards have visible borders? (yes/no)
   - Do inputs have visible borders? (yes/no)

4. GRADIENT ANALYSIS
   - Are there gradients? Where?
   - What colors are in the gradients?
   - Should gradients be primary colors?

5. COLOR HARMONY
   - Describe the color scheme (analogous, complementary, triadic, etc.)
   - What mood/feeling does it convey?
   - Color relationships and pairings

6. DESIGN STYLE
   - Modern, minimal, bold, playful, professional?
   - Key visual characteristics
   - Typography style (if visible)

Return as JSON for easy parsing.`;

  var response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY, // User provides
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    })
  });

  var data = await response.json();
  return parseClaudeResponse(data.content[0].text);
}
```

**Example Claude Response**:
```json
{
  "visualHierarchy": [
    {"color": "#00D4AA → #B7FF9C", "type": "gradient", "percentage": "76%"},
    {"color": "#FFFFFF", "type": "solid", "percentage": "15%"},
    {"color": "#1A1A1A", "type": "solid", "percentage": "5%"}
  ],
  "colorPalette": {
    "primary": "#00D4AA",
    "secondary": "#B7FF9C",
    "text": {"heading": "#1A1A1A", "body": "#4A4A4A"},
    "background": "#FFFFFF",
    "border": "none - cards have no borders"
  },
  "componentStyles": {
    "buttonRadius": "24px",
    "cardRadius": "16px",
    "inputRadius": "8px",
    "cardsHaveBorders": false,
    "inputsHaveBorders": true
  },
  "gradients": {
    "present": true,
    "location": "Hero section, large background",
    "colors": ["#00D4AA", "#B7FF9C"],
    "shouldBePrimary": true,
    "recommendation": "Use gradient as primary brand identity"
  },
  "colorHarmony": {
    "scheme": "Analogous with high saturation",
    "mood": "Fresh, modern, innovative, nature-inspired",
    "relationships": "Cyan and green create vibrant, energetic feel"
  },
  "designStyle": {
    "style": "Modern, clean, bold",
    "characteristics": [
      "Large hero imagery",
      "Generous white space",
      "Vibrant gradient backgrounds",
      "Minimal borders",
      "Photography-driven"
    ]
  }
}
```

---

### **Phase 3: Intelligent Classification** (Week 3)

#### 3.1 Smart Color Role Assignment
```javascript
/**
 * Combine Figma analysis + Claude analysis for perfect classification
 */
function intelligentColorClassification(figmaData, claudeData) {
  var classified = {
    primary: null,
    secondary: null,
    accent: null,
    text: {},
    background: {},
    border: null,
    gradient: null
  };

  // Priority 1: Claude's visual analysis (most accurate)
  if (claudeData && claudeData.colorPalette) {
    classified.primary = claudeData.colorPalette.primary;
    classified.secondary = claudeData.colorPalette.secondary;
    classified.text = claudeData.colorPalette.text;
    classified.background = claudeData.colorPalette.background;
  }

  // Priority 2: Visual dominance from Figma
  if (figmaData.visualDominance && figmaData.visualDominance.length > 0) {
    if (!classified.primary) {
      classified.primary = figmaData.visualDominance[0].hex;
    }
  }

  // Priority 3: Gradient detection
  if (figmaData.gradients && figmaData.gradients.length > 0) {
    var heroGradient = figmaData.gradients[0];
    classified.gradient = {
      colors: heroGradient.colors,
      type: heroGradient.type,
      useAsPrimary: heroGradient.nodeSize > totalArea * 0.5
    };
  }

  // Fallback to usage-based
  if (!classified.primary && figmaData.colors) {
    classified.primary = figmaData.colors[0].hex;
  }

  return classified;
}
```

#### 3.2 Component Property Detection
```javascript
/**
 * Intelligent component property detection
 */
function detectComponentProperties(patterns, claudeData) {
  var properties = {
    button: {
      cornerRadius: null,
      variants: [],
      sizes: []
    },
    card: {
      cornerRadius: null,
      hasStroke: false,
      hasShadow: false
    },
    input: {
      cornerRadius: null,
      hasStroke: true,
      focusStyle: null
    }
  };

  // From Claude (if available)
  if (claudeData && claudeData.componentStyles) {
    properties.button.cornerRadius = parseInt(claudeData.componentStyles.buttonRadius);
    properties.card.cornerRadius = parseInt(claudeData.componentStyles.cardRadius);
    properties.input.cornerRadius = parseInt(claudeData.componentStyles.inputRadius);
    properties.card.hasStroke = claudeData.componentStyles.cardsHaveBorders;
  }

  // From Figma detection
  if (patterns.buttons.length > 0) {
    var radii = patterns.buttons.map(function(b) {
      return b.node.cornerRadius || 0;
    });
    if (!properties.button.cornerRadius) {
      properties.button.cornerRadius = getMostFrequent(radii);
    }
  }

  if (patterns.cards.length > 0) {
    var hasStroke = patterns.cards.some(function(c) {
      return c.hasStroke;
    });
    if (claudeData && claudeData.componentStyles) {
      // Claude overrides if available
      properties.card.hasStroke = claudeData.componentStyles.cardsHaveBorders;
    } else {
      properties.card.hasStroke = hasStroke;
    }
  }

  return properties;
}
```

---

### **Phase 4: Enhanced UI** (Week 4)

#### 4.1 Analysis Results Display
```html
<div class="section">
  <div class="section-title">🎨 Visual Analysis Results</div>

  <!-- Visual Dominance -->
  <div class="analysis-card">
    <h4>Visual Dominance (by screen area)</h4>
    <div class="dominance-bars">
      <div class="dominance-item">
        <div class="dominance-color" style="background: linear-gradient(90deg, #00D4AA, #B7FF9C)"></div>
        <div class="dominance-info">
          <span class="dominance-label">Hero Gradient</span>
          <span class="dominance-percent">76.3%</span>
        </div>
        <div class="dominance-bar">
          <div class="dominance-fill" style="width: 76.3%; background: #00D4AA"></div>
        </div>
      </div>

      <div class="dominance-item">
        <div class="dominance-color" style="background: #FFFFFF"></div>
        <div class="dominance-info">
          <span class="dominance-label">White</span>
          <span class="dominance-percent">15.2%</span>
        </div>
        <div class="dominance-bar">
          <div class="dominance-fill" style="width: 15.2%; background: #FFFFFF; border: 1px solid #eee"></div>
        </div>
      </div>

      <div class="dominance-item">
        <div class="dominance-color" style="background: #1A1A1A"></div>
        <div class="dominance-info">
          <span class="dominance-label">Text Dark</span>
          <span class="dominance-percent">5.1%</span>
        </div>
        <div class="dominance-bar">
          <div class="dominance-fill" style="width: 5.1%; background: #1A1A1A"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Component Properties -->
  <div class="analysis-card">
    <h4>Detected Component Styles</h4>
    <div class="property-grid">
      <div class="property-item">
        <div class="property-icon">🔘</div>
        <div class="property-info">
          <div class="property-label">Button Radius</div>
          <div class="property-value">24px</div>
        </div>
      </div>

      <div class="property-item">
        <div class="property-icon">📦</div>
        <div class="property-info">
          <div class="property-label">Card Radius</div>
          <div class="property-value">16px</div>
        </div>
      </div>

      <div class="property-item">
        <div class="property-icon">🚫</div>
        <div class="property-info">
          <div class="property-label">Card Border</div>
          <div class="property-value">None</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Color Harmony -->
  <div class="analysis-card">
    <h4>🌈 Color Harmony Analysis</h4>
    <div class="harmony-info">
      <div class="harmony-label">Scheme:</div>
      <div class="harmony-value">Analogous (Cyan → Green)</div>
    </div>
    <div class="harmony-info">
      <div class="harmony-label">Mood:</div>
      <div class="harmony-value">Fresh, Modern, Nature-inspired</div>
    </div>
    <div class="harmony-swatch">
      <div style="background: #00D4AA; flex: 1; height: 40px"></div>
      <div style="background: #33DDB5; flex: 1; height: 40px"></div>
      <div style="background: #66E6C0; flex: 1; height: 40px"></div>
      <div style="background: #99EFCB; flex: 1; height: 40px"></div>
      <div style="background: #B7FF9C; flex: 1; height: 40px"></div>
    </div>
  </div>

  <!-- AI Recommendations -->
  <div class="analysis-card recommendation-card">
    <h4>💡 AI Recommendations</h4>
    <ul class="recommendations">
      <li>✅ Use gradient (#00D4AA → #B7FF9C) as primary brand identity</li>
      <li>✅ Cards should have NO borders (clean, modern style)</li>
      <li>✅ Button radius: 24px for bold, modern feel</li>
      <li>✅ Pair with generous white space for breathing room</li>
    </ul>
  </div>
</div>
```

---

### **Phase 5: Accurate Generation** (Week 5)

#### 5.1 Generate with Detected Properties
```javascript
/**
 * Generate components with accurate properties
 */
async function generateAccurateComponents(properties, colors) {
  var yOffset = 0;

  // Generate Button with DETECTED corner radius
  var buttonRadius = properties.button.cornerRadius || 8;
  var buttonFrame = figma.createFrame();
  buttonFrame.name = 'Button/Primary';
  buttonFrame.cornerRadius = buttonRadius; // ACCURATE!
  buttonFrame.resize(120, 44);
  buttonFrame.fills = [{ type: 'SOLID', color: hexToRgb(colors.primary) }];

  // Generate Card with accurate stroke
  var cardRadius = properties.card.cornerRadius || 12;
  var cardFrame = figma.createFrame();
  cardFrame.name = 'Card/Default';
  cardFrame.cornerRadius = cardRadius; // ACCURATE!
  cardFrame.resize(280, 160);
  cardFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  // Only add stroke if detected
  if (properties.card.hasStroke) {
    cardFrame.strokes = [{ type: 'SOLID', color: hexToRgb(colors.border) }];
    cardFrame.strokeWeight = 1;
  }
  // ACCURATE - no border if original had none!
}
```

#### 5.2 Gradient Support
```javascript
/**
 * Generate gradient backgrounds
 */
function createGradientFill(gradientInfo) {
  if (gradientInfo.type === 'GRADIENT_LINEAR') {
    return {
      type: 'GRADIENT_LINEAR',
      gradientTransform: [
        [1, 0, 0],
        [0, 1, 0]
      ],
      gradientStops: gradientInfo.colors.map(function(color, index) {
        return {
          color: hexToRgb(color.hex),
          position: color.position || (index / (gradientInfo.colors.length - 1))
        };
      })
    };
  }
}

// Apply to hero section
var heroFrame = figma.createFrame();
heroFrame.name = 'Hero/Background';
heroFrame.fills = [createGradientFill(detectedGradient)];
```

---

## 🎯 Implementation Timeline

### **Week 1: Enhanced Frame Analysis**
- Day 1-2: Visual dominance calculator
- Day 3-4: Corner radius detection
- Day 5-7: Gradient detection & extraction

### **Week 2: Screenshot Analysis**
- Day 1-2: Screenshot upload UI
- Day 3-5: Claude Vision API integration
- Day 6-7: Response parsing & display

### **Week 3: Intelligent Classification**
- Day 1-3: Smart color role assignment
- Day 4-5: Component property detection
- Day 6-7: Color harmony analysis

### **Week 4: Enhanced UI**
- Day 1-3: Visual dominance display
- Day 4-5: Component properties UI
- Day 6-7: AI recommendations panel

### **Week 5: Accurate Generation**
- Day 1-3: Generate with detected properties
- Day 4-5: Gradient support
- Day 6-7: Testing & refinement

---

## 💰 Business Impact

### **Why People Will Pay:**

**Before (Basic):**
```
"Meh, I can just eyeball colors myself"
"It gets the colors wrong anyway"
"Doesn't match my design at all"
"Just another color picker plugin"
```

**After (Visual Intelligence):**
```
"WOW! It understood my gradient was the primary color!"
"Exact corner radius match - saves me hours!"
"AI analysis is spot-on about color harmony"
"This is like having a design system expert analyze my site"
"Screenshot upload + AI = game changer"
```

### **Pricing Strategy:**

**Free Tier:**
- Basic frame analysis
- Color extraction (count-based)
- 5 analyses per month

**Pro Tier ($9/month):**
- Visual dominance analysis
- Corner radius detection
- 50 analyses per month

**Studio Tier ($29/month):**
- Everything in Pro
- Screenshot upload + Claude Vision
- Color harmony analysis
- AI recommendations
- Unlimited analyses

### **ROI for Users:**

**Agency Use Case:**
```
Before: 4-6 hours to analyze & create design system
After: 30 seconds analysis + 1 hour refinement
Savings: $500-900 per project
Plugin cost: $29/month
Break even: 1 project
```

---

## 🚀 Success Metrics

**Plugin is successful when:**

✅ 90%+ accuracy on corner radius detection
✅ Visual dominance matches human perception
✅ Claude analysis rated "accurate" by 80%+ of users
✅ 50%+ reduction in manual adjustments needed
✅ 1000+ active users within 3 months
✅ 4.5+ star rating on Figma Community
✅ $10K+ MRR within 6 months

---

## 🎓 Competitive Advantage

**No other plugin:**
- ❌ Uses visual area for color dominance
- ❌ Detects corner radius automatically
- ❌ Integrates Claude Vision for analysis
- ❌ Understands gradients as primary colors
- ❌ Provides color harmony recommendations
- ❌ Matches component properties accurately

**This plugin will be FIRST to:**
- ✅ Understand visual hierarchy like a designer
- ✅ Use AI for screenshot analysis
- ✅ Generate pixel-perfect component matches
- ✅ Recommend based on color theory
- ✅ Support gradient extraction

---

## 📝 Next Steps

1. ✅ **Approve this spec**
2. ✅ **Week 1: I build visual dominance + corner radius detection**
3. ✅ **Week 2: I integrate Claude Vision API**
4. ✅ **Week 3-5: Complete remaining features**
5. ✅ **Beta test with real designs**
6. ✅ **Launch on Figma Community**
7. ✅ **Dominate the market** 🚀

---

## 🤝 Decision Time

**This is a game-changing plugin that will:**
- Actually understand designs visually
- Provide accurate, intelligent analysis
- Save users hours of work
- Command premium pricing
- Have zero competition

**Should we build it?** 💪
