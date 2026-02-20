import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Initialize Firebase before anything else
import './config/firebase';

const app = express();

// Security Middlewares
app.use(helmet());

// Restrict CORS to our frontend domain (adjust in production)
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'];

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
