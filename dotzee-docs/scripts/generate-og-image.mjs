import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const CWD = process.cwd(); // Should be dotzee-docs directory

// OG Image Dimensions
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Logo settings
const LOGO_SIZE = 300; // Size for the logo on the OG image (e.g., 300x300)
const BACKGROUND_COLOR = '#FFFFFF'; // White background, you can change this

async function generateOgImage() {
    const svgFilePath = path.join(CWD, 'public', 'logo.svg');
    const outputFilePath = path.join(CWD, 'public', 'og-image.png');

    try {
        const svgBuffer = await fs.readFile(svgFilePath);

        // Resize the logo
        const resizedLogoBuffer = await sharp(svgBuffer)
            .resize(LOGO_SIZE, LOGO_SIZE, {
                fit: 'contain', // Ensures the whole logo fits, preserving aspect ratio
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background for the logo itself before compositing
            })
            .png() // Convert to PNG buffer for compositing
            .toBuffer();

        // Create the background canvas and composite the logo onto it
        await sharp({
            create: {
                width: OG_WIDTH,
                height: OG_HEIGHT,
                channels: 4, // 4 channels for RGBA
                background: BACKGROUND_COLOR
            }
        })
            .composite([{
                input: resizedLogoBuffer,
                gravity: 'center' // Center the logo
            }])
            .png() // Output as PNG
            .toFile(outputFilePath);

        console.log(`Successfully generated og-image.png (${OG_WIDTH}x${OG_HEIGHT}) at ${outputFilePath}`);
    } catch (error) {
        console.error('Error generating og-image with sharp:', error);
        process.exit(1);
    }
}

generateOgImage(); 