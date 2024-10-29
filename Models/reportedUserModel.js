const { Schema, model, Types } = require("mongoose");
const { userReportReasons } = require("../utils/constants");

const reportedUsersSchema = Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    reporter: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    reason: { type: String, required: true, enum: userReportReasons },
    description: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("reportedUsers", reportedUsersSchema);
