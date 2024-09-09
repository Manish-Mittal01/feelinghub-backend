const { Schema, model, Types } = require("mongoose");

const commentReactionsSchema = Schema(
  {
    comment: { type: Types.ObjectId, required: true, ref: "stories" },
    user: { type: Types.ObjectId, ref: "users", required: true },
    reactionType: { type: String, enum: ["like", "dislike"] },
    reply: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("commentReactions", commentReactionsSchema);
