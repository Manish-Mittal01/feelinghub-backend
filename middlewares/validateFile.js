const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");
const multer = require("multer");
const { upload } = require("../utils/multer-storage");

module.exports.validateFile = async (req, res, next) => {
  try {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return ResponseService.failed(
            res,
            "File size can be maximum 2MB",
            StatusCode.fileTooLarge
          );
        }
        return ResponseService.failed(res, err, StatusCode.badRequest);
      } else if (err) {
        return ResponseService.serverError(res, err);
      }
      next();
    });
  } catch (error) {
    console.log("validateFile error", error);
    ResponseService.serverError(res, error);
  }
};
