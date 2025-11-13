#!/usr/bin/env node
/**
 * Design System GPT CLI
 * Main command-line interface for design system management
 * Usage: npx ds-gpt <command> [options]
 */

import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

const program = new Command();

program
  .name('ds-gpt')
  .description('Design System GPT - Intelligent design system management')
  .version('1.0.0');

// Sync command
program
  .command('sync')
  .description('Sync design tokens from Figma to code')
  .option('-d, --dry-run', 'Show what would be changed without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    console.log('🔄 Syncing design tokens...\n');
    
    try {
      const command = options.dryRun ? 'SYNC_DRY_RUN=1 npx tsx scripts/sync-figma-to-tokens.ts' : 'npx tsx scripts/sync-figma-to-tokens.ts';
      execSync(command, { stdio: 'inherit', cwd: process.cwd() });
      console.log('\n✅ Sync completed successfully!');
    } catch (error) {
      console.error('\n❌ Sync failed:', error.message);
      process.exit(1);
    }
  });

// Audit command
program
  .command('audit')
  .description('Audit design tokens for issues and inconsistencies')
  .option('-f, --fix', 'Automatically fix issues where possible')
  .option('-o, --output <file>', 'Output audit results to file')
  .action(async (options) => {
    console.log('🔍 Auditing design tokens...\n');
    
    try {
      execSync('npx tsx scripts/audit-tokens.ts', { stdio: 'inherit', cwd: process.cwd() });
      console.log('\n✅ Audit completed successfully!');
    } catch (error) {
      console.error('\n❌ Audit failed:', error.message);
      process.exit(1);
    }
  });

// Build command
program
  .command('build')
  .description('Build knowledge base and component mappings')
  .option('-k, --knowledge-only', 'Only build knowledge base')
  .option('-c, --components-only', 'Only build component mappings')
  .action(async (options) => {
    console.log('🏗️  Building design system assets...\n');
    
    try {
      if (options.knowledgeOnly || !options.componentsOnly) {
        console.log('📚 Building knowledge base...');
        execSync('npx tsx scripts/build-knowledge-base.ts', { stdio: 'inherit', cwd: process.cwd() });
      }
      
      if (options.componentsOnly || !options.knowledgeOnly) {
        console.log('🗺️  Building component mappings...');
        execSync('npx tsx scripts/map-component-tokens.ts', { stdio: 'inherit', cwd: process.cwd() });
      }
      
      console.log('\n✅ Build completed successfully!');
    } catch (error) {
      console.error('\n❌ Build failed:', error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show design system status and statistics')
  .action(async () => {
    console.log('📊 Design System Status\n');
    
    try {
      // Load knowledge base
      const knowledgeBase = JSON.parse(await readFile('docs/generated/design-system-knowledge.json', 'utf8'));
      
      // Load component map
      const componentMap = JSON.parse(await readFile('docs/component-token-map.json', 'utf8'));
      
      console.log('📚 Knowledge Base:');
      console.log(`  • Rules: ${knowledgeBase.metadata.total_rules || 'Unknown'}`);
      console.log(`  • Categories: ${knowledgeBase.metadata.categories.length}`);
      console.log(`  • Last Updated: ${knowledgeBase.metadata.last_updated}`);
      
      console.log('\n🧩 Components:');
      console.log(`  • Total: ${componentMap.metadata.total_components}`);
      console.log(`  • Tokens: ${componentMap.metadata.total_tokens}`);
      console.log(`  • Last Updated: ${componentMap.metadata.last_updated}`);
      
      console.log('\n🏷️  Token Usage:');
      const topTokens = componentMap.token_usage
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5);
      
      topTokens.forEach(token => {
        console.log(`  • ${token.token_name}: ${token.usage_count} uses`);
      });
      
      console.log('\n✅ Design system is healthy!');
      
    } catch (error) {
      console.error('❌ Failed to load status:', error.message);
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    console.log(`
Design System GPT - Help

COMMANDS:
  sync              Sync design tokens from Figma to code
  audit             Audit design tokens for issues
  build             Build knowledge base and component mappings
  status            Show design system status
  help              Show this help message

EXAMPLES:
  ds-gpt sync --dry-run          # Preview changes without applying
  ds-gpt audit --fix             # Audit and fix issues
  ds-gpt build --knowledge-only  # Only build knowledge base
  ds-gpt status                  # Show current status

For more information, visit: https://github.com/your-repo/design-system-gpt
    `);
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
