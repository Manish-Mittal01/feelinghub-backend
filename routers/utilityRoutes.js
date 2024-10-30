const router = require("express").Router();
const { validateFile } = require("../middlewares/validateFile");
const { uploadFiles } = require("../commonControllers/upload-file");
const configsController = require("../commonControllers/configsController");
const { getCategories } = require("../adminControllers/categoryController");
const { updateFirebaseToken } = require("../commonControllers/firebaseController");
const { authCheck } = require("../middlewares/authCheck");
const { validateRequest, firebaseSchema } = require("../middlewares/validateRequest");

router.route("/uploadFiles").post(validateFile, uploadFiles);
router.route("/categories/list").get(getCategories);
router
  .route("/firebaseToken/update")
  .post(authCheck, validateRequest(firebaseSchema.updateTokenSchema), updateFirebaseToken);
router.route("/configs").get(configsController.getConfigs);

module.exports = router;
