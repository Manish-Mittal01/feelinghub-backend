const { ResponseService } = require("../services/responseService");
const chats = require("../Models/chats");
const messages = require("../Models/messages");

module.exports.getChatList = async (req, res) => {
  try {
    const { page, limit, order, orderBy, userId } = req.body;

    let chatList = chats
      .find({ users: userId })
      .sort({ updatedAt: -1 })
      .populate("users lastMessage");
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
