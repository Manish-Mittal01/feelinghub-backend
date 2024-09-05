const { Schema, model, Types } = require("mongoose");
const { storyResponseTypes } = require("../utils/constants");

const storyReactionsSchema = Schema(
  {
    story: { type: Types.ObjectId, required: true, ref: "stories" },
    user: { type: Types.ObjectId, ref: "users", required: true },
    reactionType: { type: String, enum: storyResponseTypes },
    comment: String,
  },
  { timestamps: true, versionKey: false }
);

storyReactionsSchema.index({ story: 1 });
storyReactionsSchema.index({ comment: 1 });
storyReactionsSchema.index({ user: 1 });
storyReactionsSchema.index({ reactionType: 1 });

module.exports = model("storyReactions", storyReactionsSchema);
