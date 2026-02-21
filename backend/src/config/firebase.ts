import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Look for the service account key in the environment variables, or fallback to the local file
let serviceAccount: any;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Vercel deployment: use environment variable
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
        // Local deployment: use file
        const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
        if (fs.existsSync(serviceAccountPath)) {
            serviceAccount = require(serviceAccountPath);
        } else {
            const fallbackPath = path.resolve(__dirname, '../../serviceAccountKey.json');
            if (fs.existsSync(fallbackPath)) {
                serviceAccount = require(fallbackPath);
            } else {
                console.warn('⚠️ Warning: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT_KEY env var not set.');
            }
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
