/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_DIR = path.resolve(__dirname, '../src/api');
const OUTPUT_FILE = path.resolve(__dirname, '../src/config/api-docs-data.json');

const files = [];

function walkDir(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walkDir(filePath);
    } else {
      if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        files.push(filePath);
      }
    }
  });
}

walkDir(API_DIR);

const apiData = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const relativePath = path.relative(API_DIR, file).replace(/\\/g, '/');
  const categoryName = relativePath.replace('.ts', '');
  
  // Extract exported types/interfaces
  const typeRegex = /export\s+(?:type|interface)\s+(\w+)(?:\s*=\s*)?(\{[^}]*\})/g;
  let typeMatch;
  const fileTypes = {};
  while ((typeMatch = typeRegex.exec(content)) !== null) {
    fileTypes[typeMatch[1]] = typeMatch[2];
  }

  // Regex to match function exports
  // export async function funcName(...)
  const funcRegex = /export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g;
  
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const funcName = match[1];
    const params = match[2];
    const body = match[3];
    
    // Attempt to extract URL and Method and Return Type
    // request.get<T>("/url", ...) or request.post("/url", ...)
    const methodRegex = /request\.(get|post|put|delete|patch)(?:<([^>]+)>)?\(\s*(["'`])([^"'`]+)\3/i;
    const methodMatch = methodRegex.exec(body);
    
    if (methodMatch) {
      const method = methodMatch[1].toUpperCase();
      const returnType = methodMatch[2] || 'any';
      const url = methodMatch[4];
      
      // Attempt to extract JSDoc description before the function
      // Look back from the match index
      const beforeMatch = content.substring(0, match.index);
      const jsDocRegex = /\/\*\*([\s\S]*?)\*\/\s*$/;
      const jsDocMatch = jsDocRegex.exec(beforeMatch);
      let description = funcName; // default to function name
      
      if (jsDocMatch) {
        // clean up JSDoc
        description = jsDocMatch[1]
          .replace(/\*/g, '')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('@'))
          .join(' ');
      }

      // Add to list
      let category = apiData.find(c => c.name === categoryName);
      if (!category) {
        category = {
          id: categoryName,
          name: categoryName, // simplistic naming
          children: []
        };
        apiData.push(category);
      }
      
      category.children.push({
        id: `${categoryName}-${funcName}`,
        name: description || funcName,
        method: method,
        path: url,
        status: 'enabled',
        owner: 'system',
        funcName: funcName,
        params: params,
        returnType: returnType,
        types: fileTypes // Embed types found in this file for reference
      });
    }
  }
});

// Post-process to map known category names if possible (optional)
// Just output the JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(apiData, null, 2));

