import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './src/routes/auth';
import userRoutes from './src/routes/users';
import resultsRoutes from './src/routes/results';
import typingRoutes from './src/routes/typing';
import { startCodeCacheRefill } from './src/services/snippetCache';

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log(`Setting up CORS for origin: ${frontendUrl}`);

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/typing', typingRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startCodeCacheRefill(10); // Run refill every 10 minutes
    });
});