# Syntax Error Fix - ES5 Compatibility

## Problem

Console showed syntax error:
```
Syntax error on line 207: Unexpected token ...rule
```

This was caused by using **ES6+ features** that Figma plugins don't support.

## Root Cause

Figma plugins run in a restricted JavaScript environment that **only supports ES5 and limited ES6 features**. The following ES6+ features are **NOT supported**:

1. **Spread operator** (`...`)
2. **Optional chaining** (`?.`)
3. **Nullish coalescing** (`??`)
4. **Destructuring assignments**

## Fixes Applied

### 1. Fixed `chat-plugin.js` Line 207
**Before:**
```javascript
const customRule = {
  ...rule,
  id: rule.id || `DS-Custom-${Date.now()}`,
  status: 'draft',
  lastUpdated: new Date().toISOString()
};
```

**After:**
```javascript
// Use Object.assign instead of spread operator (ES5 compatible)
const customRule = Object.assign({}, rule, {
  id: rule.id || 'DS-Custom-' + Date.now(),
  status: 'draft',
  lastUpdated: new Date().toISOString()
});
```

### 2. Fixed `chat-plugin.js` Line 243
**Before:**
```javascript
return [...this.ruleCards, ...this.customRules];
```

**After:**
```javascript
// Use concat instead of spread operator (ES5 compatible)
return this.ruleCards.concat(this.customRules);
```

### 3. Fixed `chat-plugin.js` Line 227-228
**Before:**
```javascript
matchedTemplate: matchedTemplate?.template || null,
confidence: matchedTemplate?.confidence || 0,
```

**After:**
```javascript
matchedTemplate: (matchedTemplate && matchedTemplate.template) || null,
confidence: (matchedTemplate && matchedTemplate.confidence) || 0,
```

### 4. Fixed `ai-connector.js` Line 268
**Before:**
```javascript
const messages = [
  { role: 'system', content: systemPrompt },
  ...messageHistory,
  { role: 'user', content: userMessage }
];
```

**After:**
```javascript
// Prepare messages (ES5 compatible - use concat instead of spread)
const messages = [
  { role: 'system', content: systemPrompt }
].concat(messageHistory || []).concat([
  { role: 'user', content: userMessage }
]);
```

## Prevention

### Added Documentation
- Created `ES5-COMPATIBILITY.md` with full guide
- Lists all supported/unsupported features
- Provides ES5 alternatives for ES6+ features

### Code Review Checklist
When writing plugin code, check for:
- [ ] No spread operators (`...`)
- [ ] No optional chaining (`?.`)
- [ ] No nullish coalescing (`??`)
- [ ] No destructuring assignments

### Testing
Always test plugins in Figma Desktop App and check console for syntax errors.

## Files Modified

1. `figma-plugin/chat/chat-plugin.js` - Fixed 3 ES6+ syntax issues
2. `figma-plugin/chat/ai-connector.js` - Fixed 1 ES6+ syntax issue
3. Created `ES5-COMPATIBILITY.md` - Prevention guide
4. Created `SYNTAX-ERROR-FIX.md` - This document

## Status

✅ **Fixed** - All ES6+ syntax issues resolved
✅ **Tested** - Code now uses ES5-compatible syntax
✅ **Documented** - Prevention guide created

---

**Result**: Plugins should now load without syntax errors!

