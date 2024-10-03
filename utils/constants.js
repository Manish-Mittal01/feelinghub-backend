module.exports = {
  passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  dateRegex: /^\d{4}-\d{2}-\d{2}$/,
  webName: "Feelinghub",
  webHomePage: `<a href="Feelinghub.in">Feelinghub.in</a>`,
  mailSender: `Feelinghub <no-reply@manishmittal.tech>`,
  storyCategories: [
    "happy",
    "sad",
    "love",
    "angry",
    "irritation",
    "anxiety",
    "information",
    "motivation",
    "success",
  ],
  userStatus: ["inactive", "active", "blocked"],
  storyStatus: ["blocked", "deleted", "active"],
  storyResponseTypes: ["like", "love", "laugh", "support", "information"],
  queryReasons: [
    "suggestionOrFeedback",
    "problemOrComplaint",
    "reportIllegalOrInappropriateContent",
  ],
  queryStatus: ["active", "closed", "resolved"],
  storyReportReasons: ["abusive", "askForMoney", "violence", "hateSpeech", "falseInformation"],
};

module.exports.getMonth = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

module.exports.Status = {
  success: true,
  error: false,
};

module.exports.ReferralBonus = {
  level1: 0.1,
};

module.exports.constantReferralBonus = 500;

module.exports.dailyBonus = 500;

module.exports.StatusCode = {
  success: 200,
  created: 201,
  accepted: 202,
  partialContent: 206,
  badRequest: 400,
  unauthorized: 401,
  paymentRequired: 402,
  forbidden: 403,
  notFound: 404,
  timeout: 408,
  fileTooLarge: 413,
  srevrError: 500,
};

module.exports.TransactionType = {
  deposit: "deposit",
  withdraw: "withdraw",
};

module.exports.TransactionStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};
