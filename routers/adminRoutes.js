const router = require("express").Router();
const categoryController = require("../adminControllers/categoryController");
const { staffCheck } = require("../middlewares/authCheck");
const { validateRequest } = require("../middlewares/validateRequest");
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
  .route("/category/delete")
  .post(
    staffCheck,
    validateRequest(categorySchema.deleteCategorySchema),
    categoryController.deleteCategory
  );

module.exports = router;
