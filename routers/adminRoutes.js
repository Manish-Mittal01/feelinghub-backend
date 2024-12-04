const router = require("express").Router();
const categoryController = require("../adminControllers/categoryController");
const usersController = require("../adminControllers/userController");
const cmsController = require("../adminControllers/cmsController");
const faqController = require("../adminControllers/faqController");
const configController = require("../adminControllers/configsController");
const { staffCheck, authCheck } = require("../middlewares/authCheck");
const {
  validateRequest,
  validateRequestParams,
  usersSchema,
  cmsSchema,
  faqSchema,
  categorySchema,
  configsSchema,
} = require("../middlewares/validateRequest");

//categories
router
  .route("/category/add")
  .post(
    staffCheck,
    validateRequest(categorySchema.addCategorySchema),
    categoryController.addCategory
  );
router
  .route("/category/update")
  .post(
    staffCheck,
    validateRequest(categorySchema.updateCategorySchema),
    categoryController.updateCategory
  );
router
  .route("/category/delete/:categoryId")
  .delete(
    staffCheck,
    validateRequestParams(categorySchema.deleteCategorySchema),
    categoryController.deleteCategory
  );
router
  .route("/category/details/:categoryId")
  .get(
    staffCheck,
    validateRequestParams(categorySchema.deleteCategorySchema),
    categoryController.getCategoryDetails
  );

//users management
router
  .route("/users/list")
  .post(authCheck, validateRequest(usersSchema.usersListSchema), usersController.getAllUsers);
router
  .route("/user/status/update")
  .post(
    staffCheck,
    validateRequest(usersSchema.updateUserStatusSchema),
    usersController.updateUserStatus
  );
router
  .route("/user/reports/list")
  .post(staffCheck, validateRequest(usersSchema.userReportsList), usersController.getUserReports);

//cms management
router
  .route("/cms/add")
  .post(staffCheck, validateRequest(cmsSchema.addCmsSchema), cmsController.addContentPage);
router
  .route("/cms/update")
  .post(staffCheck, validateRequest(cmsSchema.updateCmsSchema), cmsController.updateContentPage);
router
  .route("/cms/delete")
  .delete(staffCheck, validateRequest(cmsSchema.deleteCmsSchema), cmsController.deleteContentPage);

//faqs management
router
  .route("/faq/add")
  .post(staffCheck, validateRequest(faqSchema.addFaqSchema), faqController.addFaq);
router
  .route("/faq/update")
  .post(staffCheck, validateRequest(faqSchema.updateFaqSchema), faqController.updateFaq);
router
  .route("/faq/delete")
  .delete(staffCheck, validateRequest(faqSchema.deleteFaqSchema), faqController.deleteFaq);

// configs
router
  .route("/config/update")
  .post(staffCheck, validateRequest(configsSchema.updateConfigs), configController.updateConfigs);

module.exports = router;
