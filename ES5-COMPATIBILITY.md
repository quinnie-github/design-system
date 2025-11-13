# ES5 Compatibility Guide for Figma Plugins

## Problem

Figma plugins run in a restricted JavaScript environment that **does not support all ES6+ features**. Using unsupported syntax causes syntax errors like:

```
Syntax error on line 207: Unexpected token ...rule
```

## ✅ Supported Features

- `const` and `let` (ES6)
- Arrow functions `() => {}` (ES6)
- Template literals `` `string ${var}` `` (ES6)
- `for...of` loops (ES6)
- `Array.map()`, `Array.filter()`, `Array.find()` (ES5+)

## ❌ NOT Supported Features

### 1. Spread Operator
```javascript
// ❌ DON'T USE
const obj = { ...otherObj, newProp: 'value' };
const arr = [...arr1, ...arr2];

// ✅ USE INSTEAD
const obj = Object.assign({}, otherObj, { newProp: 'value' });
const arr = arr1.concat(arr2);
```

### 2. Optional Chaining
```javascript
// ❌ DON'T USE
const value = obj?.prop?.nested;

// ✅ USE INSTEAD
const value = (obj && obj.prop && obj.prop.nested) || null;
```

### 3. Nullish Coalescing
```javascript
// ❌ DON'T USE
const value = obj.prop ?? 'default';

// ✅ USE INSTEAD
const value = (obj.prop !== null && obj.prop !== undefined) ? obj.prop : 'default';
```

### 4. Destructuring Assignment
```javascript
// ❌ DON'T USE
const { prop1, prop2 } = obj;
const [first, second] = arr;

// ✅ USE INSTEAD
const prop1 = obj.prop1;
const prop2 = obj.prop2;
const first = arr[0];
const second = arr[1];
```

## 🔧 Fixes Applied

### Fixed in `chat-plugin.js`:

1. **Line 207**: Spread operator in object
   ```javascript
   // Before: { ...rule, id: ... }
   // After: Object.assign({}, rule, { id: ... })
   ```

2. **Line 243**: Spread operator in array
   ```javascript
   // Before: [...this.ruleCards, ...this.customRules]
   // After: this.ruleCards.concat(this.customRules)
   ```

3. **Line 227-228**: Optional chaining
   ```javascript
   // Before: matchedTemplate?.template
   // After: (matchedTemplate && matchedTemplate.template) || null
   ```

## 🛡️ Prevention

### Before Writing Plugin Code:

1. **Check for ES6+ features**:
   - Spread operator `...`
   - Optional chaining `?.`
   - Nullish coalescing `??`
   - Destructuring `{ }` or `[ ]`

2. **Use ES5 alternatives**:
   - `Object.assign()` for object spread
   - `Array.concat()` for array spread
   - `&&` checks for optional chaining
   - Direct property access for destructuring

3. **Test in Figma**:
   - Always test plugins in Figma Desktop App
   - Check console for syntax errors
   - Fix errors immediately

## 📝 Code Review Checklist

When reviewing plugin code, check for:

- [ ] No spread operators (`...`)
- [ ] No optional chaining (`?.`)
- [ ] No nullish coalescing (`??`)
- [ ] No destructuring assignments
- [ ] All ES6+ features are supported by Figma

## 🔍 How to Find Issues

### Search for problematic patterns:
```bash
# Find spread operators
grep -r "\.\.\." figma-plugin/

# Find optional chaining
grep -r "\?\\." figma-plugin/

# Find destructuring
grep -r "const\s*{" figma-plugin/
grep -r "const\s*\[" figma-plugin/
```

## ✅ Best Practices

1. **Use ES5-compatible code** in plugin files
2. **Test immediately** after writing code
3. **Check console** for syntax errors
4. **Use linters** that flag ES6+ features
5. **Document** any ES6+ features used (and why they're safe)

---

**Remember**: Figma plugins have limited ES6 support. When in doubt, use ES5 syntax!

