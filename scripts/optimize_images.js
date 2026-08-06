const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const bannersDir = path.join(__dirname, '..', 'assets', 'banners');

async function optimizeImages() {
    const files = fs.readdirSync(bannersDir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
        const inputPath = path.join(bannersDir, file);
        const outputPath = path.join(bannersDir, file.replace('.png', '.webp'));
        
        await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
            
        console.log(`Converted ${file} to WebP!`);
        
        // Remove the original PNG
        fs.unlinkSync(inputPath);
    }
    console.log("All banners optimized to WebP!");
}

optimizeImages();
