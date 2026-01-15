// Quick favicon converter using sharp
// Run: node scripts/convert-favicon.js

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputImage = path.join(__dirname, '../public/logos/Stylized Red Bus Logo with Integrated Text.png');
const outputDir = path.join(__dirname, '../public');

async function convertFavicons() {
  try {
    console.log('🎨 Converting SeeZee logo to all favicon formats...\n');

    // Read the input image
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    console.log(`✅ Loaded image: ${metadata.width}x${metadata.height}\n`);

    // Generate favicon.ico (32x32)
    await image
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon-32.png'));
    console.log('✅ Created favicon-32.png');

    // Generate 16x16 icon
    await image
      .resize(16, 16)
      .toFile(path.join(outputDir, 'favicon-16.png'));
    console.log('✅ Created favicon-16.png');

    // Generate icon.png (512x512)
    await image
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(outputDir, 'icon.png'));
    console.log('✅ Created icon.png (512x512)');

    // Generate apple-touch-icon.png (180x180)
    await image
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✅ Created apple-touch-icon.png (180x180)');

    // Generate OG image (1200x630) with logo centered
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 31, g: 41, b: 55, alpha: 1 } // Dark background #1f2937
      }
    })
    .composite([
      {
        input: await image.resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(outputDir, 'opengraph-image.png'));
    console.log('✅ Created opengraph-image.png (1200x630)');

    console.log('\n🎉 All favicon formats generated successfully!');
    console.log('\n📦 Files created in /public/:');
    console.log('   - favicon-16.png');
    console.log('   - favicon-32.png');
    console.log('   - icon.png (512x512)');
    console.log('   - apple-touch-icon.png (180x180)');
    console.log('   - opengraph-image.png (1200x630)');
    console.log('\n🚀 Now run: vercel --prod');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure you have sharp installed:');
    console.log('   npm install sharp --save-dev');
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  convertFavicons();
} catch (e) {
  console.log('📦 Installing sharp...\n');
  const { execSync } = require('child_process');
  execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  console.log('\n✅ Sharp installed! Running conversion...\n');
  convertFavicons();
}
