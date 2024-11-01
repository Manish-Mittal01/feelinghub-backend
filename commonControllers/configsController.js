const configModel = require("../Models/configModel");
const { ResponseService } = require("../services/responseService");

module.exports.getConfigs = async (req, res) => {
  try {
    const configs = await configModel.find().sort({ createdAt: -1 }).limit(1).lean();
    return ResponseService.success(res, "Categories found!!", configs[0] || {});
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
