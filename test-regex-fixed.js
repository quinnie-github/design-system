var mockData = `**BUTTONS:**

Hero CTA Button:
- Background: #000000 (solid black)
- Text color: #ffffff (white)
- Corner radius: 24px

**BRAND COLORS:**

- #4ecdc4 - BRAND - 65% coverage

**FUNCTIONAL COLORS:**

- #000000 - FUNCTIONAL - 3% coverage

**BRAND ATMOSPHERE:**

Emotions: Natural, scientific`;

console.log('=== Testing Fixed Regex Patterns ===\n');

// Test BUTTONS
console.log('1. BUTTONS section:');
var buttonsMatch = mockData.match(/\*\*(?:ALL )?BUTTONS?(?:\/CTAs?)?:\*\*([\s\S]*?)(?=\*\*[A-Z]|\*\*$|$)/i);
console.log('   Found:', !!buttonsMatch);
if (buttonsMatch) {
  console.log('   Length:', buttonsMatch[1].length);
  console.log('   Contains "Hero CTA Button":', buttonsMatch[1].includes('Hero CTA Button'));
  console.log('   Contains "#000000":', buttonsMatch[1].includes('#000000'));
}

// Test BRAND COLORS
console.log('\n2. BRAND COLORS section:');
var brandMatch = mockData.match(/\*\*BRAND COLORS?:\*\*([\s\S]*?)(?=\*\*(?:FUNCTIONAL|BACKGROUND|TEXT)|$)/i);
console.log('   Found:', !!brandMatch);
if (brandMatch) {
  console.log('   Contains "#4ecdc4":', brandMatch[1].includes('#4ecdc4'));
}

// Test FUNCTIONAL COLORS
console.log('\n3. FUNCTIONAL COLORS section:');
var funcMatch = mockData.match(/\*\*FUNCTIONAL COLORS?:\*\*([\s\S]*?)(?=\*\*(?:BACKGROUND|TEXT|BRAND)|$)/i);
console.log('   Found:', !!funcMatch);
if (funcMatch) {
  console.log('   Contains "#000000":', funcMatch[1].includes('#000000'));
}

// Test BRAND ATMOSPHERE
console.log('\n4. BRAND ATMOSPHERE section:');
var atmoMatch = mockData.match(/\*\*BRAND ATMOSPHERE:\*\*([\s\S]*?)(?=\*\*[A-Z]|$)/i);
console.log('   Found:', !!atmoMatch);
if (atmoMatch) {
  console.log('   Contains "Natural":', atmoMatch[1].includes('Natural'));
}

console.log('\n✅ All patterns should show "Found: true"!');
