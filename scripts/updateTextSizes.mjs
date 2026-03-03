import fs from 'fs';
import path from 'path';

const dir = 'c:/Work/projects/medsoft-orpc/src/ui/components/doctor/documents';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    let startIndex = 0;
    while ((startIndex = content.indexOf('TEXT_SIZES = {', startIndex)) !== -1) {
        let endIndex = content.indexOf('};', startIndex);
        if (endIndex === -1) break;

        let block = content.substring(startIndex, endIndex + 2);
        let newBlock = block.replace(/:\s*\d+/g, ': 10');
        // Let's also ensure no other sizes are changed if they are expressions, but they are all numbers
        content = content.substring(0, startIndex) + newBlock + content.substring(endIndex + 2);

        startIndex += newBlock.length;
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Modified', filePath);
    }
}

function walkDir(d) {
    const items = fs.readdirSync(d);
    for (const item of items) {
        const full = path.join(d, item);
        if (fs.statSync(full).isDirectory()) {
            walkDir(full);
        } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
            processFile(full);
        }
    }
}

walkDir(dir);
