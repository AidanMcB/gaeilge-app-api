const { getAuth } = require('firebase-admin/auth');
const { admin } = require('../config/firebase.js');
const pool = require('../config/db.js');

const verifyAuth = async (req, resp) => {
    const token = req.headers.authorization?.split('Bearer ')[1]; // Extract token

    if (!token) {
        return resp.status(401).json({ authenticated: false, message: 'No token provided' });
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        return resp.json({ authenticated: true, uid: decodedToken.uid });
    } catch (error) {
        return resp.status(401).json({ authenticated: false, message: 'Invalid token' });
    }
};

const createUser = async (request, response) => {
    const { username, email, password } = request.body;

    try {
        // Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password
        });

        // Save custom user in DB
        const results = await pool.query(
            'INSERT INTO users (firebase_uid, username, email) VALUES ($1, $2, $3) RETURNING *',
            [userRecord.uid, username, email]
        );

        response.status(201).json({ user: results.rows[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        response.status(500).json({ error: 'Error creating user', details: error.message });
    }
};

const loginUser = async (req, res) => {
    console.log('Login request received', req.body);
    const { idToken } = req.body;
    console.log('ID token received:', idToken);
    if (!idToken) {
        return res.status(400).json({ error: 'Missing ID token' });
    }
    console.log('Received ID token:', idToken);
    try {
        // Optional: verify token before trusting
        const decoded = await admin.auth().verifyIdToken(idToken);
        const uid = decoded.uid;
        console.log('Decoded UID:', uid);

        res.cookie('access_token', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });
        console.log('Cookie set with ID token');

        // Query your DB for custom user info
        const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [
            uid
        ]);
        console.log('Database query result:', result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User record not found' });
        }
        console.log('User found:', result.rows[0]);

        const user = result.rows[0];
        res.status(200).json({ status: 200, data: { user: user } });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid ID token' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const firebaseUid = req.user.uid;

        const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [
            firebaseUid
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ status: 200, data: { user: result.rows[0] } });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
};

module.exports = {
    verifyAuth,
    createUser,
    loginUser,
    getCurrentUser
};
