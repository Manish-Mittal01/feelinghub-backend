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

class SocketResponse {
  static success(cb, message, data = {}) {
    if (cb) {
      return cb({ status: true, message, ...data });
    }
  }

  static failed(cb, error, data = {}) {
    if (cb) {
      return cb({
        status: false,
        message: error?.message || error || "Internal server error",
        ...data,
      });
    }
  }
}

module.exports = { ResponseService, SocketResponse };
