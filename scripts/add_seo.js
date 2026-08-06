const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && f !== 'index.html');

let updated = 0;

for (const file of files) {
    const filepath = path.join(rootDir, file);
    let content = fs.readFileSync(filepath, 'utf8');

    // Extract title
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Anudhina Jeevaharam';
    const bookName = title.split('—')[0].trim();

    const seoTags = `
  <meta name="description" content="Explore ${bookName} through focused video overviews by Raj Prakash Paul.">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="Explore ${bookName} through focused video overviews by Raj Prakash Paul.">
  <meta property="og:image" content="https://res.cloudinary.com/dbeh0eisn/image/upload/v1786009411/Saved_Frame_from_Wheat_stalks_202608061454_mzlcsd.jpg">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">`;

    // Only inject if not already present
    if (!content.includes('property="og:title"')) {
        content = content.replace('</head>', `${seoTags}\n</head>`);
        fs.writeFileSync(filepath, content, 'utf8');
        updated++;
        console.log(`Added SEO tags to ${file}`);
    }
}

console.log(`Successfully updated ${updated} files with SEO tags!`);
