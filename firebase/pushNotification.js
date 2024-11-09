const firebaseAdmin = require("firebase-admin");
const { firebaseServiceAccount: serviceAccount } = require("./config");
const { ResponseService } = require("../services/responseService");
const UserModel = require("../Models/UserModel");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const triggerNotifications = async (message = {}) => {
  if (!message.data || message.tokens?.length <= 0) return "";

  try {
    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const sendFirebaseNotification = async (req, res) => {
  try {
    const { title, body } = req.body;

    const allUsers = await UserModel.find({}).select("firebaseToken");

    let tokens = [];
    for await (let user of allUsers) {
      tokens.push(...(user.firebaseToken || []));
    }

    const topicResponse = await firebaseAdmin
      .messaging()
      .subscribeToTopic(tokens.filter(Boolean), "allUsersMessage");

    const message = {
      data: { title, body },
      // notification: { title, body },
      webpush: { fcmOptions: { link: process.env.WEB_HOME_URL } },
      topic: "allUsers",
    };

    const response = await firebaseAdmin.messaging().send(message);

    return ResponseService.success(res, "Notification sent", topicResponse);
  } catch (error) {
    console.error("Error sending notification:", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports = { firebase: firebaseAdmin, triggerNotifications, sendFirebaseNotification };
