const admin = require('firebase-admin');

// You'd normally get this from your Firebase project settings
const serviceAccount = require('path/to/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://<YOUR-DATABASE-NAME>.firebaseio.com'
});

const sendNotification = (fcmToken, messageData) => {
    const message = {
        data: messageData,
        token: fcmToken
    };

    return admin.messaging().send(message);
};

module.exports = {
    sendNotification
};
