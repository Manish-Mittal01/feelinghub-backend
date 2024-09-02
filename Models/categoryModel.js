const { Schema, model } = require("mongoose");

const categorySchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    iconRegular: {
      type: String,
      required: true,
    },
    iconFilled: {
      type: String,
      required: true,
    },
  },
  { timestamps: false, versionKey: false }
);

module.exports = model("categories", categorySchema);
