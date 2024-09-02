const { Schema, model } = require("mongoose");

const bookmarkSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    story: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "stories",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("bookmarks", bookmarkSchema);
