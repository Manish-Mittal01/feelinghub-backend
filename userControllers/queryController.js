const queryModel = require("../Models/queryModel");
const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");

module.exports.addQuery = async (req, res) => {
  try {
    const { name, mobile, email, reason, comment, file } = req.body;

    const query = new queryModel({ name, mobile, email, reason, comment, file });
    const result = await query.save();

    return ResponseService.success(res, `Query added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.updateQuery = async (req, res) => {
  try {
    const { reply, status, queryId } = req.body;

    const isQueryExist = await queryModel.findOne({ _id: queryId });
    if (!isQueryExist) return ResponseService.failed(res, "Query not found", StatusCode.notFound);

    const result = await queryModel.updateOne(
      { _id: queryId },
      {
        $set: {
          status,
          replies: { $push: reply },
        },
      }
    );

    return ResponseService.success(res, `Query updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};
