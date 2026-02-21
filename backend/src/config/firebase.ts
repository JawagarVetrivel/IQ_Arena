import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Look for the service account key in the environment variables, or fallback to the local file
let serviceAccount: any;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        // Vercel deployment: use Base64 environment variable to bypass all newline escaping bugs
        const base64String = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        try {
            const decodedString = Buffer.from(base64String, 'base64').toString('utf8');
            serviceAccount = JSON.parse(decodedString);
        } catch (parseError) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', parseError);
        }
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Fallback for older plaintext vercel deployment
        const envVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        try {
            serviceAccount = JSON.parse(envVar);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
                if (!serviceAccount.private_key.endsWith('\n')) {
                    serviceAccount.private_key += '\n';
                }
            }
        } catch (parseError) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
        }
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
