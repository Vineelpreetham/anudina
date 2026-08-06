const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const themes = {
    law: ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'],
    history: ['joshua', 'judges', 'ruth', '1samuel', '2samuel', '1kings', '2kings', '1chronicles', '2chronicles', 'ezra', 'nehemiah', 'esther', 'acts'],
    poetry: ['job', 'psalms', 'proverbs', 'ecclesiastes', 'songofsolomon'],
    prophets: ['isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'],
    gospels: ['matthew', 'mark', 'luke', 'john'],
    epistles: ['romans', '1corinthians', '2corinthians', 'galatians', 'ephesians', 'philippians', 'colossians', '1thessalonians', '2thessalonians', '1timothy', '2timothy', 'titus', 'philemon', 'hebrews', 'james', '1peter', '2peter', '1john', '2john', '3john', 'jude', 'revelation']
};

function getTheme(filename) {
    const name = filename.replace('.html', '');
    for (const [theme, books] of Object.entries(themes)) {
        if (books.includes(name)) return theme;
    }
    return 'gospels'; // fallback
}

const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'old-testament.html' && f !== 'new-testament.html');

let updated = 0;

for (const file of files) {
    const filepath = path.join(rootDir, file);
    let content = fs.readFileSync(filepath, 'utf8');

    const theme = getTheme(file);
    const name = file.replace('.html', '');
    const newImgSrc = `./assets/banners/${theme}.webp`;

    // Regex to match the entire book-banner div block and capture the href of the back button
    const regex = /<div class="book-banner"[^>]*>[\s\S]*?<a class="book-banner-back" href="([^"]+)">←<\/a>[\s\S]*?<\/div>/;
    
    if (regex.test(content)) {
        content = content.replace(regex, `<div class="book-banner">
        <img src="${newImgSrc}" alt="${name.charAt(0).toUpperCase() + name.slice(1)} Banner">
        <a class="book-banner-back" href="$1">←</a>
      </div>`);
        fs.writeFileSync(filepath, content, 'utf8');
        updated++;
        console.log(`Updated ${file} -> ${theme}.png`);
    } else {
        console.warn(`Could not find banner structure in ${file}`);
    }
}

console.log(`Successfully updated ${updated} files!`);
