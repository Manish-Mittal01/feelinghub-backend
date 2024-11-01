const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");
const UserModel = require("../Models/UserModel");
const reportedUserModel = require("../Models/reportedUserModel");

module.exports.getOtherUserProfile = async (req, res) => {
  try {
    const { otherUserId } = req.body;

    const isUserExist = await UserModel.findOne(
      { _id: otherUserId },
      "name avatar gender bio createdAt "
    ).lean();
    if (!isUserExist) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    return ResponseService.success(res, `User details found`, isUserExist);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.reportUser = async (req, res) => {
  try {
    const { userId, otherUserId, reason, description } = req.body;

    if (otherUserId === userId)
      return ResponseService.failed(res, "You can't report yourself", StatusCode.badRequest);

    const isUserExist = await UserModel.exists({ _id: otherUserId });
    if (!isUserExist) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    const report = { user: otherUserId, reporter: userId, reason, description };
    const newReport = new reportedUserModel(report);
    const result = await newReport.save();

    return ResponseService.success(res, `Thanks for your feedback`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};
