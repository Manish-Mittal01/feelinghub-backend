const { ResponseService } = require("../services/responseService");
const { storyCategories } = require("../utils/constants");

module.exports.addContentPage = async (req, res) => {
  try {
    const { title, content } = req.body;
    return ResponseService.success(res, "Categories found!!", {
      items: storyCategories,
      totalCount: storyCategories.length || 0,
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.updateContentPage = async (req, res) => {
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
