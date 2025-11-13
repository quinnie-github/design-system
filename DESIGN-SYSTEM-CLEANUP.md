# 🧹 Design System Cleanup Feature

## Overview

The **Design System Cleanup** feature helps you transform messy, inconsistent design files into clean, tokenized design systems. Perfect for client projects that lack proper color standardization!

---

## The Problem It Solves

### Before Cleanup:
```
Client sends you a Figma file with:
❌ 45 different shades of blue (should be 3-5)
❌ 12 slightly different grays (should be 1-2)
❌ No consistent color usage
❌ No design system tokens
❌ Manual rebranding takes hours
```

### After Cleanup:
```
✅ 8 standardized colors grouped intelligently
✅ Similar colors consolidated (45 blues → 3 blue groups)
✅ Automatic variable creation for top colors
✅ Ready for tokenization and rebranding
✅ Future updates take seconds
```

---

## How It Works

### Step 1: Intelligent Color Analysis
The plugin analyzes your entire design and:

1. **Scans all elements** - Checks fills and strokes on every layer
2. **Counts usage** - Tracks how many times each color appears
3. **Groups similar colors** - Uses HSL color distance algorithm to find variations
4. **Identifies patterns** - Recognizes which colors are actually the same "brand color"

```
Example Analysis Result:
📊 Found 47 unique colors in design
🎨 Grouped into 12 color families:

Group 1: Primary Blue (18 variations, 156 uses)
  #2563eb (87 uses) ← Representative
  #2564eb (34 uses) ← Similar
  #2562ea (21 uses) ← Similar
  #2665ec (14 uses) ← Similar
  ...

Group 2: Secondary Green (8 variations, 89 uses)
  #10b981 (45 uses) ← Representative
  #10b982 (23 uses) ← Similar
  #11b981 (13 uses) ← Similar
  ...
```

### Step 2: Automatic Cleanup
Once you click "Clean Up Design", the plugin:

1. **Consolidates colors** - Replaces all variations with representative colors
2. **Updates elements** - Changes fills/strokes throughout the document
3. **Creates variables** - Generates tokens for top 3 color groups
4. **Binds variables** - Links elements to the new tokens

```
Cleanup Result:
🔄 Replaced 234 color instances
📉 Reduced from 47 colors to 12 standardized colors
✅ Created 3 brand variables:
   - color/brand/primary (#2563eb)
   - color/brand/secondary (#10b981)
   - color/brand/accent (#f59e0b)
```

---

## Using the Cleanup Tab

### Step 1: Open Variable Updater
```
1. Plugins → Development → Variable Updater
2. Click the "🧹 Cleanup" tab
```

### Step 2: Analyze Your Design
```
1. Click "Analyze Design"
2. Wait for analysis to complete (5-30 seconds)
3. Review the results panel
```

### Step 3: Review Analysis Results
The UI will show you:

```
📊 Analysis Results
Total Colors Found: 47
Color Groups: 12
Most Used Colors:
  • #2563eb (87 uses)
  • #10b981 (45 uses)
  • #f59e0b (23 uses)

🎨 Color Groups
Group 1: 18 variations → #2563eb
  #2563eb (87 uses)
  #2564eb (34 uses)
  #2562ea (21 uses)
  ...

Group 2: 8 variations → #10b981
  #10b981 (45 uses)
  #10b982 (23 uses)
  ...
```

### Step 4: Clean Up Design
```
1. Click "Clean Up Design System"
2. Wait for cleanup to complete (10-60 seconds)
3. Review the cleanup report
```

### Step 5: Review Cleanup Report
```
📊 Cleanup Complete!

Before: 47 unique colors
After: 12 standardized colors
Replaced: 234 color instances
Variables Created: 3

Top Color Groups:
  • primary: #2563eb (156 total uses)
  • secondary: #10b981 (89 total uses)
  • accent: #f59e0b (45 total uses)
```

---

## Real-World Workflow

### Scenario 1: Messy Client File
```
Client: "Here's our Figma file, can you rebrand it?"
You: *Opens file, sees 50+ inconsistent colors*

Solution:
1. Run Variable Updater → Cleanup
2. Click "Analyze Design"
3. Review groups to understand their color system
4. Click "Clean Up Design System"
5. File now has consistent, tokenized colors!
6. Use Quick tab to rebrand with client colors
7. Deliver in 30 minutes instead of 3 hours!
```

### Scenario 2: Design System Audit
```
Task: Audit existing design system for inconsistencies

Solution:
1. Run Variable Updater → Cleanup
2. Click "Analyze Design"
3. Export results to show team:
   "We have 23 'gray' variations, should be 5"
   "Found 12 'blue' shades, recommend 7-step tonal palette"
4. Use analysis to build style guide
```

### Scenario 3: Component Library Cleanup
```
Task: Standardize a component library before publishing

Solution:
1. Run analysis to find color inconsistencies
2. Review groups - decide which shades to keep
3. Run cleanup to consolidate
4. Variables auto-created for main colors
5. Publish clean, tokenized library
```

---

## Technical Details

### Color Grouping Algorithm

The plugin uses **HSL color distance** for intelligent grouping:

```javascript
// Converts RGB to HSL (Hue, Saturation, Lightness)
rgbToHsl(r, g, b) → { h, s, l }

// Calculates "distance" between two colors
colorDistance(color1, color2) → distance value

// Groups colors if distance < 0.15 threshold
if (distance < 0.15) {
  group.add(color)
}
```

**Why HSL instead of RGB?**
- RGB distance: `#2563eb` vs `#2564eb` looks similar but might not group
- HSL distance: Accounts for human color perception
- Better grouping of "same color, slightly different" variations

### Representative Color Selection

For each group, the **most-used color becomes the representative**:

```
Group: [#2563eb (87x), #2564eb (34x), #2562ea (21x)]
Representative: #2563eb (because it has the most uses)
All other variations get replaced with #2563eb
```

### Performance Optimization

**Optimized for large documents:**
- Single-pass document traversal for analysis
- Efficient Map-based color tracking
- Batched updates to avoid UI freezing
- Limited node information storage (first 5 per color)

**Expected performance:**
- Small file (10 pages, 500 elements): 5-10 seconds
- Medium file (50 pages, 2000 elements): 15-30 seconds
- Large file (100+ pages, 5000+ elements): 30-60 seconds

---

## Understanding the Analysis

### Total Colors
The number of **unique** colors found in your design. Includes all fills and strokes.

### Color Groups
The number of **families** after grouping similar colors. Lower is better!

```
Good: 47 colors → 8-12 groups (well organized)
Okay: 47 colors → 15-20 groups (some consistency)
Bad: 47 colors → 40-47 groups (no consistency)
```

### Representative Colors
The "winner" color from each group. This is usually the most-used shade.

### Variations
All the similar colors that will be replaced by the representative.

---

## Best Practices

### 1. Always Analyze First
Don't clean up blindly! Review the analysis to understand:
- What colors are actually being used
- Which variations will be consolidated
- Whether the grouping makes sense

### 2. Check the Threshold
The default threshold (0.15) groups colors that are "perceptually similar". If you want:
- **Tighter grouping**: Decrease threshold (0.10 = only very similar colors)
- **Looser grouping**: Increase threshold (0.20 = more aggressive consolidation)

*Note: Threshold adjustment requires code modification*

### 3. Backup First
Always duplicate your Figma file before running cleanup:
```
File → Duplicate → Run cleanup on copy → Verify → Apply to original
```

### 4. Review After Cleanup
Check key screens to ensure:
- Colors look correct
- No unintended changes
- Variables are properly named

### 5. Combine with Variable Updater
After cleanup:
```
1. Cleanup creates initial variables
2. Use Quick tab to rebrand with client colors
3. All elements update automatically!
```

---

## Troubleshooting

### "Found 0 unique colors"
**Cause:** Your design only uses gradients, images, or effects (no solid colors)

**Solution:** Ensure you have at least some solid color fills or strokes

### "Color Groups: 47 (same as total)"
**Cause:** All colors are very different from each other

**This means:**
- Design already has good color diversity
- OR colors are too different to group
- Cleanup won't consolidate much

**Solution:** Review analysis to decide if cleanup is needed

### "Cleanup replaced 0 instances"
**Cause:** No color variations found (all colors already unique)

**Solution:** This is actually good! Your design is already clean.

### Some Elements Didn't Change
**Possible reasons:**
- Elements are locked
- Elements use gradients (not solid colors)
- Elements use images/effects
- Elements are in locked frames

**Solution:** Unlock elements and try again

### Wrong Colors Grouped Together
**Cause:** Threshold too high (0.15 default)

**Solution:**
- For now, manually adjust variables after cleanup
- Future version will have adjustable threshold in UI

---

## Limitations

### What Cleanup Handles:
✅ Solid color fills
✅ Solid color strokes
✅ All pages in document
✅ Nested layers and groups
✅ Components and instances

### What Cleanup Doesn't Handle:
❌ Gradient fills/strokes
❌ Image fills
❌ Effect colors (shadows, glows)
❌ Text colors (coming soon)
❌ Locked layers/frames

---

## Advanced: How Variables Are Created

After cleanup, the plugin creates variables for the **top 3 color groups**:

```javascript
// Top 3 groups by total usage
colorGroups.sort(by: totalUsage)
topGroups = colorGroups.slice(0, 3)

// Assign semantic names
topGroups[0] → color/brand/primary
topGroups[1] → color/brand/secondary
topGroups[2] → color/brand/accent
```

**Why top 3?**
- These are your most-used colors (likely brand colors)
- Semantic naming makes them easy to rebrand
- You can manually create more variables for other groups

---

## Comparison: Cleanup vs Quick Update

### Use Cleanup When:
- ✅ Client file is messy with no tokens
- ✅ Need to standardize inconsistent colors
- ✅ Want to analyze color usage patterns
- ✅ Building design system from scratch

### Use Quick Update When:
- ✅ File already has clean colors
- ✅ Variables already exist
- ✅ Just need to change brand colors
- ✅ Rebranding for new client

### Use Both:
```
1. Cleanup messy client file
2. Consolidates 50 colors to 10
3. Creates initial variables
4. Then use Quick Update to rebrand
5. Try different color schemes instantly!
```

---

## FAQ

### Q: Will this delete my original colors?
**A:** No! It replaces color values but keeps your elements intact. You can always undo (Cmd+Z).

### Q: Can I adjust which colors get consolidated?
**A:** Currently, grouping is automatic. Future versions will allow manual group editing.

### Q: Does it work on components?
**A:** Yes! Works on all layer types including components and instances.

### Q: Will it break my component library?
**A:** No, but test on a duplicate first. Color changes propagate to instances.

### Q: Can I run cleanup on just selected layers?
**A:** Currently, it analyzes the entire document. Selection-based cleanup coming soon!

### Q: How do I export the analysis results?
**A:** Copy from the UI, or check the Figma Console for detailed logs.

---

## Next Steps After Cleanup

### 1. Review Variables
```
Open Variables panel (Cmd+Opt+K)
Check the Primitives collection
Rename variables if needed
```

### 2. Create More Variables
```
Manual approach:
- Create variables for other color groups
- Build full tonal palettes
- Add semantic variables

Or use Token Sync plugin for advanced token management
```

### 3. Rebrand with Quick Tab
```
Switch to Quick tab
Select a preset or input client colors
Click "Update Design System"
All elements with variables update automatically!
```

### 4. Export Tokens
```
Use Token Sync plugin to export:
- CSS custom properties
- JavaScript objects
- iOS Swift tokens
- Android XML colors
```

---

## Future Enhancements

Planned features for future versions:

- [ ] Adjustable grouping threshold in UI
- [ ] Manual group editing (merge/split groups)
- [ ] Text color support
- [ ] Effect color support (shadows, etc.)
- [ ] Selection-based cleanup
- [ ] Export analysis report as CSV/JSON
- [ ] Before/after preview mode
- [ ] Undo cleanup option
- [ ] Custom variable naming rules

---

## Summary

The Design System Cleanup feature:

✅ **Analyzes** messy designs to find color patterns
✅ **Groups** similar colors intelligently using HSL distance
✅ **Consolidates** variations into representative colors
✅ **Creates** variables for top color groups
✅ **Prepares** designs for tokenization and rebranding

**Perfect for:**
- Agency workflows with messy client files
- Design system audits and standardization
- Component library cleanup
- Pre-tokenization preparation

**Try it on your next messy client file and save hours of manual work!** 🚀
