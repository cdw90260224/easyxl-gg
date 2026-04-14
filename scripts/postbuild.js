import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

try {
    if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
        console.log('✅ Copied index.html to 404.html for GitHub Pages SPA routing fallback.');
    } else {
        console.warn('⚠️ dist/index.html not found. Postbuild script skipped.');
    }
} catch (error) {
    console.error('Error in postbuild script:', error);
}
