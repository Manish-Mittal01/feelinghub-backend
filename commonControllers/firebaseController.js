const UserModel = require("../Models/UserModel");
const { ResponseService } = require("../services/responseService");

module.exports.updateFirebaseToken = async (req, res) => {
  try {
    const { firebaseToken, userId } = req.body;

    const result = await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { firebaseToken: firebaseToken } }
    );

    return ResponseService.success(res, "Token added", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
