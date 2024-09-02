const { Schema, model, Types } = require("mongoose");

const replySchema = Schema(
  {
    story: {
      type: Types.ObjectId,
      required: true,
      ref: "stories",
    },
    response: {
      type: {
        content: String,
        user: {
          type: Types.ObjectId,
          required: true,
          ref: "users",
        },
      },
    },
    hug: {
      type: Types.ObjectId,
      ref: "users",
    },
    replies: {
      type: [
        {
          user: { type: Types.ObjectId, ref: "users", required: true },
          reply: { type: String, required: true },
          createdAt: { type: Date },
          likes: { type: [{ user: Types.ObjectId }], ref: "users", default: [] },
          dislikes: { type: [{ user: Types.ObjectId }], ref: "users", default: [] },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("review", replySchema);
