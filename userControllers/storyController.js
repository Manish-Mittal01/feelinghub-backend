const { StatusCode } = require("../utils/constants");
const { ResponseService } = require("../services/responseService");
const { storyModel } = require("../Models/storyModel");
const reportedStoryModel = require("../Models/reportedStoryModel");
const storyReactionsModel = require("../Models/storyReactionsModel");
const bookmarkmodel = require("../Models/bookmarkmodel");
const { Types } = require("mongoose");

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
    const { page, limit, order, orderBy, listType, user } = req.body;
    let { userid } = req.headers;
    userid = userid ? Types.ObjectId(userid) : null;

    const filters = {};
    const filterValues = ["status", "category", "isPrivate", "anonymousSharing"];

    for (let filterKey of filterValues) {
      if (req.body[filterKey]?.toString()) {
        filters[filterKey] = req.body[filterKey];
      }
    }

    if (listType === "user" || listType === "others") {
      filters.user = user;
    } else if (listType === "main") {
      filters.status = "active";
      filters.isPrivate = false;
    }

    const storiesListPipeline = [
      { $match: filters },
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
            { $project: { name: 1, avatar: 1, gender: 1 } },
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

      {
        $lookup: {
          from: "storyviews",
          let: { storyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$story", "$$storyId"] }],
                },
              },
            },
            {
              $group: {
                _id: null,
                viewsCount: { $sum: "$viewsCount" },
              },
            },
          ],
          as: "viewsCount",
        },
      },
      {
        $set: {
          viewsCount: { $ifNull: [{ $arrayElemAt: ["$viewsCount.viewsCount", 0] }, 0] },
        },
      },

      { $sort: { [orderBy]: order } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    if (listType === "main" || listType === "others") {
      storiesListPipeline.splice(
        2,
        0,
        {
          $lookup: {
            from: "storyreactions",
            let: { storyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$story", "$$storyId"] }, { $eq: ["$user", userid] }],
                  },
                  reactionType: { $exists: true },
                },
              },
              { $limit: 1 },
            ],
            as: "myReaction",
          },
        },

        {
          $lookup: {
            from: "bookmarks",
            let: { storyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$story", "$$storyId"] }, { $eq: ["$user", userid] }],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "isBookmarked",
          },
        },
        {
          $addFields: {
            isBookmarked: { $ifNull: [{ $arrayElemAt: ["$isBookmarked", 0] }, false] },
            myReaction: { $ifNull: [{ $arrayElemAt: ["$myReaction.reactionType", 0] }, null] },
          },
        }
      );
    }

    let stories = storyModel.aggregate(storiesListPipeline);
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
    let myReaction = "";
    if (userid) {
      isStoryBookmarked = bookmarkmodel.exists({ story: storyId, user: userid }).lean();
      myReaction = storyReactionsModel
        .findOne({ story: storyId, user: userid, reactionType: { $exists: true } })
        .lean();
    }

    [story, commentsCount, reactionsCount, isStoryBookmarked, myReaction] = await Promise.all([
      story,
      commentsCount,
      reactionsCount,
      isStoryBookmarked,
      myReaction,
    ]);

    if (!story) return ResponseService.success(res, `story not found`, StatusCode.notFound);

    return ResponseService.success(res, `story details found successfully`, {
      ...story,
      commentsCount,
      reactionsCount,
      isBookmarked: isStoryBookmarked ? true : false,
      myReaction: myReaction?.reactionType || "",
    });
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.updateStory = async (req, res) => {
  try {
    const { storyId } = req.body;

    const story = await storyModel.exists({ _id: storyId });
    if (!story) return ResponseService.success(res, `story not found`, StatusCode.notFound);

    const result = await storyModel.updateOne({ _id: storyId }, { ...req.body });

    return ResponseService.success(res, `story updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.deleteStory = async (req, res) => {
  try {
    const { storyId, userId } = req.body;

    const story = await storyModel.exists({ _id: storyId, user: userId });
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
    let { storyId, userId, reason, description } = req.body;

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

    const myReport = { story: storyId, reporter: userId, reason, description };
    const newReport = new reportedStoryModel(myReport);
    const result = await newReport.save();

    return ResponseService.success(res, "Feedback submitted successfully", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
