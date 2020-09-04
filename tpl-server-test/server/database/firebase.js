const admin = require('firebase-admin');

var serviceAccount = require('./thesis-firebase-project-firebase-adminsdk-l3ifz-f6506babb3.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://thesis-firebase-project.firebaseio.com"
});

const token_1132 = 'dlJxd827RfaJ3rj-PAsv_Q:APA91bFFA23TKUE72kLyDV34MG3MXvKO2Nr3DN6VEyPmdmXI2exvDRhDh26FbamvB2aCzsBfKzJBpM7hA6dC2YJK7VB2wrh3Xyah2MgW8AXBpKBCXExm8dlapv4SXR3yl-tYldn-5A_7';
const payload = {
    token: token_1132,
    notification: {
        title: 'Hello Money Geek',
        body: 'This is from local machine Quoc Thinh',
    }
}

app
.messaging()
.send(payload)
.then(res => {
    console.log('Thanh cong', res);
    app.delete();
})
.catch(err => console.log(err)); 