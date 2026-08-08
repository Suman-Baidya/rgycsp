const fs = require('fs');

const filePath = 'src/app/(admin)/super-admin/documents/DocumentDesigner.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace bg-white dark:bg-slate-800 inside textarea and Input tags
// Also border-slate-200 dark:border-slate-700 can be problematic if text is white
// Let's replace 'bg-white dark:bg-slate-800' with 'bg-background'
// and 'border-2 border-slate-200 dark:border-slate-700' with 'border-2 border-input'

content = content.replace(/bg-white dark:bg-slate-800/g, 'bg-background');
content = content.replace(/border-2 border-slate-200 dark:border-slate-700/g, 'border-2 border-input');

fs.writeFileSync(filePath, content, 'utf8');
console.log("DocumentDesigner.tsx updated successfully.");
