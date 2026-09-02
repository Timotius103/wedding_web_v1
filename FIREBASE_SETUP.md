# Firebase Setup

This repository uses one Firebase project for the public invitation and the separate `/admin/` panel.

1. Register a Firebase Web App and copy its browser config into `firebase-config.js`.
2. Enable Firestore Database and Authentication > Sign-in method > Email/Password.
3. Deploy the rules and query index:

   ```powershell
   firebase login
   firebase use YOUR_PROJECT_ID
   firebase deploy --only firestore
   ```

4. Create the single administrator Email/Password user in Firebase Authentication.
5. Copy that user's UID from Authentication > Users into both admin authorization locations:
   - `admin/admin.js` for the UI guard.
   - `firestore.rules` for the real authorization boundary.
6. Deploy the updated rules with `firebase deploy --only firestore`.
7. Serve the repository over HTTP and open `/admin/` for moderation.

The browser config is intended for the web client. Firestore rules are the security boundary: public users can create validated `pending` comments and read only `approved` comments. Only the authenticated user whose UID matches the configured admin UID can read all comments or update status.
