const { Schema, model } = require("mongoose");

const faqSchema = Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("faqs", faqSchema);
