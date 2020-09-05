const admin = require('firebase-admin');

var serviceAccount = require('./thesis-firebase-project-firebase-adminsdk-l3ifz-c6f0420d17.json');

const app_firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://thesis-firebase-project.firebaseio.com"
});

// const token_1132 = 'dlJxd827RfaJ3rj-PAsv_Q:APA91bFFA23TKUE72kLyDV34MG3MXvKO2Nr3DN6VEyPmdmXI2exvDRhDh26FbamvB2aCzsBfKzJBpM7hA6dC2YJK7VB2wrh3Xyah2MgW8AXBpKBCXExm8dlapv4SXR3yl-tYldn-5A_7';
// const payload = {
//     token: token_1132,
//     notification: {
//         title: 'Hello Money Geek',
//         body: 'This is from local machine Quoc Thinh',
//     }
// }

module.exports = app_firebase;