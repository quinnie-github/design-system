var mockData = `**BUTTONS:**

Hero CTA Button:`;

console.log('String breakdown:');
for (let i = 0; i < 15; i++) {
  console.log(`Position ${i}: '${mockData[i]}' (char code: ${mockData.charCodeAt(i)})`);
}

console.log('\n=== The format is actually **BUTTONS:** (asterisks, word, colon, asterisks) ===\n');

// WRONG regex - expects **BUTTONS**:
console.log('1. WRONG: /\\*\\*BUTTONS\\*\\*:/');
var wrong = mockData.match(/\*\*BUTTONS\*\*:/);
console.log('   Match:', wrong);

// CORRECT regex - matches **BUTTONS:**
console.log('\n2. CORRECT: /\\*\\*BUTTONS:\\*\\*/');
var correct = mockData.match(/\*\*BUTTONS:\*\*/);
console.log('   Match:', correct);

// With capture group
console.log('\n3. WITH CAPTURE: /\\*\\*BUTTONS:\\*\\*([\\s\\S]*)/');
var capture = mockData.match(/\*\*BUTTONS:\*\*([\s\S]*)/);
console.log('   Match found:', capture !== null);
if (capture) {
  console.log('   Captured content:', capture[1]);
}
