const fs = require('fs');
const path = require('path');

const dir = 'src/app/actions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file contains "use server" but not at the very top
  if (content.includes('"use server"') && !content.trim().startsWith('"use server"')) {
    console.log(`Fixing ${file}`);
    // Remove all instances of "use server"; or "use server"
    content = content.replace(/['"]use server['"];?/g, '');
    // Remove extra newlines at start
    content = content.replace(/^\s+/, '');
    // Add "use server"; at the very top
    content = '"use server";\n\n' + content;
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log("Done fixing use server.");
