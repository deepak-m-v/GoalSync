const admin = require('firebase-admin');
const config = require('../config');

let app = null;

function initFirebase() {
  if (!config.firebase.enabled) return null;
  if (app) return app;

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
    return app;
  } catch (err) {
    console.error('Firebase Admin init failed:', err.message);
    return null;
  }
}

async function verifyFirebaseIdToken(idToken) {
  initFirebase();
  if (!app) {
    const err = new Error('Firebase is not configured on the server');
    err.statusCode = 503;
    throw err;
  }
  return admin.auth().verifyIdToken(idToken);
}

async function setUserRoleClaim(firebaseUid, role) {
  initFirebase();
  if (!app) return;
  await admin.auth().setCustomUserClaims(firebaseUid, { role });
}

module.exports = { initFirebase, verifyFirebaseIdToken, setUserRoleClaim, getFirebaseAdmin: () => app };
