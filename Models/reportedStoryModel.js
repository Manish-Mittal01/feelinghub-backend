const { Schema, model, Types } = require("mongoose");
const { storyReportReasons } = require("../utils/constants");

const reportedStoriesSchema = Schema(
  {
    story: {
      type: Types.ObjectId,
      ref: "stories",
      required: true,
    },
    reporter: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    reason: { type: String, required: true, enum: storyReportReasons },
    description: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("reportedStories", reportedStoriesSchema);
