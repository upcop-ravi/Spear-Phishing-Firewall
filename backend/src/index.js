require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyticsRoutes = require('./routes/analyticsRoutes');
const mobileRoutes = require('./routes/mobileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { startScanner } = require('./services/threatScanner');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Ayodhya SafeStay Backend is running.' });
});

// Start Cron Jobs
startScanner();

app.listen(PORT, () => {
    console.log(`[Server] SafeStay backend running on port ${PORT}`);
});
