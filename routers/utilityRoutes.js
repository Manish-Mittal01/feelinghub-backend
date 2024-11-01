const router = require("express").Router();
const { validateFile } = require("../middlewares/validateFile");
const { uploadFiles } = require("../commonControllers/upload-file");
const { getCategories } = require("../adminControllers/categoryController");
const { updateFirebaseToken } = require("../commonControllers/firebaseController");
const cmsController = require("../adminControllers/contentPagesController");
const { authCheck } = require("../middlewares/authCheck");
const { validateRequest, firebaseSchema, cmsSchema } = require("../middlewares/validateRequest");

router.route("/uploadFiles").post(validateFile, uploadFiles);
router.route("/categories/list").get(getCategories);
router
  .route("/firebaseToken/update")
  .post(authCheck, validateRequest(firebaseSchema.updateTokenSchema), updateFirebaseToken);

//cms management
router.route("/cms/page/list").get(cmsController.getContentPageList);
router
  .route("/cms/page/content")
  .post(validateRequest(cmsSchema.deleteCmsSchema), cmsController.getPageContent);

module.exports = router;
