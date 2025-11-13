var mockData = `**BUTTONS:**

Hero CTA Button:
- Location: Center of hero section
- Background: #000000 (solid black)
- Text color: #ffffff (white)
- Corner radius: 24px (pill-shaped)

**BRAND COLORS:**

- #4ecdc4 - BRAND - 65% coverage`;

console.log('=== Testing Button Regex ===');
var buttonsSection = mockData.match(/\*\*(?:ALL )?BUTTONS?(?:\/CTAs?)?\*\*:?([\s\S]*?)(?:\*\*[A-Z]|$)/i);
console.log('Buttons match found:', buttonsSection !== null);

if (buttonsSection) {
  console.log('Captured group 1 length:', buttonsSection[1].length);
  console.log('First 100 chars:', buttonsSection[1].substring(0, 100));

  // Test if "Hero CTA Button" line would be matched
  var lines = buttonsSection[1].split('\n');
  console.log('\nTotal lines:', lines.length);

  lines.forEach((line, index) => {
    var heroMatch = line.match(/(?:Hero|Primary|Secondary|Navigation|Footer|CTA).*Button/i);
    if (heroMatch) {
      console.log('Line', index, 'matches button header:', line.trim());
    }
  });
}
