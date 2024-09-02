const router = require("express").Router();
const { validateFile } = require("../middlewares/validateFile");
const { uploadFiles } = require("../commonControllers/upload-file");
const { getCategories } = require("../adminControllers/categoryController");

router.route("/uploadFiles").post(validateFile, uploadFiles);
router.route("/categories/list").get(getCategories);
// router.route("/getContentPage/:pageId").get(getContentPage);
// router.route("/getContentPageList").get(getContentPageList);

module.exports = router;
