const { Schema, model, Types } = require("mongoose");
const { storyCategories, storyStatus } = require("../utils/constants");

const storySchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "users",
    },
    category: {
      type: Types.ObjectId,
      ref: "categories",
      required: true,
    },
    media: {
      type: { url: String, type: { type: String }, filename: String },
    },
    anonymousSharing: {
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
    isPrivate: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports.storyModel = model("stories", storySchema);
