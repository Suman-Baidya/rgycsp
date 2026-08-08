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
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // First, normalize the one I changed to blue-400
  if (content.includes('dark:bg-slate-700 text-primary dark:text-blue-400')) {
    content = content.replace(/dark:bg-slate-700 text-primary dark:text-blue-400/g, 'dark:bg-slate-700 text-primary dark:text-white');
    changed = true;
  }
  
  // Now replace all other instances of 'dark:bg-slate-700 text-primary ' (note the trailing space so it matches before shadow)
  // Or 'dark:bg-slate-700 text-primary' followed by space or quote
  if (content.includes('dark:bg-slate-700 text-primary')) {
    // Only replace if it doesn't already have dark:text-white
    const regex = /dark:bg-slate-700 text-primary(?! dark:text-white)/g;
    if (regex.test(content)) {
        content = content.replace(regex, 'dark:bg-slate-700 text-primary dark:text-white');
        changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log("Done updating tabs.");
