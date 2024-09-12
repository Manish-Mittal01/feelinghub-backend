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

    const storiesListPipeline = [
      { $match: { user: userId } },
      {
        $lookup: {
          from: "stories",
          localField: "story",
          foreignField: "_id",
          as: "story",
        },
      },
      {
        $unwind: {
          path: "$story",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "storyreactions",
          let: { storyId: "$story._id" },
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
        $lookup: {
          from: "storyreactions",
          let: { storyId: "$story._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$story", "$$storyId"] }, { $eq: ["$user", userId] }],
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
        $addFields: {
          "story.reactionsCount": { $ifNull: [{ $arrayElemAt: ["$reactionsCount.count", 0] }, 0] },
          "story.myReaction": {
            $ifNull: [{ $arrayElemAt: ["$myReaction.reactionType", 0] }, null],
          },
          "story.isBookmarked": true,
        },
      },

      {
        $lookup: {
          from: "users",
          let: { userId: "$story.user", showUserDetails: "$story.anonymousSharing" },
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
          as: "story.user",
        },
      },
      {
        $unwind: {
          path: "$story.user",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "story.category",
          foreignField: "_id",
          as: "story.category",
        },
      },
      {
        $unwind: {
          path: "$story.category",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $project: { story: 1 } },
      { $sort: { [orderBy]: order } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    let stories = bookmarkModel.aggregate(storiesListPipeline);
    let totalCount = bookmarkModel.countDocuments({ user: userId });

    [stories, totalCount] = await Promise.all([stories, totalCount]);

    const response = {
      records: stories,
      totalCount: totalCount,
    };

    return ResponseService.success(res, "Bookmark list found", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
