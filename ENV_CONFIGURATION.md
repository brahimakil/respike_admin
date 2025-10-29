# Frontend Environment Configuration

## ✅ Your `.env` file has been created!

The `.env` file in the `respike_admin` folder contains:

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

## 🔥 Firebase Configuration

These are the credentials from your Firebase project:
- **Project ID**: respike-670a4
- **API Key**: AIzaSyDxwCjZaz13SPhTLuuDdLFEmuRgKRtt6EU
- **Auth Domain**: respike-670a4.firebaseapp.com

## ✅ You're Ready!

Your admin panel is now fully configured. To start the development server:

```bash
cd c:\laragon\www\respike\respike_admin
npm install
npm run dev
```

The admin panel will run on `http://localhost:5173`

## 🎯 Important Notes

1. All Vite environment variables **must** start with `VITE_` prefix
2. After changing the `.env` file, you need to **restart** the dev server
3. The `.env` file is in `.gitignore` and won't be committed to version control

