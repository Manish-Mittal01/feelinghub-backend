const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");
const UserModel = require("../Models/UserModel");

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
