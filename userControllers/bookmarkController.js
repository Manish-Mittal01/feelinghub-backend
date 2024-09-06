const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");
const bookmarkModel = require("../Models/bookmarkmodel");
const { storyModel } = require("../Models/storyModel");

module.exports.manageBookmark = async (req, res) => {
  try {
    const { storyId, userId } = req.body;

    const isStoryExist = await storyModel.findOne({ _id: storyId });
    if (!isStoryExist)
      return ResponseService.failed(res, "Story does not exist", StatusCode.notFound);

    const isBookmarkExist = await bookmarkModel.findOne({ story: storyId, user: userId });

    let result = {};
    if (isBookmarkExist) {
      result = await bookmarkModel.deleteOne({ story: storyId, user: userId });
    } else {
      const newStory = { story: storyId, user: userId };
      const myStory = new bookmarkModel(newStory);
      result = await myStory.save();
    }

    return ResponseService.success(res, `bookmark updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.getBookmarkList = async (req, res) => {
  try {
    const { page, limit, order, orderBy, userId } = req.body;

    const bookmarkList = await bookmarkModel
      .find({ user: userId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [orderBy]: order })
      .populate("story story.user");

    const bookmarkCount = await bookmarkModel.countDocuments({ user: userId });

    const response = {
      items: bookmarkList,
      totalCount: bookmarkCount,
    };

    return ResponseService.success(res, "Bookmark list found", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
