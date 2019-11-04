const firebase = require('firebase/app');
require('firebase/firestore');

// Initialize firebase firestore
// This database is used only for development
// Updated version will have a production database
// With security rules added to them
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

class Firestore {
  constructor(morningSun) {
    this.morningSun = morningSun;
  }

  validateApiKey() {
    const { email, apiKey } = this.morningSun.config;
  }
}

module.exports = Firestore;
