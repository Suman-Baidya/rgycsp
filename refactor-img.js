const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'components', 'landing');
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dirPath, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it has <img or <img\s
  if (/<img[\s>]/g.test(content)) {
    // Add import if missing
    if (!content.includes('import Image from "next/image"')) {
      content = 'import Image from "next/image";\n' + content;
    }

    // Replace <img with <Image width={800} height={800} 
    content = content.replace(/<img/g, '<Image width={800} height={800}');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
