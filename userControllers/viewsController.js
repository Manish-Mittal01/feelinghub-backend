const viewsModel = require("../Models/viewsModel");
const { ResponseService } = require("../services/responseService");

module.exports.addStoryView = async (req, res) => {
  try {
    const { storyId } = req.body;
    let userId = req.headers?.userid;

    const isUserViewExist = viewsModel.exists({ story: storyId, user: userId });
    let result = {};

    if (isUserViewExist) {
      result = await viewsModel.updateOne(
        { story: storyId, user: userId },
        { $inc: { viewsCount: 1 } }
      );
    } else {
      const myView = new viewsModel({ story: storyId, user: userId, viewsCount: 1 });
      result = await myView.save();
    }

    return ResponseService.success(res, `View updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.getWatchHistory = async (req, res) => {
  try {
    const { userId } = req.body;

    const watchHistory = viewsModel
      .find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate("story")
      .lean();

    const response = { records: watchHistory };

    return ResponseService.success(res, `Watch history found successfully`, response);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};
