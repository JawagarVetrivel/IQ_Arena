import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Look for the service account key in the environment variables, or fallback to the local file
let serviceAccount: any;

try {
    // Primary method for Vercel Edge bypassing Env Variable corruption limits
    const localKeyPath = path.resolve(__dirname, './firebase-key.json');
    if (fs.existsSync(localKeyPath)) {
        console.log('Using local firebase-key.json for initialization');
        const keyFile = fs.readFileSync(localKeyPath, 'utf8');
        serviceAccount = JSON.parse(keyFile);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
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
        // Local development: use the local file at root
        const rootKeyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
        if (fs.existsSync(rootKeyPath)) {
            const keyFile = fs.readFileSync(rootKeyPath, 'utf8');
            serviceAccount = JSON.parse(keyFile);
        } else {
            console.error('No Firebase Service Account Key found. Please add firebase-key.json.');
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

// Ensure db is exported even if init fails (for type safety, operations will fail later)
const db = admin.apps.length ? admin.firestore() : null;

// Export Firestore for direct database operations where needed (used by seed script)
export { db };
