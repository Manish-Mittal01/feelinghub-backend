const categoryModel = require("../Models/categoryModel");
const { ResponseService } = require("../services/responseService");

const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().lean();

    return ResponseService.success(res, "Categories found!!", categories);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports = { getCategories };
