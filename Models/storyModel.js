const { Schema, model, Types } = require("mongoose");
const { storyStatus } = require("../utils/constants");

const storySchema = Schema(
  {
    anonymousSharing: {
      type: Boolean,
      required: true,
      default: false,
    },
    category: {
      type: Types.ObjectId,
      ref: "categories",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      default: "active",
      enum: storyStatus,
    },
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports.storyModel = model("stories", storySchema);
