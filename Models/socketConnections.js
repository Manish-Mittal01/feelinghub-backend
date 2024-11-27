const { Schema, model } = require("mongoose");

const socketConnectionsSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    socketId: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("socket_connections", socketConnectionsSchema);
