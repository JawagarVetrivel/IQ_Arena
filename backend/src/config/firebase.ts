import * as admin from 'firebase-admin';

let serviceAccount: any = null;

try {
    // If Vercel injects the private key specifically as a direct string variable (easiest bypass of complex JSON stringification)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {

        // Vercel dashboard flattens newlines into literal "\\n" strings when pasting RSA keys. We MUST regex restore them to actual newlines.
        let formattedKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');

        if (!formattedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
            formattedKey = '-----BEGIN PRIVATE KEY-----\n' + formattedKey;
        }
        if (!formattedKey.endsWith('-----END PRIVATE KEY-----\n')) {
            formattedKey = formattedKey + '\n-----END PRIVATE KEY-----\n';
        }

        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: formattedKey
        };
        console.log("Firebase credentials successfully assembled from discrete environment variables.");
    } else {
        // Fallback to local dev JSON file
        const fs = require('fs');
        const path = require('path');
        const localKeyPath = path.resolve(__dirname, '../../serviceAccountKey.json');

        if (fs.existsSync(localKeyPath)) {
            const keyFile = fs.readFileSync(localKeyPath, 'utf8');
            serviceAccount = JSON.parse(keyFile);
        } else {
            console.error("CRITICAL: Missing FIREBASE_PRIVATE_KEY Env Variable AND serviceAccountKey.json file.");
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
