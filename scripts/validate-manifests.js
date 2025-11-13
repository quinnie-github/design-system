#!/usr/bin/env node
/**
 * Validate that all plugin manifests are correctly named
 * This prevents the "Manifest must be named 'manifest.json'" error
 */

const { readdir, stat } = require('node:fs/promises');
const { join } = require('node:path');

const PLUGIN_DIR = join(process.cwd(), 'figma-plugin');

async function validateManifests() {
  console.log('🔍 Validating plugin manifests...\n');
  
  const errors = [];
  const warnings = [];
  
  try {
    // Check root plugin directory
    const rootFiles = await readdir(PLUGIN_DIR);
    
    // Find all manifest files
    for (const file of rootFiles) {
      const filePath = join(PLUGIN_DIR, file);
      const stats = await stat(filePath);
      
      if (stats.isFile() && file.includes('manifest') && file !== 'manifest.json') {
        if (file.endsWith('.json')) {
          errors.push({
            file: file,
            path: filePath,
            issue: `Manifest file must be named 'manifest.json' and be in its own plugin folder`,
            fix: `Move to a plugin subfolder (e.g., figma-plugin/plugin-name/manifest.json)`
          });
        }
      }
      
      // Check subdirectories
      if (stats.isDirectory() && !file.startsWith('.')) {
        const subDir = join(PLUGIN_DIR, file);
        const subFiles = await readdir(subDir);
        
        // Check if this is a plugin directory
        const hasManifest = subFiles.includes('manifest.json');
        const hasPluginJs = subFiles.some(f => f.includes('plugin.js') || f.includes('-plugin.js'));
        
        if (hasPluginJs && !hasManifest) {
          errors.push({
            file: file,
            path: subDir,
            issue: `Plugin directory '${file}' is missing manifest.json`,
            fix: `Create manifest.json in ${subDir}`
          });
        }
        
        // Check for incorrectly named manifests in subdirectories
        for (const subFile of subFiles) {
          if (subFile.includes('manifest') && subFile !== 'manifest.json' && subFile.endsWith('.json')) {
            warnings.push({
              file: subFile,
              path: join(subDir, subFile),
              issue: `Found manifest file with incorrect name: ${subFile}`,
              fix: `Rename to manifest.json or remove if it's a backup`
            });
          }
        }
      }
    }
    
    // Report results
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All manifests are correctly named!\n');
      return { success: true };
    }
    
    if (errors.length > 0) {
      console.error('❌ Errors found:\n');
      errors.forEach((error, i) => {
        console.error(`${i + 1}. ${error.file}`);
        console.error(`   Path: ${error.path}`);
        console.error(`   Issue: ${error.issue}`);
        console.error(`   Fix: ${error.fix}\n`);
      });
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Warnings:\n');
      warnings.forEach((warning, i) => {
        console.warn(`${i + 1}. ${warning.file}`);
        console.warn(`   Path: ${warning.path}`);
        console.warn(`   Issue: ${warning.issue}`);
        console.warn(`   Fix: ${warning.fix}\n`);
      });
    }
    
    return { 
      success: errors.length === 0, 
      errors: errors.length,
      warnings: warnings.length 
    };
    
  } catch (error) {
    console.error('❌ Error validating manifests:', error);
    return { success: false, error: error.message };
  }
}

// Run validation
validateManifests().then(result => {
  if (!result.success) {
    process.exit(1);
  }
});

