const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

/**
 * In-memory OTP store.
 * Key = uid, Value = { otp, createdAt, email }
 * OTPs expire after 10 minutes.
 */
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function cleanExpiredOtps() {
    const now = Date.now();
    for (const [uid, data] of otpStore) {
        if (now - data.createdAt > OTP_EXPIRY_MS) {
            otpStore.delete(uid);
        }
    }
}

// Clean expired OTPs every 5 minutes
setInterval(cleanExpiredOtps, 5 * 60 * 1000);

/**
 * POST /api/reset-password
 * Uses Firebase Admin SDK to update a user's Firebase Auth password.
 * Expects: { uid: string, newPassword: string }
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { uid, newPassword } = req.body;

        if (!uid || !newPassword) {
            return res.status(400).json({ error: 'uid and newPassword are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        await admin.auth().updateUser(uid, { password: newPassword });

        // Clear OTP from memory
        otpStore.delete(uid);

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);

        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(500).json({ error: error.message || 'Failed to reset password.' });
    }
});

/**
 * POST /api/forgot-password/send-otp
 * Looks up user via Firebase Auth Admin (not Firestore), generates OTP,
 * stores it in server memory, and returns info for client-side EmailJS sending.
 * Expects: { email: string }
 */
router.post('/forgot-password/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const trimmedEmail = email.trim().toLowerCase();

        // Look up user via Firebase Auth (not Firestore — avoids permission issues)
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(trimmedEmail);
        } catch (authError) {
            if (authError.code === 'auth/user-not-found') {
                return res.status(404).json({ error: 'No account found with this email address.' });
            }
            throw authError;
        }

        const uid = userRecord.uid;
        const displayName = userRecord.displayName || '';
        const firstname = displayName.split(' ')[0] || 'User';

        // Try to get firstname from Firestore (optional — if it works great, if not use Auth displayName)
        let firestoreFirstname = firstname;
        try {
            const db = admin.firestore();
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists && userDoc.data().firstname) {
                firestoreFirstname = userDoc.data().firstname;
            }
        } catch (_) {
            // Firestore access failed — use Auth displayName instead, no problem
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in server memory (bypasses all Firestore permissions)
        otpStore.set(uid, {
            otp,
            createdAt: Date.now(),
            email: trimmedEmail
        });

        // Return OTP and user info for client-side EmailJS sending
        res.json({
            success: true,
            uid: uid,
            firstname: firestoreFirstname,
            otp: otp,
        });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ error: error.message || 'Failed to generate OTP.' });
    }
});

/**
 * POST /api/forgot-password/verify-otp
 * Verifies OTP against server-memory stored value.
 * Expects: { uid: string, otp: string }
 */
router.post('/forgot-password/verify-otp', async (req, res) => {
    try {
        const { uid, otp } = req.body;

        if (!uid || !otp) {
            return res.status(400).json({ error: 'uid and otp are required.' });
        }

        const stored = otpStore.get(uid);

        if (!stored) {
            return res.json({ success: true, verified: false, error: 'OTP expired or not found. Please request a new one.' });
        }

        // Check expiry
        if (Date.now() - stored.createdAt > OTP_EXPIRY_MS) {
            otpStore.delete(uid);
            return res.json({ success: true, verified: false, error: 'OTP has expired. Please request a new one.' });
        }

        if (otp === stored.otp) {
            res.json({ success: true, verified: true });
        } else {
            res.json({ success: true, verified: false, error: 'Invalid OTP. Please check your email and try again.' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: error.message || 'Failed to verify OTP.' });
    }
});

module.exports = router;
