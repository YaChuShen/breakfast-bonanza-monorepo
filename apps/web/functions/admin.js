import admin from 'firebase-admin';

const sa = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

try {
  admin.app();
} catch (e) {
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    databaseURL: `https://${sa.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`,
  });
}

export default admin;
