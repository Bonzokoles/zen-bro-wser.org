import express from 'express';
import pkg from 'pg';
import { createClient } from 'redis';

const { Pool } = pkg;
const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://zenbrowsers:example@postgres:5432/zenbrowsersdb'
});

// Redis connection
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});
redisClient.connect().catch(console.error);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test DB connection
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0].now });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Test Redis connection
app.get('/api/test-redis', async (req, res) => {
    try {
        await redisClient.set('test-key', 'Hello from Redis!');
        const value = await redisClient.get('test-key');
        res.json({ success: true, value });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
