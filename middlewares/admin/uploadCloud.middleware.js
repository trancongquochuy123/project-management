const cloudinary = require('../../config/cloudinary.js');
const streamifier = require('streamifier');

// Tạo middleware có thể nhận folder tùy chọn
function uploadCloudinary(folder = 'products') {
  return async function (req, res, next) {
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder }, // folder được truyền vào khi tạo middleware
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      try {
        const result = await streamUpload(req);
        req.body[req.file.fieldname] = result.secure_url;
      } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).send("Lỗi upload ảnh lên Cloudinary");
      }
    }

    next();
  };
}

module.exports = { uploadCloudinary };
