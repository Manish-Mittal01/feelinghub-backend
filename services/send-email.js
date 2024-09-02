const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const otpModel = require("../Models/otpModel");
const { transporter } = require("../config");

module.exports.sendEmail = async (getMailOptions, email, sendOtp = false) => {
  try {
    if (!email || !getMailOptions) throw new Error("email or mailOptions not found");

    let mailOptions = {};
    if (sendOtp) {
      const OTP = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const otp = new otpModel({ email: email, otp: OTP });
      const salt = await bcrypt.genSalt(10);
      otp.otp = await bcrypt.hash(otp.otp, salt);
      const result = await otp.save();

      mailOptions = getMailOptions(OTP);
    } else {
      mailOptions = getMailOptions();
    }

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log("error", error?.message);
    throw new Error(error);
  }
};
