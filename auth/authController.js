const bcrypt = require("bcrypt");
const { getStorage, ref, deleteObject } = require("firebase/storage");
const UserModel = require("../Models/UserModel");
const otpModel = require("../Models/otpModel");
const { StatusCode, mailSender, webHomePage, webName } = require("../utils/constants");
const { sendEmail } = require("../services/send-email");
const { ResponseService } = require("../services/responseService");

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      gender = "",
      birth_date = "",
      avatar = {},
      bio,
    } = req.body;

    const userExist = await UserModel.findOne({ $or: [{ email }, { mobile }] });

    if (userExist && userExist.status === "active")
      return ResponseService.failed(res, "User already exist", StatusCode.forbidden);
    if (userExist && userExist.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.forbidden);

    const getMailOptions = (OTP) => {
      return {
        from: mailSender,
        to: email,
        subject: "Verify email",
        html: `<p style="font-size: 16px;">
          Use this otp ${OTP} to verify your email on ${webHomePage}
          </p>`,
      };
    };

    const otpResponse = await sendEmail(getMailOptions, email, true);

    const salt = await bcrypt.genSalt(8);
    const encryptPassword = await bcrypt.hash(password, salt);
    const user = new UserModel({ ...req.body, avatar: avatar || {} });
    user.password = encryptPassword;

    let result = {};
    if (userExist && userExist.status === "inactive") {
      result = await UserModel.updateOne(
        { email },
        { name, mobile, password: encryptPassword, gender, birth_date, avatar: avatar || {}, bio }
      );
    } else {
      result = await user.save();
    }

    return ResponseService.success(res, "Verification mail sent!", result);
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.serverError(res, error);
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const userExist = await UserModel.findOne({ email });
    if (!userExist) return ResponseService.failed(res, "Email not registered", StatusCode.notFound);

    if (userExist && userExist.status === "active")
      return ResponseService.failed(res, "Email already verified", StatusCode.badRequest);

    if (userExist && userExist.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.badRequest);

    const getMailOptions = (OTP) => {
      return {
        from: mailSender,
        to: email,
        subject: "Verify email",
        html: `<p style="font-size: 16px;">
        Use this otp ${OTP} to verify your email on ${webHomePage}
         </p>`,
      };
    };

    const otpResponse = await sendEmail(getMailOptions, email, true);

    return ResponseService.success(res, "OTP sent!", {});
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.serverError(res, error);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let otpHolder = await otpModel.find({ email: email }).lean();
    if (otpHolder.length === 0)
      return ResponseService.failed(res, "Invalid OTP", StatusCode.badRequest);

    const validOtp = otpHolder.pop();
    const isOtpValid = await bcrypt.compare(otp, validOtp.otp);

    if (!isOtpValid) return ResponseService.failed(res, "Invalid otp", StatusCode.badRequest);

    const result = await UserModel.updateOne({ email: email }, { status: "active" });

    const otpDelete = await otpModel.deleteMany({
      email: validOtp.email,
    });

    return ResponseService.success(res, "Email verified!");
  } catch (error) {
    console.log("verify email error", error);
    return ResponseService.serverError(res, error);
  }
};

const getUserInfoFromTGoogleToken = async (token) => {
  return fetch(
    `https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,genders,phoneNumbers,birthdays`,
    {
      headers: {
        Authorization: token,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch((err) => console.log(err));
};

const login = async (req, res) => {
  try {
    let { email, password, token, loginType } = req.body;
    let accessToken = "";
    let userData = {};
    let result = {};

    if (token && loginType === "google") {
      userData = await getUserInfoFromTGoogleToken(token);
      email = userData.emailAddresses[0]?.value;
    }

    const birth_date = userData.birthdays
      ? `${userData.birthdays[0]?.date?.year}-${userData.birthdays[0]?.date?.month}-${userData.birthdays[0]?.date?.day}`
      : "";

    const isUserExist = await UserModel.findOne({ email });

    if (!isUserExist && loginType === "google") {
      const user = {
        name: userData.names[0]?.displayName,
        email,
        birth_date,
        status: "active",
      };

      const newUser = new UserModel(user);
      result = await newUser.save();
    }

    if (!isUserExist && loginType === "normal")
      return ResponseService.failed(res, "User not Found", StatusCode.notFound);
    if (isUserExist && isUserExist.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.unauthorized);
    if (isUserExist && isUserExist.status === "inactive") {
      return ResponseService.failed(res, "Verify email to login", StatusCode.forbidden);
    }

    if (loginType === "normal") {
      const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password);
      if (!isPasswordCorrect) {
        return ResponseService.failed(res, "Incorrect Email or Password", StatusCode.unauthorized);
      }
      accessToken = isUserExist.generateJWT(isUserExist);
    } else {
      accessToken = (isUserExist || result).generateJWT(isUserExist);
    }

    await UserModel.updateOne({ email }, { $push: { accessToken: accessToken } });
    return ResponseService.success(res, "Login Successfull!!", {
      token: accessToken,
      userId: (isUserExist || result)._id,
    });
  } catch (error) {
    console.log("error in login controller", error);
    return ResponseService.serverError(res, error);
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const userExist = await UserModel.findOne({ email });
    if (!userExist) return ResponseService.failed(res, "Email not registered", StatusCode.notFound);

    if (userExist && userExist.status === "inactive")
      return ResponseService.failed(res, "User does not exist", StatusCode.notFound);
    if (userExist && userExist.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.forbidden);

    const getMailOptions = (OTP) => {
      return {
        from: mailSender,
        to: email,
        subject: "Verify email",
        html: `<p style="font-size: 16px;">
        Use this otp ${OTP} to reset your password on ${webHomePage}
         </p>`,
      };
    };

    const otpResponse = await sendEmail(getMailOptions, email, true);

    return ResponseService.success(res, "OTP sent!", {});
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.serverError(res, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const userExist = await UserModel.findOne({ email });
    if (!userExist) return ResponseService.failed(res, "Email not registered", StatusCode.notFound);
    if (userExist && userExist.status === "inactive")
      return ResponseService.failed(res, "User does not exist", StatusCode.notFound);
    if (userExist && userExist.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.forbidden);

    const otpHolder = await otpModel.find({ email }).lean();
    if (otpHolder.length === 0)
      return ResponseService.failed(res, "OTP Expired or invalid", StatusCode.badRequest);

    const rightOtpFind = otpHolder.pop();
    const validOtp = await bcrypt.compare(otp, rightOtpFind.otp);
    if (!validOtp) return ResponseService.failed(res, "Invalid Otp", StatusCode.badRequest);

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(password, salt);
    const result = await UserModel.updateOne({ email: email }, { password: newPassword });

    const otpDelete = await otpModel.deleteMany({
      email: rightOtpFind.email,
    });

    return ResponseService.success(res, "Password updated!!");
  } catch (error) {
    console.log("error", error);
    ResponseService.serverError(res, error);
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await UserModel.findOne({ _id: userId });
    if (!user) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    ResponseService.success(res, "User found!!", user);
  } catch (error) {
    console.log("error", error);
    ResponseService.serverError(res, error);
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      mobile,
      gender,
      birth_date,
      address,
      avatar = {},
      bio,
      userId,
      userDetails,
    } = req.body;

    if (userDetails.avatar?.name) {
      const storage = getStorage();
      const desertRef = ref(storage, `${webName}/${userDetails.avatar?.name}`);
      deleteObject(desertRef)
        .then()
        .catch((err) => console.log("error deleteing user image", err));
    }

    const result = await UserModel.updateOne(
      { _id: userId },
      { name, mobile, gender, birth_date, avatar: avatar || {}, address, bio }
    );

    return ResponseService.success(res, "User updated successfully", result);
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.serverError(res, error);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, password, userId } = req.body;

    const user = await UserModel.findOne({ _id: userId });

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect)
      return ResponseService.failed(res, "incorrect old password", StatusCode.badRequest);

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(password, salt);
    const result = await UserModel.updateOne({ _id: userId }, { password: newPassword });

    ResponseService.success(res, "Password updated!!", result);
  } catch (error) {
    console.log("error", error);
    ResponseService.serverError(res, error);
  }
};

const logout = async (req, res) => {
  try {
    let token = req.headers.authorization;
    token = token.replace("Bearer ", "");
    const { userId } = req.body;

    const result = await UserModel.updateOne({ _id: userId }, { $pull: { accessToken: token } });

    ResponseService.success(res, "Logout success!!", result);
  } catch (error) {
    console.log("error", error);
    ResponseService.serverError(res, error);
  }
};

module.exports = {
  register,
  resendOtp,
  verifyEmail,
  login,
  sendOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
  logout,
};
