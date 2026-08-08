const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Check if file contains "use client"
  if (content.includes('"use client"') && !content.trim().startsWith('"use client"')) {
    console.log(`Fixing ${file}`);
    // Remove all instances of "use client"; or "use client"
    content = content.replace(/['"]use client['"];?/g, '');
    // Remove extra newlines at start
    content = content.replace(/^\s+/, '');
    // Add "use client"; at the very top
    content = '"use client";\n\n' + content;
    
    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log("Done checking all files.");
