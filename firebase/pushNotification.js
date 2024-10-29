const firebaseAdmin = require("firebase-admin");
const { firebaseServiceAccount: serviceAccount } = require("./config");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const sendFirebaseNotifications = async (message = {}) => {
  if (!message.notification || message.tokens?.length <= 0) return "";

  try {
    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
    // console.log("Notification sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { firebase: firebaseAdmin, sendFirebaseNotifications };
