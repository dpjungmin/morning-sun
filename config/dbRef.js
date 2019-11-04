const firebase = require('firebase/app');
require('firebase/firestore');

// Initialize firebase firestore
// This database is used only for development
// Updated version will have a production database
// With security rules added to them
const firebaseConfig = {
  apiKey: 'AIzaSyB-RKvLt2rLcjgJL2jIJGED0hVJgTA9I6s',
  authDomain: 'morning-sun-dev.firebaseapp.com',
  databaseURL: 'https://morning-sun-dev.firebaseio.com',
  projectId: 'morning-sun-dev',
  storageBucket: 'morning-sun-dev.appspot.com',
  messagingSenderId: '1018247170478',
  appId: '1:1018247170478:web:6d100469f2dc6d3dc7203f',
  measurementId: 'G-QTGVJP6YP1'
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
