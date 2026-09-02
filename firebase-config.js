// Replace these values with the Firebase Web App configuration for this project.
export const firebaseConfig = {
  apiKey: "AIzaSyBdWpUAeJ-beP5Cd3PQO-IzOwYm6ITwwKo",
  authDomain: "wishes-timo-menikah.firebaseapp.com",
  projectId: "wishes-timo-menikah",
  storageBucket: "wishes-timo-menikah.firebasestorage.app",
  messagingSenderId: "371062336367",
  appId: "1:371062336367:web:8a4dc5428c43057b28969a",
  measurementId: "G-0PXR3K0FHF"
};

export const firebaseIsConfigured = !Object.values(firebaseConfig)
  .some(value => value.startsWith('REPLACE_WITH_'));
