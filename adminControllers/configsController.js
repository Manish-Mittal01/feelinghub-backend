const configModel = require("../Models/configModel");
const { ResponseService } = require("../services/responseService");

module.exports.updateConfigs = async (req, res) => {
  try {
    const { userId } = req.body;

    const configs = new configModel({ ...req.body, lastUpdatedBy: userId });
    const result = await configs.save();

    return ResponseService.success(res, "Configs updated successfully", result);
  } catch (error) {
    console.log("error updating config", error);
    return ResponseService.serverError(res, error);
  }
};
