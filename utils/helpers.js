const allowedOrigins = ["http://localhost:3000", "https://feelinghub.in"];

const getCorsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);

  if (allowedOrigins.includes(origin)) {
    callback(null, true); // Allow the origin
  } else {
    callback(new Error("Not allowed by CORS")); // Reject the origin
  }
};

module.exports = { getCorsOrigin };
