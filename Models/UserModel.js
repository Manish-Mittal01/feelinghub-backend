const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = Schema(
  {
    accessToken: {
      type: [String],
      default: [],
    },
    address: {
      type: String,
    },
    avatar: {
      type: {
        url: String,
        name: String,
      },
      default: {},
    },
    birth_date: {
      type: String,
    },
    bio: {
      type: String,
      required: true,
      default: "I love FeelingHub",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firebaseToken: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    mobile: {
      type: String,
      // required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
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
