# Design System GPT - Troubleshooting Guide

## Common Issues and Solutions

### 1. Manifest Error: Invalid value for allowedDomains

**Error:** `Manifest error: Invalid value for allowedDomains. 'api.openai.com' must include a scheme, such as https://.`

**Solution:** 
- Use the test manifest first: `figma-plugin/test-manifest.json`
- This version has no network access and should work without errors
- Once basic functionality is confirmed, you can add network access back

### 2. CORS Policy Errors

**Error:** `Access to image at 'https://www.gravatar.com/...' has been blocked by CORS policy`

**Solution:**
- These are Figma's internal errors, not related to our plugin
- They don't affect plugin functionality
- Can be safely ignored

### 3. Permissions Policy Violations

**Error:** `[Violation] Potential permissions policy violation: camera/microphone/clipboard-write/display-capture is not allowed`

**Solution:**
- These are browser security warnings, not plugin errors
- They don't affect plugin functionality
- Can be safely ignored

### 4. ARIA Accessibility Warning

**Error:** `Blocked aria-hidden on an element because its descendant retained focus`

**Solution:**
- Fixed in the latest version of `chat-ui.html`
- The input field now has proper focus handling

## Testing Steps

### Step 1: Test Basic Plugin Functionality

1. Open Figma
2. Go to Plugins → Development → Import plugin from manifest
3. Select `figma-plugin/test-manifest.json`
4. Run the "Design System GPT - Test" plugin
5. Click "Test Connection" - should show success
6. Click "Create Test Component" - should create a blue rectangle

### Step 2: Test Full Plugin (if Step 1 works)

1. Import `figma-plugin/chat/manifest.json` instead
2. Run the "Design System GPT" plugin
3. Try the chat interface

### Step 3: Test CLI Commands

```bash
# Test basic functionality
npm run ds-gpt status

# Test token sync (dry run)
npm run ds-gpt sync --dry-run

# Test audit
npm run ds-gpt audit

# Test build
npm run ds-gpt build
```

## Debug Mode

### Enable Verbose Logging

```bash
# Run sync with verbose output
npm run sync --verbose

# Run audit with detailed output
npm run audit --verbose
```

### Check Generated Files

```bash
# Check if knowledge base was built
ls -la docs/generated/

# Check if component map was created
ls -la docs/component-token-map.json

# Check if tokens were generated
ls -la src/styles/
```

## Common Fixes

### 1. Plugin Not Loading

- Check that manifest.json is valid JSON
- Ensure all referenced files exist
- Try the test manifest first

### 2. Sync Script Failing

- Check that Figma is open with a file active
- Verify the collection name in `figma-sync.config.json`
- Try dry run first: `SYNC_DRY_RUN=1 npm run sync`

### 3. Knowledge Base Build Failing

- Check that all YAML files are valid
- Ensure js-yaml is installed: `npm install js-yaml`
- Check file permissions

### 4. CLI Commands Not Working

- Ensure tsx is installed: `npm install tsx`
- Check that all dependencies are installed: `npm install`
- Try running scripts directly: `npx tsx scripts/sync-figma-to-tokens.ts`

## Getting Help

### Check Logs

1. **Figma Console:** Open browser dev tools in Figma
2. **CLI Logs:** Check terminal output for error messages
3. **Generated Files:** Check if expected files were created

### File Structure Check

```bash
# Verify all required files exist
ls -la figma-plugin/
ls -la scripts/
ls -la docs/rules/
ls -la cli/
```

### Dependencies Check

```bash
# Check if all dependencies are installed
npm list

# Reinstall if needed
rm -rf node_modules package-lock.json
npm install
```

## Performance Issues

### Large Figma Files

- Use `--dry-run` flag to preview changes
- Consider breaking large files into smaller collections
- Use incremental sync for large token sets

### Slow Knowledge Base Build

- Check YAML file sizes
- Consider splitting large rule files
- Use `--knowledge-only` flag for faster builds

## Still Having Issues?

1. Check the [GitHub Issues](https://github.com/your-username/design-system-gpt/issues)
2. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - System information
   - Generated files (if any)

## Quick Fixes

### Reset Everything

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild everything
npm run build

# Test
npm run ds-gpt status
```

### Use Test Mode

```bash
# Use test manifest for basic functionality
# Import: figma-plugin/test-manifest.json
# This avoids network access issues
```





