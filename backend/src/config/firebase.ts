import * as admin from 'firebase-admin';

import fs from 'fs';
import path from 'path';

let serviceAccount: any = null;

try {
    const plainKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (base64Key) {
        // Option 1: Vercel Base64 Encoded Env Var
        const decodedString = Buffer.from(base64Key, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decodedString);
        console.log('✅ Loaded Firebase credentials from BASE64 Env var.');
    } else if (plainKey) {
        // Option 2: Plain JSON String Env Var
        serviceAccount = JSON.parse(plainKey);
        console.log('✅ Loaded Firebase credentials from PLAIN Env var.');
    } else {
        // Option 3: Local file fallback
        const localPath = path.resolve(__dirname, '../../serviceAccountKey.json');
        if (fs.existsSync(localPath)) {
            const fileData = fs.readFileSync(localPath, 'utf8');
            serviceAccount = JSON.parse(fileData);
            console.log('✅ Loaded Firebase credentials from local serviceAccountKey.json');
        } else {
            console.warn('⚠️ No Firebase credentials found. Tried BASE64 env, PLAIN env, and local serviceAccountKey.json');
        }
    }

    if (serviceAccount && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized successfully.');
    } else if (admin.apps.length) {
        console.log('✅ Firebase Admin SDK already initialized.');
    } else {
        console.warn('⚠️ Firebase Admin SDK failed to initialize: No valid service account provided.');
    }
} catch (error) {
    console.error('Error finding or parsing Firebase Service Account:', error);
}

const db = admin.apps.length ? admin.firestore() : null;
export { db };
