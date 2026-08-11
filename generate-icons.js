const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="110" fill="url(#primaryGradient)" />
  <circle cx="256" cy="256" r="140" stroke="#FFFFFF" stroke-width="32" fill="none" />
  <polyline points="180,256 230,306 332,190" stroke="#FFFFFF" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('SVG icon written to public/icons/icon.svg');

async function generatePngs() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('Run "npm install --save-dev sharp" then "node generate-icons.js" to create PNG icons.');
    return;
  }

  const svgBuffer = Buffer.from(svgContent);
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192x192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512x512.png'));
  console.log('PNG icons created: icon-192x192.png, icon-512x512.png');
}

generatePngs().catch(console.error);
