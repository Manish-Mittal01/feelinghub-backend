const firebase = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const sendFirebaseNotification = async (message) => {
  firebase
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      console.log("Notification sent:", response);
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
    });
};

module.exports = { firebase, sendFirebaseNotification };
