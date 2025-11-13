var mockData = `**BUTTONS:**

Hero CTA Button:`;

console.log('String content:');
console.log(mockData);
console.log('\nString length:', mockData.length);
console.log('First 20 chars as array:', Array.from(mockData.substring(0, 20)).map((c, i) => i + ': ' + c + ' (' + c.charCodeAt(0) + ')'));

console.log('\n=== Testing Basic Patterns ===\n');

// Most basic test
console.log('1. Does string contain **BUTTONS:**?');
console.log('   indexOf:', mockData.indexOf('**BUTTONS:**'));
console.log('   includes:', mockData.includes('**BUTTONS:**'));

// Test literal match
console.log('\n2. Literal match /\\*\\*BUTTONS\\*\\*:/');
var test1 = mockData.match(/\*\*BUTTONS\*\*:/);
console.log('   Match found:', test1 !== null);
console.log('   Match:', test1);

// Test with capture group
console.log('\n3. With capture group /\\*\\*BUTTONS\\*\\*:(.+)/');
var test2 = mockData.match(/\*\*BUTTONS\*\*:(.+)/);
console.log('   Match found:', test2 !== null);
console.log('   Match:', test2);

// Test with [\\s\\S]*
console.log('\n4. With [\\s\\S]* /\\*\\*BUTTONS\\*\\*:([\\s\\S]*)/');
var test3 = mockData.match(/\*\*BUTTONS\*\*:([\s\S]*)/);
console.log('   Match found:', test3 !== null);
if (test3) {
  console.log('   Captured:', test3[1]);
}
