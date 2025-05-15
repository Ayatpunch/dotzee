import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const CWD = process.cwd(); // Should be dotzee-docs directory

async function generateFavicon() {
    const svgFilePath = path.join(CWD, 'public', 'logo.svg');
    const outputFilePath = path.join(CWD, 'public', 'favicon.png');
    const faviconSize = 64; // You can change this to 32 if preferred

    try {
        // Read the SVG file buffer
        const svgBuffer = await fs.readFile(svgFilePath);

        // Convert SVG buffer to PNG buffer with specified size
        await sharp(svgBuffer)
            .resize(faviconSize, faviconSize)
            .png() // Specify PNG output format
            .toFile(outputFilePath);

        console.log(`Successfully generated favicon.png (${faviconSize}x${faviconSize}) at ${outputFilePath} using sharp`);
    } catch (error) {
        console.error('Error generating favicon with sharp:', error);
        process.exit(1);
    }
}

generateFavicon(); 