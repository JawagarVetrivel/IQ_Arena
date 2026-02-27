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
        // Option 3: Local file fallback (local dev)
        const localPath = path.resolve(__dirname, '../../serviceAccountKey.json');
        if (fs.existsSync(localPath)) {
            const fileData = fs.readFileSync(localPath, 'utf8');
            serviceAccount = JSON.parse(fileData);
            console.log('✅ Loaded Firebase credentials from local serviceAccountKey.json');
        } else {
            // Option 4: Embedded Base64 fallback (production safety net when no env vars are set)
            const EMBEDDED = "ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiaXEtYXJlbmEtNWY1ZGUiLAogICJwcml2YXRlX2tleV9pZCI6ICI1OThhNzU3YTc2NjM0M2YzMTUxZDkzMjZmYmQ2NGY3MGYyOTk0NmMwIiwKICAicHJpdmF0ZV9rZXkiOiAiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdkFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLWXdnZ1NpQWdFQUFvSUJBUURuRmtZTGZuM1Uxc3pNXG4rSkw0YlF4WTRMWmJkNFlWZWJRYlo2OXNkYjJHYnd6elVFRDdLeGg4MWw1N0F3Yjd4emlONDdVSWIrRVFWelVrXG5KMGVEU1VQaDVpdVRuamZKejF5Ull3NUhHRGkyT09nUzQyMDIrN2p0ODhnWUVBUm5aWjMySTdWZkptTE9vbGpSXG5nYXc1d3NscTN0RFhqTVFIV29GRUhXZktJUjdpcFkvUTZXTlRpTFN6a3BBdnVTanJLNDlnWXBxQ1BQUTJDTGQ1XG5Pa1FsZ2FJK2JWajFQZ1JTVmw4VVVsOWY3d3NuUkV3c0JsRU1lTEg5Zm01Mk9Lc2dNaVBLdUNxRm5iOVM0V3JSXG5LY2sxNm9YS0JsdXdNaFVaOGxOeW84VEo3R2tEZUhUanBRek1pVmdNUXE2MnB0ZFQyc21zUVl6TTRMNGluYlBEXG51VTB0c0V3L0FnTUJBQUVDZ2dFQUJmOXcvL2xmZ0xlMmh4ZG9rU1FiYnU4ZUxJK1VubGdUVWFiR1NkVmdmdTNBXG44MHZBOUFQeFZjUW1uYUM5ZktsMkVWQzRzU2hlT2hOWllML1lQbE1YZlBTQmF3cHZQa0N3a1dGMXpHaVhpRHMvXG40c1dlWHcvM2c4MlJBdmJmZG1PUHp3U3NQM1Q2bVl4aks4VG0ySFR5ejJCTElWMFk5V3ZtOFFLbVgvdXVGb25TXG41cWdkRnNlQTdCdWd5NE9uV3ZybW14TWY2NE1remtwT3hkN3FubnBXL0NpMGpJd2JRelJNZG85TXNlYjFBdy91XG5EdjVCT3Z3WElSS2g4L2JKWTdjRWQxTEVmYmV5OHNRb1ZLN2pUSGNlRWcyQndZQVNicW1odkpxcFdZN0lmdHp6XG5jZnNEc2ZtSDBscHViQnQ1RTNjRTVRZ2R3MUdoNzZSYWhKTDZJSzkvR1FLQmdRRC9jSVBSRXYxVkhrWVNRa0llXG5YY25hbm1BV3IxajdHL2J0Q2RyZ2dNc3JxUkFadGxGaU5GQzF5UGNPV0YxQlJXTXBOaExaazYyS2V4RFpYOHJEXG5YNXVzNDhnVWJ6c2ZXbzU5Z1ZiSk9zZlZMaHJZZmdJSmpKTFpqalhteEk3NWEwTWpGNFZkN3lwd01nalJHdGFvXG5vTzdLVmJLTWI4TmdZZlhmK1ZpSHJ5RnNUUUtCZ1FEbm1CUlcrS3E0NDFOSGJON24xNG9hTXNaUTIra3hVc3B4XG53NHgzSmlZUWVEYkRXTFl1VmhMMGtNWFUvTWt2ZDN3aUViOFBJN2FFeTNUTmIybndaK0hXYXdxYUp6WnRvaEpaXG5GL1MyNzN3QmpXS1dLRzVjdGlZVFhkS08rY0dwSTRENWR0OHE0TXhaZjBsQUd0bkpiQVd0d25jYVZhNUNVZjZrXG5QbGE3bkxid3V3S0JnRDBOZDNRUlJkdUNVTjBzV1FGSkNXWG5WTEFYV1Awcndla0Y0ZnFtemVpeGo5ZVZhLzQ4XG40czJRS3Z5U3dqZEhqbHZiUU1ZZ05lcFRYOE9VMGJIQXVFU3FiTGYxbmZ2d2VQNG1XOGZjOU1aUExydHY0cXpGXG5uSlBER2I3K1crM2haVHFOOUtKdTk0VzViOElLMkNPVjAzMG8zblFTZ25BVytkMStpMXBpMFdwQkFvR0FMTWlpXG52a0t0dUx6MHdLNFQySjg4YkY1L0xPbXBpVWtxTHArU3pRT0tmc3JRUkN3bVpvVnNldkIzNFB6VTVxSGpWaTg2XG5VL0lpL0VEZm9FNDRIUzNwWk80a0NiVWxlRVBMNm9DUWFNT2NwaXd4OFRsMlJlVlBMWldKL3UzYS9oc0llTFQ4XG42S3k1dDJDK3lHK294Nk5rNGJubUVDaWJYdVcrS1FLSkFSU0g1N3NDZ1lCTlhybDhtYzNYWkoxajloQWFjT2x1XG5wVmFrYzFLQ0J3K3M0bGJDUGF2SmFMamxmaDAzdHFmSUNUYmQ2VGhGZ2djRzRJTlRjaWJ4ZXVuUmhzK1RaaGxVXG5iM2VORExBeTlzcm5JTFRIdDRKV3hJYklSZCtLTWpoT2tZOUdKQUdLSXBwZDd4MTdsWU9YSVVJZysyUzFDL0tnXG4wYUpsQlVCSHFQSXpEdXNwU0VxM2F3PT1cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiIsCiAgImNsaWVudF9lbWFpbCI6ICJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BpcS1hcmVuYS01ZjVkZS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDUyNDQ5MTI4NjQ0MDA4NjA5MzYiLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjEvY2VydHMiLAogICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2ZpcmViYXNlLWFkbWluc2RrLWZic3ZjJTQwaXEtYXJlbmEtNWY1ZGUuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0K";
            const decodedString = Buffer.from(EMBEDDED, 'base64').toString('utf8');
            serviceAccount = JSON.parse(decodedString);
            console.log('✅ Loaded Firebase credentials from embedded fallback.');
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
