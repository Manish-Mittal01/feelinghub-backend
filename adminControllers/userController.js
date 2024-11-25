const { Types } = require("mongoose");
const User = require("../Models/UserModel");
const { transporter } = require("../config");
const { ResponseService } = require("../services/responseService");
const { StatusCode } = require("../utils/constants");
const reportedUserModel = require("../Models/reportedUserModel");

module.exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, order, orderBy, status, gender, search } = req.body;

    let queryObj = {};
    if (status) {
      queryObj.status = status;
    }
    if (gender) {
      queryObj.gender = gender;
    }
    if (search) {
      queryObj["$or"] = [
        {
          email: { $regex: search || "", $options: "i" },
        },
        {
          name: { $regex: search || "", $options: "i" },
        },
      ];
    }

    let users = await User.find({ ...queryObj })
      .select("-password")
      .skip((page - 1) * limit)
      .sort({ [orderBy]: order })
      .limit(limit)
      .lean();

    const usersCount = await User.countDocuments(queryObj);

    return ResponseService.success(res, "User list found", {
      records: users,
      totalCount: usersCount,
    });
  } catch (error) {
    return ResponseService.serverError(res, error);
  }
};

module.exports.updateUserStatus = async (req, res) => {
  try {
    let { otherUserId, status } = req.body;

    const user = await User.findOne({ _id: otherUserId });
    if (!user) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    const result = await User.updateOne({ _id: user._id }, { status });

    return ResponseService.success(res, "user status updated", result);
  } catch (error) {
    return ResponseService.serverError(res, error);
  }
};

module.exports.getUserReports = async (req, res) => {
  try {
    let { otherUserId, page, limit, order, orderBy } = req.body;

    const user = await User.findOne({ _id: otherUserId });
    if (!user) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    let reports = reportedUserModel
      .find({ user: otherUserId })
      .sort({ [orderBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    let reportsCount = reportedUserModel.countDocuments({ user: otherUserId });

    [reports, reportsCount] = await Promise.all([reports, reportsCount]);

    const result = {
      items: reports,
      totalCount: reportsCount,
    };

    return ResponseService.success(res, "User reports found", result);
  } catch (error) {
    return ResponseService.serverError(res, error);
  }
};

// module.exports.sendEmailToUsers = async (req, res) => {
//   try {
//     let { message, users, title } = req.body;

//     const validationError = checkRequiredFields({ message, users, title });
//     if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

//     if (users === "all") {
//       const allUsers = await User.find().select("email").lean();
//       if (allUsers.length > 0) {
//         users = [];
//         for await (let user of allUsers) {
//           users.push(user.email);
//         }
//       }
//     }

//     users = users.slice(0, 100); // limit to max 100 emails at a time

//     var mailOptions = {
//       from: "Autotitanic <info.autotitanic@gmail.com",
//       bcc: users,
//       subject: title,
//       text: message,
//     };

//     const info = await transporter.sendMail(mailOptions);

//     return ResponseService.success(res, "mail sent successfully!", users);
//   } catch (error) {
//     console.log("error", error);
//     return ResponseService.serverError(res, error, StatusCode.srevrError);
//   }
// };
