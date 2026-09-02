import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig, firebaseIsConfigured } from './firebase-config.js';

let db = null;
let app = null;

function getFirebaseApp() {
  if (!firebaseIsConfigured) return null;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getCommentsDb() {
  if (!firebaseIsConfigured) return null;
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp();
  return firebaseApp ? getAuth(firebaseApp) : null;
}

export { firebaseIsConfigured };
