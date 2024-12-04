const { Schema, model, version } = require("mongoose");

const chatSchema = Schema(
  {
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: "users", required: true }],
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "messages",
    },
    blockedUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("chats", chatSchema);
