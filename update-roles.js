const fs = require('fs');
const path = require('path');

function replaceRolesInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace old roles with new roles
  content = content.replace(/"SUPER_ADMIN"/g, '"BIOFIX_ADMIN"');
  content = content.replace(/'SUPER_ADMIN'/g, "'BIOFIX_ADMIN'");
  content = content.replace(/SUPER_ADMIN/g, "BIOFIX_ADMIN");

  content = content.replace(/"INSPECTOR"/g, '"QC_USER"');
  content = content.replace(/'INSPECTOR'/g, "'QC_USER'");

  content = content.replace(/"LAB_STAFF"/g, '"QC_USER"');
  content = content.replace(/'LAB_STAFF'/g, "'QC_USER'");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceRolesInFile(fullPath);
    }
  }
}

traverseDir(path.join(__dirname, 'src'));
console.log("Done updating roles.");
