const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendNotification = functions.https.onRequest((req, res) => {
  const registrationToken = req.body.token;
  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    token: registrationToken,
  };

  admin.messaging().send(message).then((response) => {
    console.log("Successfully sent message:", response);
    res.send("Successfully sent message");
  })
      .catch((error) => {
        console.log("Error sending message", error);
        res.send("Error sending message");
      });
});
