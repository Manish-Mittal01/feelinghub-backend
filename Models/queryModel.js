const { Schema, model } = require("mongoose");
const { queryReasons, queryStatus } = require("../utils/constants");

const querySchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: queryReasons,
    },
    comment: {
      type: String,
      required: true,
    },
    file: {
      type: String,
    },
    status: {
      type: String,
      enum: queryStatus,
      default: "active",
    },
    replies: {
      type: [{ title: String, body: String }],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("query", querySchema);
