const firebaseAdmin = require("firebase-admin");
const { firebaseServiceAccount: serviceAccount } = require("./config");
const { ResponseService } = require("../services/responseService");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const sendFirebaseNotifications = async (req, res) => {
  const message = {
    notification: {
      title: "Hello",
      body: "New comment on your story",
    },
    webpush: {
      notification: {
        icon: "https://ui-avatars.com/api/?name=First%20Last",
        // click_action: "https://feelinghub.in", // URL to open on click
      },
      fcmOptions: {
        link: "https://feelinghub.in", // Works similarly to click_action
      },
    },
    tokens: [
      "crbWyetVQGTZ3uWeRVIkax:APA91bGBAXYr3t8mh9et8s2yW25FxOcXT1l6eUgywx9aUXTw9YSKJqzfZQubfKtoMmhhcEGhdAidlttK51fpGtLYi_iamHd_dLVj348LoYhRQJiFd874uOY",
      "eZqgM4f-zcVNJ43xWBYJv0:APA91bHGJQQFipE2OvjgWiKWJBthfcXsWxkmizvhmW0TOzA3KD9FQUwKR2cdQzWl2egMmLVbFQ1-R6nMFB4d3oaC2qhg1z71tm_e8Y7AX5yCatn_S2uGby8PnHhOlijOBgRxcjo26bA6",
    ],
  };

  // if (!message.notification || message.tokens?.length <= 0) return "";

  try {
    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
    // console.log("Notification sent:", response);
    return ResponseService.success(res, "notification sent", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports = { firebase: firebaseAdmin, sendFirebaseNotifications };
