const { StatusCode } = require("../utils/constants");
const { ResponseService } = require("../services/responseService");
const { storyModel } = require("../Models/storyModel");
const reportedStoryModel = require("../Models/reportedStoryModel");
const storyReactionsModel = require("../Models/storyReactionsModel");
const bookmarkmodel = require("../Models/bookmarkmodel");

module.exports.addStory = async (req, res) => {
  try {
    const { userId } = req.body;

    const newStory = {
      ...req.body,
      user: userId,
    };
    const story = new storyModel(newStory);
    const result = await story.save();
    return ResponseService.success(res, `story added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.getStoriesList = async (req, res) => {
  try {
    const { page, limit, order, orderBy, listType } = req.body;

    const filters = {};
    const filterValues = ["status", "category"];
    for (let filterKey of filterValues) {
      if (req.body[filterKey]) {
        filters[filterKey] = req.body[filterKey];
      }
    }
    if (listType === "main") {
      filters.status = "active";
      filters.isPrivate = false;
    }

    let stories = storyModel.aggregate([
      {
        $lookup: {
          from: "storyreactions",
          let: { storyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$story", "$$storyId"] }, comment: { $exists: true } } },
            { $count: "count" },
          ],
          as: "commentsCount",
        },
      },
      {
        $addFields: {
          commentsCount: { $ifNull: [{ $arrayElemAt: ["$commentsCount.count", 0] }, 0] },
        },
      },

      {
        $lookup: {
          from: "storyreactions",
          let: { storyId: "$_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$story", "$$storyId"] }, reactionType: { $exists: true } },
            },
            { $count: "count" },
          ],

          as: "reactionsCount",
        },
      },
      {
        $addFields: {
          reactionsCount: { $ifNull: [{ $arrayElemAt: ["$reactionsCount.count", 0] }, 0] },
        },
      },

      {
        $lookup: {
          from: "users",
          let: { userId: "$user", showUserDetails: "$anonymousSharing" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$userId"] }, { $eq: ["$$showUserDetails", false] }],
                },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },

      { $match: filters },
      { $sort: { [orderBy]: order } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    let totalCount = storyModel.countDocuments(filters);

    [stories, totalCount] = await Promise.all([stories, totalCount]);

    return ResponseService.success(res, `story list found successfully`, {
      records: stories,
      totalCount,
    });
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.getStoryDetails = async (req, res) => {
  try {
    const { storyId } = req.body;
    const { userid } = req.headers;

    let story = storyModel.findOne({ _id: storyId }).populate("user category").lean();
    let commentsCount = storyReactionsModel.countDocuments({
      story: storyId,
      comment: { $exists: true },
    });
    let reactionsCount = storyReactionsModel.countDocuments({
      story: storyId,
      reactionType: { $exists: true },
    });
    let isStoryBookmarked = false;
    if (userid) {
      isStoryBookmarked = bookmarkmodel.findOne({
        story: storyId,
        user: userid,
      });
    }

    [story, commentsCount, reactionsCount, isStoryBookmarked] = await Promise.all([
      story,
      commentsCount,
      reactionsCount,
      isStoryBookmarked,
    ]);

    if (!story) return ResponseService.success(res, `story not found`, StatusCode.notFound);

    return ResponseService.success(res, `story details found successfully`, {
      ...story,
      commentsCount,
      reactionsCount,
      isBookmarked: isStoryBookmarked ? true : false,
    });
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.updateStory = async (req, res) => {
  try {
    const { storyId } = req.body;

    const story = await storyModel.findOne({ _id: storyId }).lean();
    if (!story) return ResponseService.success(res, `story not found`, StatusCode.notFound);

    const result = await storyModel.updateOne({ _id: storyId }, { ...req.body });

    return ResponseService.success(res, `story updated successfully`, story);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.deleteStory = async (req, res) => {
  try {
    const { storyId } = req.body;

    const story = await storyModel.findOne({ _id: storyId }).lean();
    if (!story) return ResponseService.success(res, `Story deleted!!`, result);

    const result = await storyModel.updateOne({ _id: storyId }, { status: "deleted" });

    return ResponseService.success(res, `Story deleted!!`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.reportStory = async (req, res) => {
  try {
    let { storyId, userId, reason } = req.body;

    const isStoryExist = await storyModel.findOne({ _id: storyId }).lean();
    if (!isStoryExist) return ResponseService.failed(res, "Story not found", StatusCode.notFound);

    const isAlreadyReported = await reportedStoryModel
      .findOne({ story: storyId, reporter: userId })
      .lean();
    if (isAlreadyReported)
      return ResponseService.failed(
        res,
        "Already received your feedback, Thankyou!",
        StatusCode.success
      );

    const myReport = { story: storyId, reporter: userId, reason };
    const newReport = new reportedStoryModel(myReport);
    const result = await newReport.save();

    return ResponseService.success(res, "Feedback submitted successfully", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
