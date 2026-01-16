import fs from 'fs';
import path from 'path';

const diaryDir = path.join(process.cwd(), 'public', 'diary');
const manifestPath = path.join(process.cwd(), 'public', 'diary', 'manifest.json');

const extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG', '.webp', '.WEBP'];

function generateManifest() {
  try {
    const files = fs.readdirSync(diaryDir);
    const photos = files
      .filter(file => extensions.includes(path.extname(file)))
      .map((file, index) => ({
        id: index,
        url: `/diary/${file}`
      }));

    fs.writeFileSync(manifestPath, JSON.stringify(photos, null, 2));
    console.log(`✅ Manifest updated! Found ${photos.length} photos.`);
  } catch (error) {
    console.error('❌ Error generating manifest:', error);
  }
}

generateManifest();
