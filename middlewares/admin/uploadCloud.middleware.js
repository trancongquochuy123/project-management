const cloudinary = require('../../config/cloudinary.js');
const streamifier = require('streamifier')

module.exports.upload = async function (req, res, next) {
    if (req.file) {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "products" }, // tùy theo bạn muốn lưu ở folder nào
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
            req.body[req.file.fieldname] = result.secure_url; // gán link cloudinary vào body
        } catch (err) {
            console.error("Upload error:", err);
            return res.status(500).send("Lỗi upload ảnh lên Cloudinary");
        }
    }

    next(); // gọi tiếp validate và controller
}