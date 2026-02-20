import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Look for the service account key in the environment variables, or fallback to the local file
let serviceAccount: any;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
        // Determine the absolute path to backend/serviceAccountKey.json
        // __dirname is usually /src/config, so we go up two levels to /backend
        const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
        if (fs.existsSync(serviceAccountPath)) {
            serviceAccount = require(serviceAccountPath);
        } else {
            console.warn('⚠️ Warning: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT_KEY env var not set.');
        }
    }

    if (serviceAccount && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized successfully.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
}

export const db = admin.apps.length ? admin.firestore() : null;
export default admin;
