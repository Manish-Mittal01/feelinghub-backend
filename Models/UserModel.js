const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    birth_date: {
      type: String,
    },
    address: {
      type: String,
    },
    avatar: {
      type: String,
    },
    accessToken: {
      type: [String],
      default: [],
    },
    firebaseToken: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["inactive", "active", "blocked"],
      default: "inactive",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      mobile: this.mobile,
      email: this.email,
    },
    process.env.JWT_SECRET_KEY
    // { expiresIn: "7d" }
  );
  return token;
};

module.exports = model("users", userSchema);