const categoryModel = require("../Models/categoryModel");
const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");

const addCategory = async (req, res) => {
  try {
    const { name, iconRegular, iconFilled, specialName, isPrimary } = req.body;

    const isCategoryExist = await categoryModel.findOne({ name });
    if (isCategoryExist)
      return ResponseService.success(res, "Category already exist", StatusCode.forbidden);

    const myCategory = { name, iconRegular, iconFilled, specialName, isPrimary };
    const newCategory = new categoryModel(myCategory);
    const result = await newCategory.save();

    return ResponseService.success(res, "Category added", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const getCategoryDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const isCategoryExist = await categoryModel.findOne({ _id: categoryId }).lean();
    if (!isCategoryExist) return ResponseService.failed(StatusCode.notFound, "Category not found");

    return ResponseService.success(res, "Category deleted", isCategoryExist);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const isCategoryExist = await categoryModel.findOne({ _id: categoryId });
    if (!isCategoryExist)
      return ResponseService.success(res, "Category not found", StatusCode.badRequest);

    const result = await categoryModel.updateOne({ _id: categoryId }, { ...req.body });

    return ResponseService.success(res, "Category updated", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const isCategoryExist = await categoryModel.findOne({ _id: categoryId });
    if (!isCategoryExist) return ResponseService.success(res, "Category deleted successfully", {});

    const result = await categoryModel.deleteOne({ _id: categoryId });

    return ResponseService.success(res, "Category deleted successfully", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports = { addCategory, updateCategory, deleteCategory, getCategoryDetails };
