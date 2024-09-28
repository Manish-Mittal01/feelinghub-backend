const jwt = require("jsonwebtoken");
const UserModel = require("../Models/UserModel");
const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");

module.exports.authCheck = async (req, res, next) => {
  try {
    const { requestBy } = req.body;
    if (requestBy && requestBy === "admin") {
      staffCheck();
    }

    let token = req.headers.authorization;
    let userId = req.headers.userid;
    token = token?.replace("Bearer ", "");

    if (!token) return ResponseService.failed(res, "Token is required", StatusCode.badRequest);

    let user = {};
    try {
      const decoded = await verifyToken(token);
      if (userId !== decoded._id) {
        return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
      }
      user = decoded;
    } catch (err) {
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
    }

    const existingUser = await UserModel.findOne(
      { _id: user._id },
      "status accessToken avatar email"
    ).lean();

    if (!existingUser) return ResponseService.failed(res, "User not found", StatusCode.notFound);
    if (existingUser && existingUser.status === "inactive")
      return ResponseService.failed(res, "Please verify your email!!", StatusCode.forbidden);
    if (existingUser && existingUser.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.forbidden);

    if (!existingUser.accessToken?.includes(token))
      return ResponseService.failed(res, "Unautorized", StatusCode.unauthorized);

    const request = req;
    request.body = { ...request.body, userId: existingUser._id, userDetails: existingUser };
    next();
  } catch (error) {
    console.log("validate user Token error", error);
    ResponseService.serverError(res, error);
  }
};

module.exports.staffCheck = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    let userId = req.headers.userid;
    token = token?.replace("Bearer ", "");

    if (!token) return ResponseService.failed(res, "Token is required", StatusCode.badRequest);

    let user = {};
    try {
      const decoded = await verifyToken(token);
      if (userId !== decoded._id) {
        return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
      }
      user = decoded;
    } catch (err) {
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
    }

    const existingUser = await UserModel.findOne({ _id: user._id }).lean();

    if (!existingUser) return ResponseService.failed(res, "User not found", StatusCode.notFound);
    if (existingUser && existingUser.status === "inactive")
      return ResponseService.failed(res, "Please verify your email!!", StatusCode.forbidden);
    if (existingUser && existingUser.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.forbidden);

    if (!existingUser.accessToken?.includes(token))
      return ResponseService.failed(res, "Unautorized", StatusCode.unauthorized);

    const request = req;
    request.body = {
      ...request.body,
      userId: existingUser._id?.toString(),
      userDetails: existingUser,
    };
    next();
  } catch (error) {
    console.log("validateStaffToken error", error);
    ResponseService.serverError(res, error);
  }
};

const verifyToken = (token) => {
  try {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if (error) {
          return reject(error);
        }
        resolve(decoded);
      });
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};
