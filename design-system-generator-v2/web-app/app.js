// Design System Generator v2.0 - Web App Logic
// Handles image upload, Claude Vision API analysis, and JSON export

class DesignSystemGenerator {
  constructor() {
    this.imageData = null;
    this.imageUrl = null;
    this.analysisResult = null;
    this.currentTab = 'upload';

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSavedApiKey();
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // File upload
    const fileInput = document.getElementById('fileInput');
    const fileUploadWrapper = document.getElementById('fileUploadWrapper');

    fileUploadWrapper.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    // Drag and drop
    fileUploadWrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadWrapper.classList.add('dragover');
    });

    fileUploadWrapper.addEventListener('dragleave', () => {
      fileUploadWrapper.classList.remove('dragover');
    });

    fileUploadWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadWrapper.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processImage(file);
      }
    });

    // Image URL
    document.getElementById('imageUrl').addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        this.imageUrl = url;
        this.showImagePreview(url);
      }
    });

    // API Key save
    document.getElementById('apiKey').addEventListener('change', (e) => {
      localStorage.setItem('claudeApiKey', e.target.value);
    });

    // Analyze button
    document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeDesign());

    // Export buttons
    document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJson());
    document.getElementById('copyJsonBtn').addEventListener('click', () => this.copyToClipboard());
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Clear data
    this.imageData = null;
    this.imageUrl = null;
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.processImage(file);
    }
  }

  async processImage(file) {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showStatus('Please select a valid image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showStatus('Image size must be less than 5MB', 'error');
        return;
      }

      this.showStatus('Processing image...', 'info');

      // Convert to base64
      const base64 = await this.fileToBase64(file);

      // Remove data URL prefix for API
      this.imageData = base64.split(',')[1];

      // Show preview
      this.showImagePreview(base64);

      this.showStatus('Image loaded successfully! Ready to analyze.', 'success');
    } catch (error) {
      console.error('Error processing image:', error);
      this.showStatus('Failed to process image: ' + error.message, 'error');
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  showImagePreview(src) {
    const preview = document.getElementById('imagePreview');
    preview.src = src;
    preview.classList.add('show');
  }

  loadSavedApiKey() {
    const savedKey = localStorage.getItem('claudeApiKey');
    if (savedKey) {
      document.getElementById('apiKey').value = savedKey;
    }
  }

  async analyzeDesign() {
    try {
      // Validate inputs
      const apiKey = document.getElementById('apiKey').value.trim();
      const proxyUrl = document.getElementById('proxyUrl').value.trim();

      if (!apiKey) {
        this.showStatus('Please enter your Claude API key', 'error');
        return;
      }

      if (!proxyUrl) {
        this.showStatus('Please enter the proxy server URL', 'error');
        return;
      }

      // Check if image is loaded
      if (this.currentTab === 'upload' && !this.imageData) {
        this.showStatus('Please upload an image first', 'error');
        return;
      }

      if (this.currentTab === 'url' && !this.imageUrl) {
        this.showStatus('Please enter an image URL', 'error');
        return;
      }

      // Get analysis options
      const options = {
        extractColors: document.getElementById('extractColors').checked,
        extractTypography: document.getElementById('extractTypography').checked,
        extractSpacing: document.getElementById('extractSpacing').checked,
        extractButtons: document.getElementById('extractButtons').checked,
        extractGradients: document.getElementById('extractGradients').checked,
        appInsights: document.getElementById('appInsights').checked,
      };

      // Build prompt
      const prompt = this.buildPrompt(options);

      // Show loading state
      const analyzeBtn = document.getElementById('analyzeBtn');
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<div class="spinner"></div><span>Analyzing...</span>';

      this.showStatus('Analyzing design with Claude Vision AI...', 'info');

      // Call proxy API
      const response = await fetch(`${proxyUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          imageData: this.currentTab === 'upload' ? this.imageData : null,
          imageUrl: this.currentTab === 'url' ? this.imageUrl : null,
          prompt: prompt
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      const result = await response.json();

      // Extract text content from Claude response
      const aiResponse = result.content[0].text;

      // Parse AI response into structured data
      this.analysisResult = this.parseAIResponse(aiResponse, options);

      // Display results
      this.displayResults();

      this.showStatus('Analysis complete! ✨', 'success');

    } catch (error) {
      console.error('Analysis error:', error);
      this.showStatus('Analysis failed: ' + error.message, 'error');
    } finally {
      // Reset button
      const analyzeBtn = document.getElementById('analyzeBtn');
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<span>✨ Analyze Design</span>';
    }
  }

  buildPrompt(options) {
    let prompt = `You are a design system expert. Analyze this design screenshot and extract design tokens to create a comprehensive design system.

Please provide your response in valid JSON format with the following structure:

{
  "colors": {
    "primary": [],
    "secondary": [],
    "text": [],
    "background": [],
    "accent": []
  },
  "typography": {
    "fontFamilies": [],
    "fontSizes": [],
    "fontWeights": [],
    "lineHeights": []
  },
  "spacing": {
    "scale": []
  },
  "buttons": {
    "variants": []
  },
  "gradients": [],
  "applicationInsights": {
    "type": "",
    "primaryPurpose": "",
    "targetAudience": "",
    "designStyle": "",
    "keyFeatures": []
  }
}

Instructions:
`;

    if (options.extractColors) {
      prompt += `
- Extract ALL unique colors used in the design
- Classify colors by their purpose: primary (brand colors, CTAs), secondary (supporting colors), text (all text colors), background (page/section backgrounds), accent (highlights, borders)
- For each color provide: hex value, usage context, and semantic name
`;
    }

    if (options.extractTypography) {
      prompt += `
- Identify all font families used
- List all font sizes (in px) from smallest to largest
- Note font weights used (light, regular, medium, semibold, bold)
- Identify line heights/spacing patterns
`;
    }

    if (options.extractSpacing) {
      prompt += `
- Extract spacing values between elements (margins, padding, gaps)
- Create a spacing scale (e.g., 4px, 8px, 12px, 16px, 24px, 32px, etc.)
`;
    }

    if (options.extractButtons) {
      prompt += `
- Identify all button styles (primary, secondary, outline, ghost, etc.)
- For each button describe: background color, text color, border, padding, border radius, font size/weight
`;
    }

    if (options.extractGradients) {
      prompt += `
- Extract any gradient patterns used
- Provide gradient syntax (linear/radial, colors, direction)
`;
    }

    if (options.appInsights) {
      prompt += `
- Analyze the application type (e-commerce, SaaS, portfolio, blog, etc.)
- Identify primary purpose and target audience
- Describe the design style (modern, minimal, bold, playful, etc.)
- List key features visible in the design
`;
    }

    prompt += `
IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just pure JSON.`;

    return prompt;
  }

  parseAIResponse(aiResponse, options) {
    try {
      // Try to extract JSON from response (in case it's wrapped in markdown)
      let jsonStr = aiResponse.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      // Parse JSON
      const parsed = JSON.parse(jsonStr);

      // Add metadata
      parsed.metadata = {
        generatedAt: new Date().toISOString(),
        version: '2.0',
        generatorType: 'web-app',
        options: options
      };

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('Raw response:', aiResponse);

      // Return a structured error response
      return {
        error: 'Failed to parse AI response',
        rawResponse: aiResponse,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '2.0',
          generatorType: 'web-app',
          options: options
        }
      };
    }
  }

  displayResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsContent = document.getElementById('resultsContent');

    if (!this.analysisResult) {
      return;
    }

    let html = '';

    // Display error if parsing failed
    if (this.analysisResult.error) {
      html += `
        <div class="result-section">
          <div class="status-message error show">
            <span>⚠️</span>
            <span>Failed to parse AI response. Raw response saved in JSON.</span>
          </div>
        </div>
      `;
    }

    // Colors
    if (this.analysisResult.colors) {
      html += this.renderColors(this.analysisResult.colors);
    }

    // Typography
    if (this.analysisResult.typography) {
      html += this.renderTypography(this.analysisResult.typography);
    }

    // Spacing
    if (this.analysisResult.spacing) {
      html += this.renderSpacing(this.analysisResult.spacing);
    }

    // Buttons
    if (this.analysisResult.buttons) {
      html += this.renderButtons(this.analysisResult.buttons);
    }

    // Gradients
    if (this.analysisResult.gradients && this.analysisResult.gradients.length > 0) {
      html += this.renderGradients(this.analysisResult.gradients);
    }

    // Application Insights
    if (this.analysisResult.applicationInsights) {
      html += this.renderAppInsights(this.analysisResult.applicationInsights);
    }

    // JSON Preview
    html += `
      <div class="result-section">
        <h3>📄 JSON Output</h3>
        <div class="code-block">${this.syntaxHighlightJson(this.analysisResult)}</div>
      </div>
    `;

    resultsContent.innerHTML = html;
    resultsContainer.classList.add('show');

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderColors(colors) {
    let html = '<div class="result-section"><h3>🎨 Color Palette</h3>';

    const categories = ['primary', 'secondary', 'text', 'background', 'accent'];

    categories.forEach(category => {
      if (colors[category] && colors[category].length > 0) {
        html += `<h4 style="font-size: 14px; color: #64748b; margin: 20px 0 12px; text-transform: capitalize;">${category}</h4>`;
        html += '<div class="color-grid">';

        colors[category].forEach(color => {
          const colorValue = typeof color === 'string' ? color : (color.hex || color.value || '#000000');
          const colorName = typeof color === 'string' ? category : (color.name || color.usage || category);

          html += `
            <div class="color-item">
              <div class="color-swatch" style="background: ${colorValue}"></div>
              <div class="color-info">
                <div class="color-name">${colorName}</div>
                <div class="color-value">${colorValue}</div>
              </div>
            </div>
          `;
        });

        html += '</div>';
      }
    });

    html += '</div>';
    return html;
  }

  renderTypography(typography) {
    let html = '<div class="result-section"><h3>✍️ Typography</h3><div class="list-group">';

    if (typography.fontFamilies && typography.fontFamilies.length > 0) {
      html += `<div class="list-item"><strong>Font Families:</strong> ${typography.fontFamilies.join(', ')}</div>`;
    }

    if (typography.fontSizes && typography.fontSizes.length > 0) {
      html += `<div class="list-item"><strong>Font Sizes:</strong> ${typography.fontSizes.join(', ')}</div>`;
    }

    if (typography.fontWeights && typography.fontWeights.length > 0) {
      html += `<div class="list-item"><strong>Font Weights:</strong> ${typography.fontWeights.join(', ')}</div>`;
    }

    if (typography.lineHeights && typography.lineHeights.length > 0) {
      html += `<div class="list-item"><strong>Line Heights:</strong> ${typography.lineHeights.join(', ')}</div>`;
    }

    html += '</div></div>';
    return html;
  }

  renderSpacing(spacing) {
    let html = '<div class="result-section"><h3>📏 Spacing Scale</h3><div class="list-group">';

    if (spacing.scale && spacing.scale.length > 0) {
      html += `<div class="list-item">${spacing.scale.join(', ')}</div>`;
    } else {
      html += '<div class="list-item">No spacing patterns detected</div>';
    }

    html += '</div></div>';
    return html;
  }

  renderButtons(buttons) {
    let html = '<div class="result-section"><h3>🔘 Button Styles</h3><div class="list-group">';

    if (buttons.variants && buttons.variants.length > 0) {
      buttons.variants.forEach(variant => {
        const variantName = typeof variant === 'string' ? variant : (variant.name || variant.type || 'Button');
        const variantDesc = typeof variant === 'string' ? '' : (variant.description || variant.style || '');

        html += `
          <div class="list-item">
            <strong>${variantName}</strong>
            ${variantDesc ? `<div style="font-size: 13px; color: #64748b; margin-top: 4px;">${variantDesc}</div>` : ''}
          </div>
        `;
      });
    } else {
      html += '<div class="list-item">No button styles detected</div>';
    }

    html += '</div></div>';
    return html;
  }

  renderGradients(gradients) {
    let html = '<div class="result-section"><h3>🌈 Gradients</h3><div class="list-group">';

    gradients.forEach(gradient => {
      const gradientValue = typeof gradient === 'string' ? gradient : (gradient.css || gradient.value || '');
      const gradientName = typeof gradient === 'string' ? 'Gradient' : (gradient.name || 'Gradient');

      html += `
        <div class="list-item">
          <strong>${gradientName}</strong>
          <div style="height: 40px; border-radius: 6px; margin-top: 8px; background: ${gradientValue}"></div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-family: monospace;">${gradientValue}</div>
        </div>
      `;
    });

    html += '</div></div>';
    return html;
  }

  renderAppInsights(insights) {
    let html = '<div class="result-section"><h3>💡 Application Insights</h3><div class="list-group">';

    if (insights.type) {
      html += `<div class="list-item"><strong>Application Type:</strong> ${insights.type}</div>`;
    }

    if (insights.primaryPurpose) {
      html += `<div class="list-item"><strong>Primary Purpose:</strong> ${insights.primaryPurpose}</div>`;
    }

    if (insights.targetAudience) {
      html += `<div class="list-item"><strong>Target Audience:</strong> ${insights.targetAudience}</div>`;
    }

    if (insights.designStyle) {
      html += `<div class="list-item"><strong>Design Style:</strong> ${insights.designStyle}</div>`;
    }

    if (insights.keyFeatures && insights.keyFeatures.length > 0) {
      html += `<div class="list-item"><strong>Key Features:</strong><ul style="margin: 8px 0 0 20px;">`;
      insights.keyFeatures.forEach(feature => {
        html += `<li style="margin: 4px 0;">${feature}</li>`;
      });
      html += '</ul></div>';
    }

    html += '</div></div>';
    return html;
  }

  syntaxHighlightJson(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span style="color: #7dd3fc;">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span style="color: #86efac;">"$1"</span>')
      .replace(/: (\d+)/g, ': <span style="color: #fbbf24;">$1</span>')
      .replace(/: (true|false|null)/g, ': <span style="color: #f472b6;">$1</span>');
  }

  exportJson() {
    if (!this.analysisResult) {
      this.showStatus('No analysis results to export', 'error');
      return;
    }

    const json = JSON.stringify(this.analysisResult, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `design-system-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showStatus('JSON file downloaded successfully! 💾', 'success');
  }

  async copyToClipboard() {
    if (!this.analysisResult) {
      this.showStatus('No analysis results to copy', 'error');
      return;
    }

    try {
      const json = JSON.stringify(this.analysisResult, null, 2);
      await navigator.clipboard.writeText(json);
      this.showStatus('JSON copied to clipboard! 📋', 'success');
    } catch (error) {
      console.error('Copy failed:', error);
      this.showStatus('Failed to copy to clipboard', 'error');
    }
  }

  showStatus(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.className = `status-message ${type} show`;

    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };

    statusMessage.innerHTML = `
      <span>${icons[type]}</span>
      <span>${message}</span>
    `;

    // Auto-hide after 5 seconds for success/info messages
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        statusMessage.classList.remove('show');
      }, 5000);
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new DesignSystemGenerator();
});
