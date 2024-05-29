const fs = require('fs');

const path = require('path');

/* const decodeBase64Image = async (image) => {

    try {

        const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (matches.length !== 3) {
            throw new Error('Invalid input string');
        }
        fs.writeFileSync('output_image.png', imageBuffer.data);
        return {
            type: matches[1],
            data: Buffer.from(matches[2], 'base64')
        };

    } catch (error) {

        console.error(error);

        throw error;

    }
};

module.exports = decodeBase64Image; */


const decodeBase64Image = async (image, imgName) => {

    const base64Data = image.replace(/^data:image\/(png|jpeg);base64,/, '');

    const imageBuffer = Buffer.from(base64Data, 'base64');

    let outputPath = imgName + ".png";

    fs.writeFileSync(outputPath, imageBuffer);

    let final_path = process.env.IMAGE_BASEURL + outputPath;

    return final_path;
}


module.exports = decodeBase64Image;