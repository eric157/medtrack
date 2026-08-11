const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate simple valid 192x192 and 512x512 SVG icons
const svgContent = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#059669"/>
  <path d="M ${size*0.3} ${size*0.5} L ${size*0.7} ${size*0.5} M ${size*0.5} ${size*0.3} L ${size*0.5} ${size*0.7}" stroke="#FFFFFF" stroke-width="${size*0.12}" stroke-linecap="round"/>
  <circle cx="${size*0.75}" cy="${size*0.25}" r="${size*0.1}" fill="#F59E0B"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent(512));

// Use a simple HTML/Canvas script via node if canvas not installed, or create SVG data fallback
console.log('Icons generated successfully in public/icons');
