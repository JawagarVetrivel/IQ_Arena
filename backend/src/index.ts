import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Initialize Firebase before anything else
import './config/firebase';
import { db } from './config/firebase';

const app = express();

// Set trust proxy for Vercel's edge network so rate-limiter works
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());

// Restrict CORS to our frontend domain (adjust in production)
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://iq-arena-fnt.vercel.app', 'https://your-frontend-domain.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000', 'https://iq-arena-fnt.vercel.app'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());

// Global Rate Limiting: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/debug-env', (req, res) => {
    const buildMarker = "11:10_VERCEL_ENV_PULL";
    const plainKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    let parsable = false;
    let parseError = null;
    let finalKey = null;

    try {
        if (base64Key) {
            const decodedString = Buffer.from(base64Key, 'base64').toString('utf8');
            const parsed = JSON.parse(decodedString);
            parsable = true;
            if (parsed.private_key) {
                finalKey = parsed.private_key.substring(0, 40) + '...';
            }
        } else if (plainKey) {
            const parsed = JSON.parse(plainKey);
            parsable = true;
            if (parsed.private_key) {
                finalKey = parsed.private_key.substring(0, 40) + '...';
            }
        }
    } catch (e: any) {
        parseError = e.message;
    }

    res.status(200).json({
        buildMarker,
        hasPlainEnv: !!plainKey,
        hasBase64Env: !!base64Key,
        parsable,
        parseError,
        peek: finalKey,
        isDbInitialized: db !== null
    });
});

// Root friendly endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the IQ Arena API',
        status: 'Online',
        endpoints: ['/api/start-quiz', '/api/submit-test', '/api/leaderboard/:challengeId']
    });
});

// Import and register routes
import quizRoutes from './routes/quiz';
import leaderboardRoutes from './routes/leaderboard';
app.use('/api', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Export the Express API to make it compatible with Vercel Serverless Functions
export default app;

// Start server locally if not in Vercel environment
if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on port ${PORT}`);
    });
}