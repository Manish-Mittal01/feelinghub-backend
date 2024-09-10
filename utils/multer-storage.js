const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "..", "public", "assets"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   },
// });

// module.exports.upload = multer({ storage: storage });

// module.exports.upload = multer({ storage: multer.memoryStorage() });
module.exports.upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2048000 },
  // fileFilter: (req, file, cb) => {
  //   cb(null, Date.now() + file.originalname);
  // },
}).array("images");
