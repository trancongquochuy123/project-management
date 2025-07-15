const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

async function uploadBase64ToCloudinary(dataURI) {
  return new Promise((resolve, reject) => {
    const matches = dataURI.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!matches) return reject(new Error("Invalid data URI"));

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'products/descriptions' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}


async function processDescription(description) {
  if (!description) return description;

  const dataURIs = Array.from(description.matchAll(/<img[^>]+src="(data:image\/[^">]+)"/g)).map(m => m[1]);

  for (const dataURI of dataURIs) {
    try {
      const uploadedUrl = await uploadBase64ToCloudinary(dataURI);
      const escaped = dataURI.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      description = description.replace(regex, uploadedUrl);
    } catch (err) {
      console.error('[CLOUDINARY UPLOAD ERROR]', err);
      throw err; // Giao trách nhiệm cho controller xử lý
    }
  }

  return description;
}

module.exports = { processDescription };
