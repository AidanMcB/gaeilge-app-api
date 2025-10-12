const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    // Check for guest mode header FIRST
    const isGuestMode = req.headers['x-guest-mode'] === 'true';
    
    if (isGuestMode) {
        // Create a mock user object for guest mode
        req.user = {
            uid: 'guest-user',
            isGuest: true
        };
        return next();
    }

    // Only check for tokens if not in guest mode
    let idToken = req.cookies.access_token;

    // Optional fallback to Authorization header (dev/debug only)
    if (!idToken && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts[0] === 'Bearer' && parts[1]) {
            idToken = parts[1];
        }
    }

    if (!idToken) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;
