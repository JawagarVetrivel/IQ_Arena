import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Look for the service account key in the environment variables, or fallback to the local file
let serviceAccount: any;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Vercel deployment: use environment variable
        const envVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        try {
            serviceAccount = JSON.parse(envVar);
            // Vercel dashboard flattens multi-line strings. Restore actual newlines needed by Firebase Admin.
            if (serviceAccount.private_key) {
                // Handle Vercel literal string "\\n" properly by decoding it to an actual regex newline
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');

                // Ensure it ends with a newline if missing
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
