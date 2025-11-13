#!/usr/bin/env node
/**
 * Build Rule Cards from existing knowledge base
 * Converts YAML rules and existing JSON to Rule Card format
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';

interface RuleCard {
  id: string;
  title: string;
  layer: string;
  component?: string[];
  context: string[];
  decision: any;
  rationale: string;
  whenToUse?: string[];
  whenNotToUse?: string[];
  inputs?: string[];
  dependencies?: {
    tokens?: string[];
    components?: string[];
    patterns?: string[];
  };
  variants?: string[];
  accessibility?: string[];
  metrics?: string[];
  codeBinding?: {
    tokenNames?: string[];
    cssVars?: string[];
    props?: any;
    aria?: string[];
    events?: string[];
  };
  examples?: any[];
  status: string;
  owner?: string;
  lastUpdated: string;
}

interface FeatureTemplate {
  id: string;
  feature: string;
  intent: string;
  pmPrompt?: string;
  patterns: string[];
  rules: string[];
  businessRules?: string[];
  a11y?: string[];
  devHooks?: {
    dataAttributes?: string[];
    events?: string[];
    apiEndpoints?: string[];
  };
  metrics?: string[];
  edgeCases?: string[];
  outputs?: {
    design?: string[];
    code?: any;
  };
  status: string;
  lastUpdated: string;
}

async function buildRuleCards() {
  try {
    console.log('📚 Building Rule Cards from knowledge base...\n');

    const ruleCards: RuleCard[] = [];
    let ruleCounter = 1;

    // Load existing knowledge base
    const knowledgeBasePath = join(process.cwd(), 'docs/generated/design-system-knowledge.json');
    const knowledgeBase = JSON.parse(await readFile(knowledgeBasePath, 'utf8'));

    // Convert color rules to Rule Cards
    if (knowledgeBase.rules?.colors) {
      const colorCategories = knowledgeBase.rules.colors.categories || [];
      
      for (const category of colorCategories) {
        // Create rule for each color category
        const ruleId = `DS-Foundations-${String(ruleCounter).padStart(3, '0')}`;
        ruleCounter++;

        const ruleCard: RuleCard = {
          id: ruleId,
          title: `Use ${category.name} Colors for ${category.name} Context`,
          layer: 'Foundations',
          context: category.usage || [],
          decision: `Use tokens from the ${category.name} color category for: ${category.usage?.join(', ') || 'appropriate contexts'}`,
          rationale: category.description || `Colors in the ${category.name} category are designed for specific use cases`,
          whenToUse: category.usage || [],
          whenNotToUse: category.avoid || [],
          dependencies: {
            tokens: category.tokens || []
          },
          accessibility: knowledgeBase.rules?.colors?.accessibility ? [
            `Contrast ratios must meet ${knowledgeBase.rules.colors.accessibility.contrast_requirements?.aa || 4.5}:1 for AA compliance`
          ] : [],
          codeBinding: {
            tokenNames: category.tokens || []
          },
          status: 'stable',
          lastUpdated: new Date().toISOString()
        };

        ruleCards.push(ruleCard);
      }

      // Add contrast rule
      if (knowledgeBase.rules?.colors?.accessibility) {
        const contrastRule: RuleCard = {
          id: `DS-Foundations-${String(ruleCounter).padStart(3, '0')}`,
          title: 'Contrast Minimums',
          layer: 'Foundations',
          context: ['text', 'interactive-elements', 'ui-graphics'],
          decision: {
            if: [
              { type: 'text-primary', minRatio: knowledgeBase.rules.colors.accessibility.minimum_ratios?.text_primary || 4.5 },
              { type: 'text-secondary', minRatio: knowledgeBase.rules.colors.accessibility.minimum_ratios?.text_secondary || 3 },
              { type: 'interactive', minRatio: knowledgeBase.rules.colors.accessibility.minimum_ratios?.interactive_elements || 4.5 },
              { type: 'large-text', minRatio: knowledgeBase.rules.colors.accessibility.minimum_ratios?.large_text || 3 }
            ]
          },
          rationale: 'Ensures text and interactive elements are readable and accessible to all users',
          whenToUse: ['All text content', 'All interactive elements', 'UI icons and graphics'],
          accessibility: [
            'AA compliance: 4.5:1 for body text',
            'AAA compliance: 7:1 for body text',
            '3:1 for large text (≥24px or 18px bold)',
            '3:1 for non-text UI elements'
          ],
          status: 'stable',
          lastUpdated: new Date().toISOString()
        };
        ruleCards.push(contrastRule);
        ruleCounter++;
      }
    }

    // Add common pattern rules
    const patternRules: RuleCard[] = [
      {
        id: 'DS-Pattern-010',
        title: 'Dropdown vs Radio vs Pills',
        layer: 'Pattern',
        context: ['single-select', 'option-count'],
        decision: {
          if: [
            { optionCount: '>6', use: 'Dropdown' },
            { optionCount: '<=4', comparison: true, use: 'Radio' },
            { optionCount: '<=5', frequentToggle: true, use: 'Pills' }
          ]
        },
        rationale: 'Balance visibility, space, and cognitive load. Dropdowns save space for many options, radio shows all options for comparison, pills keep state visible for frequent toggles',
        whenToUse: [
          'Dropdown: >6 options or uneven labels',
          'Radio: ≤4 mutually exclusive options when comparison matters',
          'Pills: ≤5 frequent toggles where state must remain visible'
        ],
        whenNotToUse: [
          'Dropdown: When all options need to be visible',
          'Radio: When space is constrained',
          'Pills: When options change frequently'
        ],
        inputs: ['optionCount', 'comparison', 'frequentToggle'],
        dependencies: {
          components: ['Dropdown', 'Radio', 'Pills']
        },
        accessibility: ['Keyboard navigation', 'Screen reader announcements', 'Focus management'],
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'DS-Layout-001',
        title: 'Center Standalone Loader',
        layer: 'Layout',
        component: ['Loading Bar', 'Spinner'],
        context: ['full-page', 'empty-container'],
        decision: 'Center horizontally & vertically; max-width 320px or 60% of container',
        rationale: 'Avoids "half-built page" perception; improves perceived stability',
        whenToUse: ['Loader is the only element in a full-page container'],
        whenNotToUse: ['When prior content is already visible above the fold'],
        inputs: ['viewport', 'container-size'],
        dependencies: {
          components: ['Spinner', 'Loading Bar']
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'DS-Layout-002',
        title: 'Stack Loader Below Existing Content',
        layer: 'Layout',
        component: ['Loading Bar', 'Spinner'],
        context: ['partial-content', 'async-loading'],
        decision: 'Place loader directly below loaded section using parent auto-layout; reserve space with skeleton where possible',
        rationale: 'Preserves continuity; reduces layout shift',
        whenToUse: ['Page has partially loaded content'],
        inputs: ['content-state', 'loading-state'],
        dependencies: {
          components: ['Spinner', 'Skeleton']
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'DS-Found-022',
        title: 'Focus Visibility Always On',
        layer: 'Foundations',
        context: ['all-interactive-elements'],
        decision: 'Do not remove outlines; provide high-contrast focus rings with 2px outer ring using focus-visible',
        rationale: 'Essential for keyboard navigation and accessibility compliance',
        whenToUse: ['All interactive elements'],
        accessibility: ['Visible focus indicators', '2px outer ring', 'High contrast'],
        codeBinding: {
          cssVars: ['--focus-ring-width', '--focus-ring-color'],
          aria: ['aria-visible']
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'DS-Found-023',
        title: 'Motion Safety',
        layer: 'Foundations',
        context: ['animations', 'transitions'],
        decision: 'Respect prefers-reduced-motion; switch to cross-fade or instant for critical paths',
        rationale: 'Prevents motion sickness and respects user preferences',
        whenToUse: ['All animations and transitions'],
        accessibility: ['prefers-reduced-motion media query'],
        codeBinding: {
          cssVars: ['--motion-duration', '--motion-easing']
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'DS-Found-024',
        title: 'Spacing Rhythm',
        layer: 'Foundations',
        context: ['all-components', 'layout'],
        decision: 'Use an 8-pt (or 4-pt) scale; components snap to tokens; allow breakpoint-based "step jumps" to fit tighter screens',
        rationale: 'Creates visual rhythm and consistency across the design system',
        whenToUse: ['All component spacing', 'Layout spacing'],
        inputs: ['viewport', 'density'],
        dependencies: {
          tokens: ['space.*']
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'DS-Content-030',
        title: 'Error Messaging',
        layer: 'Content',
        context: ['form-validation', 'error-states'],
        decision: 'Error copy = what happened + why it matters + next action; place inline near source with page-level summary if multiple',
        rationale: 'Helps users understand and fix errors quickly',
        whenToUse: ['Form validation', 'Error states'],
        whenNotToUse: ['Success messages', 'Informational messages'],
        dependencies: {
          components: ['Alert', 'Input Field']
        },
        accessibility: ['aria-live="polite"', 'aria-invalid', 'aria-describedby'],
        codeBinding: {
          aria: ['aria-live', 'aria-invalid', 'aria-describedby']
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      }
    ];

    ruleCards.push(...patternRules);

    // Save Rule Cards
    const ruleCardsPath = join(process.cwd(), 'docs/generated/rule-cards.json');
    await writeFile(ruleCardsPath, JSON.stringify({
      metadata: {
        version: '1.0',
        last_updated: new Date().toISOString(),
        total_rules: ruleCards.length,
        layers: [...new Set(ruleCards.map(r => r.layer))]
      },
      ruleCards: ruleCards
    }, null, 2));

    console.log(`✅ Created ${ruleCards.length} Rule Cards`);
    console.log(`   Saved to: ${ruleCardsPath}\n`);

    return ruleCards;
  } catch (error) {
    console.error('❌ Error building Rule Cards:', error);
    throw error;
  }
}

async function buildFeatureTemplates() {
  try {
    console.log('📋 Building Feature Templates...\n');

    const templates: FeatureTemplate[] = [
      {
        id: 'FT-001',
        feature: 'Collect Feedback',
        intent: 'Capture sentiment + details after content',
        pmPrompt: 'Let users give quick feedback after an article',
        patterns: ['IconButtons', 'InlineForm', 'Chips', 'Toast'],
        rules: ['DS-Layout-001', 'DS-Content-030', 'DS-Pattern-010'],
        businessRules: [
          'Binary first then optional detail',
          'Auto-expand inline on click',
          'Limit 200 chars; empathetic copy for negatives'
        ],
        a11y: ['group label', 'aria-live="polite"'],
        devHooks: {
          dataAttributes: ['data-feedback'],
          events: ['feedback_click', 'feedback_submit']
        },
        metrics: ['CTR thumbs', 'submitRate', '% negative with detail'],
        edgeCases: ['offline cache & retry', 'repeated submissions lockout', 'slow API shows inline spinner'],
        outputs: {
          design: ['Button (Icon)', 'Input (Multiline)', 'Chip', 'Toast'],
          code: { variant: 'subtle', maxLength: 200 }
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'FT-002',
        feature: 'Delete Confirmation',
        intent: 'Prevent irreversible loss with safe undo',
        pmPrompt: 'Confirm before deleting a project',
        patterns: ['Modal', 'Toast'],
        rules: ['DS-Found-022', 'DS-Content-030'],
        businessRules: [
          'Require typing project name for critical objects',
          'Else checkbox "I understand"',
          'Disable confirm until valid'
        ],
        a11y: ['focus trap in modal', 'aria-describedby with consequence text'],
        devHooks: {
          dataAttributes: ['data-risk'],
          events: ['delete_confirmed']
        },
        metrics: ['abort rate vs accidental deletions'],
        edgeCases: ['dependency conflicts show list with links to resolve'],
        outputs: {
          design: ['Modal (Destructive)', 'Toast (Undo)'],
          code: { risk: 'high|low' }
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'FT-003',
        feature: 'Profile Avatar Upload',
        intent: 'Let users update their profile photo',
        pmPrompt: 'Let users update their profile photo',
        patterns: ['Upload Button', 'Cropper', 'Progress', 'Toast'],
        rules: ['DS-Layout-002'],
        businessRules: [
          'Max 5MB',
          'Accept JPG/PNG/WEBP',
          'Auto center face if detectable',
          'Enforce min 256×256'
        ],
        a11y: ['keyboard crop handles', 'descriptive errors'],
        devHooks: {
          events: ['onProgress'],
          apiEndpoints: ['/upload/avatar']
        },
        edgeCases: ['network drop → resumable upload', 'EXIF orientation fix'],
        outputs: {
          design: ['Button (Upload)', 'Image (Cropper)', 'Progress Bar', 'Toast'],
          code: { maxSize: '5MB', formats: ['jpg', 'png', 'webp'] }
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'FT-004',
        feature: 'Login with Social + Passwordless',
        intent: 'Make login simple with email link or Google',
        pmPrompt: 'Make login simple with email link or Google',
        patterns: ['Full-page Auth', 'Social Buttons', 'Email Magic Link', 'Inline Error'],
        rules: ['DS-Found-022', 'DS-Content-030'],
        businessRules: [
          'Prefer passwordless if enabled',
          'Rate-limit requests'
        ],
        a11y: ['announce errors with aria-live'],
        devHooks: {
          dataAttributes: ['data-provider'],
          events: ['login_success', 'login_error']
        },
        edgeCases: ['expired magic link → show resend'],
        outputs: {
          design: ['Button (Social)', 'Input (Email)', 'Alert (Error)'],
          code: { provider: 'google|email_link' }
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'FT-005',
        feature: 'Table Filter & Sort',
        intent: 'Add filters and sorting to data table',
        pmPrompt: 'Add filters and sorting to jobs table',
        patterns: ['Side Sheet Filter', 'Sort Dropdown', 'Selected Filter Chips', 'Clear All'],
        rules: ['DS-Pattern-010'],
        businessRules: [
          'Auto-apply on change for lightweight filters',
          'Otherwise Apply button',
          'Persist via query string'
        ],
        a11y: ['checkbox/radio groups labeled', 'focus returns to table header'],
        devHooks: {
          dataAttributes: ['data-filter', 'data-sort'],
          events: ['filter_change', 'sort_change']
        },
        edgeCases: ['no results → empty state with Reset CTA'],
        outputs: {
          design: ['Side Sheet', 'Dropdown', 'Chip', 'Button'],
          code: { queryString: true }
        },
        status: 'stable',
        lastUpdated: new Date().toISOString()
      }
    ];

    // Save Feature Templates
    const templatesPath = join(process.cwd(), 'docs/generated/feature-templates.json');
    await writeFile(templatesPath, JSON.stringify({
      metadata: {
        version: '1.0',
        last_updated: new Date().toISOString(),
        total_templates: templates.length
      },
      templates: templates
    }, null, 2));

    console.log(`✅ Created ${templates.length} Feature Templates`);
    console.log(`   Saved to: ${templatesPath}\n`);

    return templates;
  } catch (error) {
    console.error('❌ Error building Feature Templates:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const ruleCards = await buildRuleCards();
    const templates = await buildFeatureTemplates();
    
    console.log('🎉 Rule Card system built successfully!');
    console.log(`   - ${ruleCards.length} Rule Cards`);
    console.log(`   - ${templates.length} Feature Templates\n`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main();

