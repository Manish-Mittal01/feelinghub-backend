const { ResponseService } = require("../services/responseService");
const { storyCategories } = require("../utils/constants");

module.exports.getCategory = async (req, res) => {
  try {
    return ResponseService.success(res, "Categories found!!", {
      items: storyCategories,
      totalCount: storyCategories.length || 0,
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
