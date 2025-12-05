import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'frontend/public');
const FILES_TO_OPTIMIZE = ['lidar.png', 'vrstvy.png', '3D.png', 'bcg.png'];

async function main() {
  console.log('Starting image optimization...');

  for (const file of FILES_TO_OPTIMIZE) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const outputPath = path.join(PUBLIC_DIR, file.replace('.png', '.webp'));

    if (fs.existsSync(inputPath)) {
      try {
        await sharp(inputPath)
          .webp({ quality: 80 }) // High quality WebP
          .toFile(outputPath);
        
        console.log(`✅ Converted ${file} to WebP`);
      } catch (error) {
        console.error(`❌ Error converting ${file}:`, error);
      }
    } else {
      console.warn(`⚠️ File not found: ${file}`);
    }
  }

  console.log('Done!');
}

main();




