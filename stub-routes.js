const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/(dashboard)');

function cleanDir(currentPath) {
  if (!fs.existsSync(currentPath)) return;
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (file === 'layout.tsx') continue; // Keep the layout
      
      if (file.includes('page.tsx')) {
        fs.writeFileSync(fullPath, `export default function Page() { return <div className="p-8"><h1 className="text-2xl font-bold">V3 Migration in Progress</h1><p>This module is currently being upgraded to the Enterprise V3 Architecture.</p></div>; }`);
      } else {
        fs.writeFileSync(fullPath, `// Migrating to V3`);
      }
    }
  }
}

cleanDir(dir);
console.log('Cleaned all dashboard routes to stub pages.');
