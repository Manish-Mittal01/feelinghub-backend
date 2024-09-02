const { Status } = require("../utils/constants");

class ResponseService {
  static success(res, message, data, code = 200) {
    res.status(code).send({
      status: Status.success,
      statusCode: code,
      message: message,
      data: data,
    });
  }

  static failed(res, error, code = 404) {
    res.status(code).send({
      status: Status.error,
      statusCode: code,
      message: error?.message || error,
    });
  }
  static serverError(res, error, code = 500) {
    res.status(code).send({
      status: Status.error,
      statusCode: code,
      message: error.message || error || "Internal server error",
    });
  }
}

module.exports.ResponseService = ResponseService;
