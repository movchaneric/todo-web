const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,  `${Date.now()}`+ '-' + file.originalname)
    }
  })

//filter image types
const imageFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg'  ||
        file.mimetype === 'image/png'){ 
        cb(null, true);
      }else{
        cb(null, false);
      }
}

module.exports = {
    fileStorage, 
    imageFilter
}