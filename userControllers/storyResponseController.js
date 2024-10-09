const commentReactionsModel = require("../Models/commentReactionModel");
const { storyModel } = require("../Models/storyModel");
const storyReactionsModel = require("../Models/storyReactionsModel");
const { StatusCode } = require("../utils/constants");
const { ResponseService } = require("../services/responseService");
const { sendFirebaseNotification } = require("../firebase/pushNotification");
const { Types } = require("mongoose");

const manageStoryReaction = async (req, res) => {
  try {
    const { storyId, reaction, userId } = req.body;

    const isStoryExist = await storyModel.findOne({ _id: storyId }).lean();
    if (!isStoryExist) return ResponseService.failed(res, "Story not found", StatusCode.notFound);

    const isReactionExist = await storyReactionsModel.findOne({
      story: storyId,
      user: userId,
      reactionType: { $exists: true },
    });

    let result = {};
    if (!isReactionExist) {
      const newReaction = { story: storyId, user: userId, reactionType: reaction };
      const myReaction = new storyReactionsModel(newReaction);
      result = await myReaction.save();
    } else {
      if (isReactionExist.reactionType !== reaction) {
        result = await storyReactionsModel.updateOne(
          { story: storyId, user: userId },
          { $set: { reactionType: reaction } }
        );
      }
    }

    return ResponseService.success(res, "Reaction added!!", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const getReactionsList = async (req, res) => {
  try {
    const { orderBy, order, limit, page, storyId } = req.body;

    const isStoryExist = await storyModel.exists({ _id: storyId });
    if (!isStoryExist) return ResponseService.failed(res, "Story not found", StatusCode.notFound);

    let responses = storyReactionsModel
      .find({ story: storyId, reactionType: { $exists: true } })
      .sort({ [orderBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name avatar gender")
      .lean();

    let responseCount = storyReactionsModel.countDocuments({
      story: storyId,
      reactionType: { $exists: true },
    });

    [responses, responseCount] = await Promise.all([responses, responseCount]);

    return ResponseService.success(res, "Reaction list found", {
      records: responses,
      totalCount: responseCount,
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const addStoryComment = async (req, res) => {
  try {
    const { comment, storyId, userId } = req.body;

    const isStoryExist = await storyModel.findOne({ _id: storyId }).populate("user");
    if (!isStoryExist) return ResponseService.failed(res, "Story not found", StatusCode.notFound);

    const myComment = { comment: comment, user: userId, story: storyId };
    const newComment = new storyReactionsModel(myComment);
    const result = await newComment.save();

    const message = {
      notification: {
        title: "Hello",
        body: "New comment on your story",
      },
      tokens: isStoryExist.user.firebaseToken,
    };

    await sendFirebaseNotification(message);

    return ResponseService.success(res, "Comment added successfully!", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

const getCommentsList = async (req, res) => {
  try {
    const { orderBy, order, limit, page, storyId } = req.body;
    let { userid } = req.headers;
    userid = userid ? Types.ObjectId(userid) : "";

    const isStoryExist = await storyModel.findOne({ _id: storyId });
    if (!isStoryExist) return ResponseService.failed(res, "Story not found", StatusCode.notFound);

    let comments = storyReactionsModel.aggregate([
      { $match: { story: Types.ObjectId(storyId), comment: { $exists: true } } },

      {
        $lookup: {
          from: "commentreactions",
          let: { commentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$comment", "$$commentId"] }, reply: { $exists: true } } },
            { $count: "count" },
          ],
          as: "repliesCount",
        },
      },

      {
        $lookup: {
          from: "commentreactions",
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$comment", "$$commentId"], $eq: ["$reactionType", "like"] },
              },
            },
            { $count: "count" },
          ],

          as: "likesCount",
        },
      },

      {
        $lookup: {
          from: "commentreactions",
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$comment", "$$commentId"], $eq: ["$user", userid] },
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
          repliesCount: { $ifNull: [{ $arrayElemAt: ["$repliesCount.count", 0] }, 0] },
          likesCount: { $ifNull: [{ $arrayElemAt: ["$likesCount.count", 0] }, 0] },
          myReaction: { $ifNull: [{ $arrayElemAt: ["$myReaction.reactionType", 0] }, null] },
        },
      },

      {
        $lookup: {
          from: "commentreactions",
          let: { commentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$comment", "$$commentId"] }, reply: { $exists: true } } },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                pipeline: [{ $project: { name: 1, avatar: 1, gender: 1 } }],
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
          ],
          as: "replies",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1, avatar: 1, gender: 1 } }],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      { $sort: { [orderBy]: order } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    let totalCount = storyReactionsModel.countDocuments({
      story: storyId,
      comment: { $exists: true },
    });

    [comments, totalCount] = await Promise.all([comments, totalCount]);

    return ResponseService.success(res, "Comments list found", { records: comments, totalCount });
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const addCommentReply = async (req, res) => {
  try {
    const { commentId, reply, userId } = req.body;

    const isCommentExist = await storyReactionsModel.findOne({
      _id: commentId,
      comment: { $exists: true },
    });
    if (!isCommentExist) {
      return ResponseService.failed(res, "Comment not found", StatusCode.notFound);
    }

    const myReply = { comment: commentId, user: userId, reply };
    const newReply = new commentReactionsModel(myReply);
    const result = await newReply.save();

    return ResponseService.success(res, `Reply added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

const getRepliesList = async (req, res) => {
  try {
    const { commentId, limit, page, order, orderBy } = req.body;

    const isCommentExist = await storyReactionsModel.findOne({
      _id: commentId,
      comment: { $exists: true },
    });
    if (!isCommentExist)
      return ResponseService.failed(res, "Comment not found", StatusCode.notFound);

    const repliesList = await commentReactionsModel
      .find({
        comment: commentId,
        reply: { $exists: true },
      })
      .sort({ [orderBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name gender avatar")
      .lean();

    const repliesCount = await commentReactionsModel.countDocuments({
      comment: commentId,
      reply: { $exists: true },
    });

    const response = {
      records: repliesList || [],
      totalCount: repliesCount,
    };

    return ResponseService.success(res, "Replies list found", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const manageCommentReaction = async (req, res) => {
  try {
    const { commentId, reaction, userId } = req.body;

    const isCommentExist = await storyReactionsModel.findOne({
      _id: commentId,
      comment: { $exists: true },
    });
    if (!isCommentExist)
      return ResponseService.failed(res, "Comment not found", StatusCode.notFound);

    const isReactionExist = await commentReactionsModel.exists({
      comment: commentId,
      user: userId,
      reactionType: { $exists: true },
    });

    let result = {};
    if (isReactionExist) {
      result = await commentReactionsModel.deleteOne({
        comment: commentId,
        user: userId,
        reactionType: { $exists: true },
      });
    } else {
      const myReaction = { comment: commentId, reactionType: reaction, user: userId };
      const newReaction = new commentReactionsModel(myReaction);
      result = await newReaction.save();
    }

    return ResponseService.success(res, "Reaction added", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

const getUserCommentsAndRepliesList = async (req, res) => {
  try {
    const { limit, page, order, orderBy, userId } = req.body;

    const comments = await commentReactionsModel
      .find({ $or: [{ user: userId }, { "replies.$.user": userId }] })
      .sort({ [orderBy]: order, ["repl.craeed"]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const results = await storyReactionsModel.aggregate([
      {
        $unionWith: {
          coll: commentReactionsModel,
          pipeline: [],
        },
      },
      {
        $match: {
          $or: [{ comment: { $exists: true } }, { reply: { $exists: true } }],
        },
      },
      {
        $sort: { [orderBy]: order },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const response = {
      items: results || [],
    };

    return ResponseService.success(res, "Replies list found", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports = {
  manageStoryReaction,
  getReactionsList,
  addStoryComment,
  getCommentsList,
  addCommentReply,
  getRepliesList,
  manageCommentReaction,
  getUserCommentsAndRepliesList,
};
