const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bg" x1="64" y1="48" x2="448" y2="464" gradientUnits="userSpaceOnUse">
      <stop stop-color="#10B981"/>
      <stop stop-color="#0D9488"/>
      <stop offset="1" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="pill" x1="144" y1="256" x2="368" y2="256" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#ECFDF5"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#064E3B" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <g filter="url(#shadow)">
    <rect x="128" y="208" width="256" height="96" rx="48" fill="url(#pill)"/>
    <rect x="248" y="208" width="16" height="96" fill="#D1FAE5"/>
  </g>
  <path d="M196 256L228 288L316 200" stroke="#059669" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M96 340H416" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.25"/>
  <circle cx="384" cy="128" r="36" fill="#F59E0B"/>
  <circle cx="384" cy="128" r="18" fill="#FDE68A"/>
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
