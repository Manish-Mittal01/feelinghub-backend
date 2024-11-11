const { Schema, model, Types } = require("mongoose");

const storyViewsSchema = Schema({
  story: { type: Types.ObjectId, required: true, ref: "stories" },
  user: { type: Types.ObjectId, ref: "users" },
  viewsCount: { type: Number, required: true, default: 0 },
});

storyViewsSchema.index({ story: 1, user: 1 });

module.exports = model("storyViews", storyViewsSchema);
