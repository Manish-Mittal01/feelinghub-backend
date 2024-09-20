const router = require("express").Router();
const { validateFile } = require("../middlewares/validateFile");
const { uploadFiles } = require("../commonControllers/upload-file");
const { getCategories } = require("../adminControllers/categoryController");
const { updateFirebaseToken } = require("../commonControllers/firebaseController");
const { authCheck, staffCheck } = require("../middlewares/authCheck");
const { validateRequest, firebaseSchema, cmsSchema } = require("../middlewares/validateRequest");
const { addContentPage } = require("../commonControllers/cmsController");

router.route("/uploadFiles").post(validateFile, uploadFiles);
router.route("/categories/list").get(getCategories);
router
  .route("/firebaseToken/update")
  .post(authCheck, validateRequest(firebaseSchema.updateTokenSchema), updateFirebaseToken);

router.route("/cms/add").post(staffCheck, validateRequest(cmsSchema.cmsAddSchema), addContentPage);
router
  .route("/cms/update")
  .post(staffCheck, validateRequest(cmsSchema.cmsUpdateSchema), updateContentPage);

module.exports = router;
