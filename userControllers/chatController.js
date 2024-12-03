const { ResponseService } = require("../services/responseService");
const chats = require("../Models/chats");
const messages = require("../Models/messages");

module.exports.getChatList = async (req, res) => {
  try {
    const { page, limit, order, orderBy, search, userId } = req.body;

    let chatList = chats.aggregate([
      { $match: { users: userId } },
      {
        $lookup: {
          from: "messages",
          let: { lastMessage: "$lastMessage" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$lastMessage"] } } },
            { $project: { message: 1, createdAt: 1, updatedAt: 1 } },
          ],
          as: "lastMessage",
        },
      },
      { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          otherUser: {
            $filter: {
              input: "$users",
              as: "otherUser",
              cond: { $ne: ["$$otherUser", userId] },
            },
          },
        },
      },
      { $unwind: { path: "$otherUser", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "socket_connections",
          let: { otherUserId: "$otherUser" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user", "$$otherUserId"] } } },
            { $project: { _id: 1 } },
          ],
          as: "isOnline",
        },
      },
      { $unwind: { path: "$isOnline", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          let: { otherUserId: "$otherUser" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$otherUserId"] } } },
            { $project: { name: 1, email: 1, gender: 1, avatar: 1, bio: 1 } },
          ],
          as: "otherUser",
        },
      },
      { $unwind: { path: "$otherUser", preserveNullAndEmptyArrays: true } },

      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    let totalCount = chats.countDocuments({ users: userId });
    [chatList, totalCount] = await Promise.all([chatList, totalCount]);

    const result = {
      records: chatList,
      totalCount,
    };

    return ResponseService.success(res, "User chats found successfully", result, 200);
  } catch (error) {
    return ResponseService.serverError(res, error);
  }
};

module.exports.getMessageHistory = async (req, res) => {
  try {
    const { page, limit, order, orderBy, userId, chatId } = req.body;

    let messageHistory = messages
      .find({ chat: chatId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("receiver");

    let totalCount = messages.countDocuments({ chat: chatId });
    [messageHistory, totalCount] = await Promise.all([messageHistory, totalCount]);

    const result = {
      records: messageHistory,
      totalCount,
    };

    return ResponseService.success(res, "User messages found successfully", result, 200);
  } catch (error) {
    return ResponseService.serverError(res, error);
  }
};
