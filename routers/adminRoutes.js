const router = require("express").Router();
const categoryController = require("../adminControllers/categoryController");
const { staffCheck } = require("../middlewares/authCheck");
const { validateRequest, validateRequestParams } = require("../middlewares/validateRequest");
const { categorySchema } = require("../middlewares/validateRequest");

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

module.exports = router;
