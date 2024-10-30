const { Schema, model, Types } = require("mongoose");

const configSchema = Schema(
  {
    logo: {
      type: Schema.Types.Mixed,
      default: {},
    },
    firebase: {
      type: Schema.Types.Mixed,
      default: {},
    },
    socialLogin: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("configs", configSchema);
