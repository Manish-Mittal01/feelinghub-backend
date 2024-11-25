const { Schema, model } = require("mongoose");

const messageSchema = Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "chats",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("messages", messageSchema);
