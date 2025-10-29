# Environment Variables Setup

## Admin Panel Configuration

Create a `.env` file in the `respike_admin` directory with the following content:

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=AIzaSyDxwCjZaz13SPhTLuuDdLFEmuRgKRtt6EU
VITE_FIREBASE_AUTH_DOMAIN=respike-670a4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=respike-670a4
VITE_FIREBASE_STORAGE_BUCKET=respike-670a4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=341338187821
VITE_FIREBASE_APP_ID=1:341338187821:web:c18d495a5931e8effcb0a4
VITE_FIREBASE_MEASUREMENT_ID=G-C5222RTQQD
```

## Important Notes

- The `.env` file is already in `.gitignore` and will not be committed
- An `.env.example` file is provided as a template
- All Vite environment variables must be prefixed with `VITE_`
- After creating/updating the `.env` file, restart the development server

## Backend Configuration

For the backend (respike_backend), you need to:

1. Create a `.env` file with the Firebase service account credentials
2. OR download the service account JSON file from Firebase Console

See `FIREBASE_SETUP.md` in the backend folder for detailed instructions.

