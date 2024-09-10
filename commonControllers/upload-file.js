const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const { firebaseConfig } = require("../firebase/config");
const { webName, StatusCode } = require("../utils/constants");
const { ResponseService } = require("../services/responseService");

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// const newStorage = SharpMulter({
//   destination: storage,
//   imageOptions: {
//     fileFormat: "jpg",
//     quality: 80,
//   },
// });

// module.exports.upload = multer({ storage: multer.memoryStorage() });

module.exports.uploadFiles = async (req, res) => {
  try {
    const files = req.file ? [req.file] : req.files;
    if (!files) return ResponseService.failed(res, "images not found", StatusCode.notFound);

    let downloadURLs = [];

    for (let file of files) {
      if (!file.mimetype?.includes("image"))
        return ResponseService.failed(res, "Only images are allowed", StatusCode.badRequest);

      const fileExtension = file.mimetype.split("/")?.[1] || "jpg";
      const fileName = `${Date.now()}.${fileExtension}`;

      const storageRef = ref(storage, `${webName}/${fileName}`);
      const metaData = {
        contentType: file.mimetype,
      };
      const snapShot = await uploadBytesResumable(storageRef, file.buffer, metaData);
      const downloadURL = await getDownloadURL(snapShot.ref);
      // const downloadURL = `${process.env.HOST}/images/${file.filename}`;
      downloadURLs.push({ url: downloadURL, type: file.mimetype, filename: fileName });
    }

    const responseData = [...downloadURLs];
    return ResponseService.success(res, "File uploaded", responseData);
  } catch (error) {
    console.log("file upload error", error);
    return ResponseService.serverError(res, error);
  }
};
