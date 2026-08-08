const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let filesModified = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filesModified += processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match things like revalidatePath(`/app/[tenant]/admin/students`);
      // or revalidatePath("/app/[tenant]", "layout");
      const re = /revalidatePath\(\s*(["'`])\/app\/\[tenant\]([^"'`]*)\1\s*(,\s*(["'`])([^"'`]+)\4)?\s*\)/g;
      
      if (re.test(content)) {
        // We need to add the import for revalidateWorkspacePath if not present
        if (!content.includes('revalidateWorkspacePath')) {
          content = 'import { revalidateWorkspacePath } from "@/lib/revalidate";\n' + content;
        }

        // Replace all instances
        // Note: we assume 'workspaceId' is available in the scope where revalidatePath is called.
        // For some files it might be 'data.workspaceId' or something else, but most actions have workspaceId.
        content = content.replace(re, (match, q1, relative, p3, q2, type) => {
          let relPath = relative;
          if (!relPath) relPath = "/";
          let typeStr = type ? `, "${type}"` : '';
          
          return `await revalidateWorkspacePath(typeof workspaceId !== 'undefined' ? workspaceId : (typeof data !== 'undefined' ? data.workspaceId : null), "${relPath}"${typeStr})`;
        });
        
        fs.writeFileSync(fullPath, content, 'utf8');
        filesModified++;
        console.log("Updated: " + file);
      }
    }
  }
  return filesModified;
}

const modified = processDirectory(directoryPath);
console.log("Total files modified: " + modified);
