const router = require("express").Router();
const { validateFile } = require("../middlewares/validateFile");
const { authCheck } = require("../middlewares/authCheck");
const { validateRequest, firebaseSchema, cmsSchema } = require("../middlewares/validateRequest");
const { uploadFiles } = require("../commonControllers/upload-file");
const configsController = require("../commonControllers/configsController");
const { updateFirebaseToken } = require("../commonControllers/firebaseController");
const cmsController = require("../adminControllers/cmsController");
const { getCategories } = require("../adminControllers/categoryController");

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

//configs
router.route("/configs").get(configsController.getConfigs);

module.exports = router;
