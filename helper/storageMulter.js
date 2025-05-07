module.exports = () => {
    const multer = require('multer');
    const path = require('path');

    // Set up storage engine
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/uploads/'));
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });

    // const storage = multer.diskStorage({
    //     destination: function (req, file, cb) {
    //         cb(null, './public/uploads/')
    //     },
    //     filename: function (req, file, cb) {
    //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //         cb(null, `${uniqueSuffix}-${file.originalname}`)
    //     }
    // })

    return storage;
}