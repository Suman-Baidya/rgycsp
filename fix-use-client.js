const fs = require('fs');
const path = require('path');

const dir = 'src/components/landing';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file contains "use client"
  if (content.includes('"use client"') && !content.trim().startsWith('"use client"')) {
    console.log(`Fixing ${file}`);
    // Remove all instances of "use client"; or "use client"
    content = content.replace(/['"]use client['"];?/g, '');
    // Remove extra newlines at start
    content = content.replace(/^\s+/, '');
    // Add "use client"; at the very top
    content = '"use client";\n\n' + content;
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log("Done fixing use client.");
