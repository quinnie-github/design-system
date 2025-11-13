var mockData = `**BUTTONS:**

Hero CTA Button:
- Location: Center of hero section
- Background: #000000 (solid black)
- Text color: #ffffff (white)
- Corner radius: 24px (pill-shaped)

**BRAND COLORS:**

- #4ecdc4 - BRAND - 65% coverage`;

console.log('=== Testing Different Regex Patterns ===\n');

// Original pattern
console.log('1. Original pattern:');
var test1 = mockData.match(/\*\*(?:ALL )?BUTTONS?(?:\/CTAs?)?\*\*:?([\s\S]*?)(?:\*\*[A-Z]|$)/i);
console.log('   Match found:', test1 !== null);

// Simplified pattern
console.log('\n2. Simplified pattern (just **):');
var test2 = mockData.match(/\*\*BUTTONS\*\*:?([\s\S]*?)(?:\*\*|$)/);
console.log('   Match found:', test2 !== null);
if (test2) {
  console.log('   Content length:', test2[1].length);
  console.log('   First 100 chars:', test2[1].substring(0, 100));
}

// Even simpler
console.log('\n3. Match everything after **BUTTONS:**:');
var test3 = mockData.match(/\*\*BUTTONS\*\*:([\s\S]+)/);
console.log('   Match found:', test3 !== null);
if (test3) {
  console.log('   Content length:', test3[1].length);
  console.log('   First 100 chars:', test3[1].substring(0, 100));
}

// Check what's between sections
console.log('\n4. Testing lookahead for next section:');
var hasNextSection = mockData.match(/\*\*BUTTONS\*\*:[\s\S]*?\n\n\*\*BRAND/);
console.log('   Can find next section:', hasNextSection !== null);
