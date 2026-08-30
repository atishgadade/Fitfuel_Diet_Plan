const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin (Using credentials in env or serviceAccountKey.json)
if (!admin.apps.length) {
    if (process.env.FIREBASE_CREDS) {
        try {
            let cert = JSON.parse(process.env.FIREBASE_CREDS);
            admin.initializeApp({
                credential: admin.credential.cert(cert)
            });
        } catch (e) {
            console.error('ERROR: Failed to parse FIREBASE_CREDS JSON:', e.message);
            admin.initializeApp();
        }
    } else {
        // Try loading from serviceAccountKey.json (shared with ML service)
        const serviceAccountPath = path.resolve(__dirname, '..', 'fitfuel-ml-service', 'serviceAccountKey.json');
        const fs = require('fs');
        if (fs.existsSync(serviceAccountPath)) {
            const cert = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(cert)
            });
            console.log('Firebase Admin initialized from serviceAccountKey.json');
        } else {
            console.warn('WARNING: No Firebase credentials found. Auth endpoints will not work.');
            admin.initializeApp();
        }
    }
}

const app = express();
app.use(cors());
app.use(express.json());

const recommendRoutes = require('./routes/recommend');
const mlProxyRoutes = require('./routes/ml_proxy_routes');
const authRoutes = require('./routes/auth');

app.use('/api', recommendRoutes);
app.use('/api/ml', mlProxyRoutes);
app.use('/api', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Fitness Fuel Server running' });
});

if (require.main === module) {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
}

module.exports = app;
