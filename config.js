const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "no-reply@manishmittal.tech",
    pass: "Mittal@938",
  },
});

// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "info.autotitanic@gmail.com",
//     pass: "ggmc gdbc zpyh kdhy",
//   },
// });

module.exports = { transporter };
