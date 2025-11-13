# UI Design Science: Principles for Design System Generation

## 🎨 The Problem

**Current State**: Plugin detects colors and components, but generated design systems look "off" because:
- No systematic spacing (random padding/margins)
- Arbitrary corner radius values
- Color proportions don't follow design principles
- Typography lacks hierarchy
- Web design aesthetics don't translate to software UI

**Solution**: Implement proven design principles as computational rules.

---

## 📐 1. Spacing Systems

### The 8-Point Grid System

**Principle**: All spacing should be multiples of 8px (or 4px for fine adjustments).

**Why 8px?**
- Divisible by 2, 4 (easy scaling)
- Works on all screen densities (1x, 2x, 3x)
- Creates visual rhythm and consistency

**Standard Scale**:
```
4px  - Micro spacing (icon padding, tight gaps)
8px  - Small spacing (button padding, form fields)
12px - Compact spacing (card padding)
16px - Base spacing (component margins)
24px - Medium spacing (section gaps)
32px - Large spacing (page margins)
48px - XL spacing (hero sections)
64px - XXL spacing (major sections)
```

**Implementation**:
```javascript
// Snap detected spacing to 8pt grid
function snapToGrid(value) {
  var base = 8;
  return Math.round(value / base) * base;
}

// Build spacing scale from detected values
function buildSpacingScale(detectedSpacing) {
  var scale = [4, 8, 12, 16, 24, 32, 48, 64];
  var matched = {};

  detectedSpacing.forEach(function(spacing) {
    var snapped = snapToGrid(spacing);
    matched[spacing] = snapped;
  });

  return matched;
}
```

---

## 🎨 2. Color Theory & Proportions

### The 60-30-10 Rule

**Principle**: Colors should be distributed in specific proportions for visual harmony.

**Breakdown**:
- **60%** - Dominant/Background color (neutral, calming)
- **30%** - Secondary color (supports primary, adds interest)
- **10%** - Accent color (draws attention, CTAs)

**Application to Software UI**:
```
60% - Background, containers, large surfaces
30% - Text, borders, secondary elements
10% - Buttons, links, highlights, CTAs
```

**Color Roles for Software**:
```javascript
var colorRoles = {
  primary: {
    usage: 'Buttons, active states, brand elements',
    coverage: '10-15%',
    contrast: 'Must have 4.5:1 contrast on white/dark backgrounds'
  },
  secondary: {
    usage: 'Supporting elements, hover states',
    coverage: '5-10%',
  },
  background: {
    usage: 'Page background, card backgrounds',
    coverage: '50-60%',
    requirement: 'Neutral (gray scale or very low saturation)'
  },
  surface: {
    usage: 'Cards, modals, elevated components',
    coverage: '20-30%',
    requirement: 'Slightly different from background (elevation)'
  },
  text: {
    primary: { usage: 'Headings, body text', contrast: '7:1 (AAA)' },
    secondary: { usage: 'Captions, descriptions', contrast: '4.5:1 (AA)' },
    disabled: { usage: 'Disabled text', contrast: '3:1 minimum' }
  },
  border: {
    usage: 'Dividers, input borders, card outlines',
    requirement: 'Subtle (low contrast with background)'
  },
  error: { usage: 'Error states, destructive actions', standard: '#DC2626' },
  success: { usage: 'Success states, confirmations', standard: '#16A34A' },
  warning: { usage: 'Warning states, cautions', standard: '#F59E0B' }
};
```

**Implementation**:
```javascript
function classifyColorRoles(colors) {
  // Sort by coverage
  colors.sort((a, b) => b.percentage - a.percentage);

  var classified = {
    background: null,
    surface: null,
    primary: null,
    secondary: null,
    text: [],
    border: null
  };

  // Background: highest coverage, neutral color
  var backgrounds = colors.filter(c =>
    c.percentage > 40 && isNeutral(c.hex)
  );
  classified.background = backgrounds[0];

  // Primary: 10-20% coverage, saturated color
  var primaries = colors.filter(c =>
    c.percentage >= 10 && c.percentage <= 20 && getSaturation(c.hex) > 50
  );
  classified.primary = primaries[0];

  // Text: dark color (unless dark mode), high coverage
  var texts = colors.filter(c =>
    getLuminance(c.hex) < 0.3 && c.percentage > 5
  );
  classified.text = texts;

  return classified;
}
```

---

## 📏 3. Typography Scale (Modular Scale)

### The Golden Ratio / Major Third Scale

**Principle**: Font sizes should follow a mathematical ratio for visual harmony.

**Common Ratios**:
- **1.125** - Major Second (subtle)
- **1.200** - Minor Third (moderate)
- **1.250** - Major Third (pronounced)
- **1.333** - Perfect Fourth (strong)
- **1.618** - Golden Ratio (dramatic)

**Standard Type Scale** (using 1.250 ratio, base 16px):
```
12px - Caption, helper text
14px - Small text, labels
16px - Base body text (100%)
20px - Large text (125%)
25px - H4 (156%)
31px - H3 (194%)
39px - H2 (244%)
49px - H1 (306%)
```

**Implementation**:
```javascript
function buildTypeScale(baseSize, ratio) {
  var scale = {
    caption: Math.round(baseSize / Math.pow(ratio, 2)),  // 12px
    small: Math.round(baseSize / ratio),                 // 14px
    base: baseSize,                                       // 16px
    large: Math.round(baseSize * ratio),                 // 20px
    h4: Math.round(baseSize * Math.pow(ratio, 2)),       // 25px
    h3: Math.round(baseSize * Math.pow(ratio, 3)),       // 31px
    h2: Math.round(baseSize * Math.pow(ratio, 4)),       // 39px
    h1: Math.round(baseSize * Math.pow(ratio, 5))        // 49px
  };

  return scale;
}

// Extract from AI/Figma
function detectTypeScale(detectedSizes) {
  var baseSize = findMostCommonSize(detectedSizes) || 16;

  // Detect ratio by comparing size relationships
  var ratios = [];
  for (var i = 1; i < detectedSizes.length; i++) {
    ratios.push(detectedSizes[i] / detectedSizes[i-1]);
  }

  var avgRatio = ratios.reduce((a,b) => a+b) / ratios.length;
  var standardRatio = snapToStandardRatio(avgRatio);

  return buildTypeScale(baseSize, standardRatio);
}

function snapToStandardRatio(detected) {
  var standards = [1.125, 1.200, 1.250, 1.333, 1.414, 1.618];
  var closest = standards[0];
  var minDiff = Math.abs(detected - closest);

  standards.forEach(function(ratio) {
    var diff = Math.abs(detected - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ratio;
    }
  });

  return closest;
}
```

---

## 🔘 4. Corner Radius & Border Proportions

### Design System Standards

**Principle**: Corner radius should relate to component size.

**Standard Values**:
```
0px   - Square (data tables, strict layouts)
2px   - Subtle (small tags, badges)
4px   - Small components (buttons, inputs, chips)
6px   - Medium components (cards, small modals)
8px   - Large components (cards, panels)
12px  - Extra large (modals, drawers)
16px  - Hero sections, feature cards
24px  - Pronounced rounded (modern aesthetic)
9999px - Pill-shaped (tags, status badges)
```

**Relationship to Component Size**:
```javascript
function calculateCornerRadius(width, height) {
  var minDimension = Math.min(width, height);

  // Rule: Corner radius should be 5-10% of smallest dimension
  var calculated = Math.round(minDimension * 0.07);

  // Snap to standard values
  var standards = [0, 2, 4, 6, 8, 12, 16, 24];
  return snapToNearest(calculated, standards);
}
```

**Border Thickness**:
```
1px - Standard borders (inputs, cards, dividers)
2px - Emphasized borders (focus states, selected items)
3px - Strong emphasis (error states, warnings)
4px - Very strong (loading indicators, thick dividers)
```

---

## 📊 5. Component Proportions

### Button Proportions

**Standard Button Sizes**:
```javascript
var buttonSizes = {
  small: {
    height: 32,
    paddingX: 12,
    paddingY: 6,
    fontSize: 14,
    iconSize: 16
  },
  medium: {
    height: 40,
    paddingX: 16,
    paddingY: 10,
    fontSize: 16,
    iconSize: 20
  },
  large: {
    height: 48,
    paddingX: 24,
    paddingY: 14,
    fontSize: 18,
    iconSize: 24
  }
};
```

**Proportions**:
- Height = fontSize × 2.5
- PaddingX = fontSize × 1
- PaddingY = fontSize × 0.625
- Icon size = fontSize × 1.25

### Input Field Proportions

```javascript
var inputSizes = {
  small: {
    height: 32,
    paddingX: 12,
    paddingY: 6,
    fontSize: 14
  },
  medium: {
    height: 40,
    paddingX: 16,
    paddingY: 10,
    fontSize: 16
  },
  large: {
    height: 48,
    paddingX: 20,
    paddingY: 12,
    fontSize: 18
  }
};
```

### Card Proportions

```javascript
var cardSpacing = {
  compact: {
    padding: 16,
    gap: 8,
    headerMargin: 12
  },
  comfortable: {
    padding: 24,
    gap: 16,
    headerMargin: 16
  },
  spacious: {
    padding: 32,
    gap: 24,
    headerMargin: 24
  }
};
```

---

## 🌐 6. Web Design → Software UI Translation

### Key Differences:

| Aspect | Web Marketing | Software UI |
|--------|--------------|-------------|
| **Purpose** | Attract, persuade, convert | Enable tasks, reduce friction |
| **Spacing** | Generous (48-64px) | Compact (16-24px) |
| **Colors** | Bold, high contrast | Subtle, low cognitive load |
| **Typography** | Large (20-60px headlines) | Smaller (14-24px headlines) |
| **Buttons** | Large CTAs (56-64px) | Efficient (32-40px) |
| **Corner Radius** | Pronounced (16-24px) | Subtle (4-8px) |

### Translation Rules:

```javascript
var translationRules = {
  spacing: {
    hero: { web: 64, software: 24 },  // 62.5% reduction
    section: { web: 48, software: 16 },  // 66% reduction
    component: { web: 32, software: 12 }  // 62.5% reduction
  },

  typography: {
    h1: { web: 60, software: 32 },  // 47% reduction
    h2: { web: 48, software: 24 },
    h3: { web: 36, software: 20 },
    body: { web: 18, software: 14 }  // 22% reduction
  },

  buttons: {
    height: { web: 56, software: 40 },  // 29% reduction
    padding: { web: 32, software: 16 }  // 50% reduction
  },

  cornerRadius: {
    buttons: { web: 24, software: 6 },  // 75% reduction
    cards: { web: 16, software: 8 }  // 50% reduction
  }
};

function translateWebToSoftware(webValue, category, element) {
  var rule = translationRules[category][element];
  var ratio = rule.software / rule.web;
  return Math.round(webValue * ratio);
}
```

---

## 🎨 7. Color Harmony & Accessibility

### Contrast Requirements (WCAG)

```javascript
var contrastRequirements = {
  AAA: {
    normalText: 7.0,      // Body text, paragraphs
    largeText: 4.5        // 18px+ or 14px+ bold
  },
  AA: {
    normalText: 4.5,      // Minimum for body text
    largeText: 3.0        // Minimum for large text
  },
  UI: {
    components: 3.0       // Minimum for UI components
  }
};

function calculateContrast(color1, color2) {
  var l1 = getLuminance(color1);
  var l2 = getLuminance(color2);
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex) {
  var rgb = hexToRgb(hex);
  var r = rgb.r / 255;
  var g = rgb.g / 255;
  var b = rgb.b / 255;

  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

### Color Adjustment for Software UI

```javascript
function adjustColorForSoftwareUI(webColor, role) {
  var hsl = hexToHsl(webColor);

  if (role === 'background') {
    // Reduce saturation for backgrounds
    hsl.s = Math.min(hsl.s, 10);  // Max 10% saturation
    hsl.l = Math.max(hsl.l, 95);  // Minimum 95% lightness
  }

  if (role === 'primary') {
    // Ensure primary is vibrant but not overwhelming
    hsl.s = Math.min(Math.max(hsl.s, 60), 80);  // 60-80% saturation
    hsl.l = Math.min(Math.max(hsl.l, 40), 60);  // 40-60% lightness
  }

  if (role === 'text') {
    // Ensure text is neutral and high contrast
    hsl.s = Math.min(hsl.s, 20);  // Low saturation
    hsl.l = hsl.l < 50 ? Math.min(hsl.l, 20) : Math.max(hsl.l, 80);
  }

  return hslToHex(hsl);
}
```

---

## 🚀 Implementation Strategy

### Phase 1: Extract Design Principles from AI Analysis

Update Claude Vision prompt to extract:
```
1. Spacing values (all padding/margin/gaps)
2. Font sizes (all heading and body sizes)
3. Corner radius values (all detected radii)
4. Color saturation and luminance
5. Button/component dimensions
```

### Phase 2: Apply Design Science

```javascript
function applyDesignScience(aiAnalysis, figmaData) {
  // 1. Build spacing scale (8pt grid)
  var spacingScale = buildSpacingScale(aiAnalysis.spacing);

  // 2. Build typography scale (modular scale)
  var typeScale = buildTypeScale(aiAnalysis.baseFontSize, 1.250);

  // 3. Classify colors (60-30-10 rule)
  var colorRoles = classifyColorRoles(figmaData.colors);

  // 4. Normalize corner radius
  var cornerRadius = normalizeCornerRadius(aiAnalysis.cornerRadius);

  // 5. Translate web → software
  var softwareSpacing = translateSpacing(spacingScale, 'webToSoftware');
  var softwareType = translateTypography(typeScale, 'webToSoftware');
  var softwareRadius = translateCornerRadius(cornerRadius, 'webToSoftware');

  return {
    spacing: softwareSpacing,
    typography: softwareType,
    colors: colorRoles,
    cornerRadius: softwareRadius,
    components: buildComponentSpecs(colorRoles, softwareSpacing, softwareType)
  };
}
```

### Phase 3: Generate Consistent Components

```javascript
function generateButton(designSystem) {
  return {
    height: 40,  // Standard medium button
    paddingX: designSystem.spacing.md,  // 16px
    paddingY: 10,
    fontSize: designSystem.typography.base,  // 16px
    cornerRadius: designSystem.cornerRadius.sm,  // 6px
    background: designSystem.colors.primary,
    textColor: getContrastColor(designSystem.colors.primary),
    hoverBackground: adjustBrightness(designSystem.colors.primary, -10),
    activeBackground: adjustBrightness(designSystem.colors.primary, -20)
  };
}
```

---

## 📋 Summary

**Key Principles to Implement**:
1. ✅ **8-Point Grid** - All spacing multiples of 8px
2. ✅ **60-30-10 Color Rule** - Proper color proportions
3. ✅ **Modular Type Scale** - Mathematical font size ratios
4. ✅ **Component Proportions** - Height = fontSize × 2.5
5. ✅ **Web → Software Translation** - Reduce spacing/size by ~50-65%
6. ✅ **Accessibility** - WCAG AA minimum (4.5:1 contrast)
7. ✅ **Visual Rhythm** - Consistent spacing creates harmony

These rules transform "detected values" into "professional design systems."
