const jwt = require('jsonwebtoken');
require('dotenv').config();

const createJWT = (payload) => {
    const key = process.env.JWT_SECRET;
    const options = { expiresIn: process.env.JWT_EXPIRES_IN };
    try {
        return jwt.sign(payload, key, options);
    } catch (error) {
        console.error('Error creating JWT:', error);
        return null;
    }
};
const createJWTResetPassword = (payload) => {
    const key = process.env.JWT_SECRET;
    const options = { expiresIn: '5m' };
    try {
        return jwt.sign(payload, key, options);
    } catch (error) {
        console.error('Error creating JWT:', error);
        return null;
    }
};
const createRefreshToken = (payload) => {
    const key = process.env.REFRESH_TOKEN_SECRET;
    const options = { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN };
    try {
        return jwt.sign(payload, key, options);
    } catch (error) {
        console.error('Error creating refresh token:', error);
        return null;
    }
};

const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const verifyToken = (token, key) => {
    try {
        // Check if token is a string and not empty
        if (!token || typeof token !== 'string') {
            console.error('Token is not a valid string:', typeof token, token);
            return null;
        }
        return jwt.verify(token, key);
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

const verifyAccessToken = (token) => verifyToken(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => verifyToken(token, process.env.REFRESH_TOKEN_SECRET);

const checkAccessToken = (req, res, next) => {
    // const nonSecurePaths = ["/", "/login"];
    // if (nonSecurePaths.includes(req.path)) {
    //     return next();
    // }

    const authHeader = req.headers['authorization'];
    console.log('Auth Header:', authHeader);
    
    if (!authHeader) {
        return res.status(401).json({
            message: 'Authorization header missing',
            status: 'fail'
        });
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization token missing or invalid',
            status: 'fail'
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Extracted Token:', token);

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({
            message: 'Authorization token missing or invalid',
            status: 'fail'
        });
    }

    const verifiedToken = verifyAccessToken(token);
    if (!verifiedToken) {
        return res.status(401).json({ 
            message: 'Access token is invalid or expired',
            status: 'fail',
            user: null
        });
    }

    req.user = verifiedToken;
    next();
};

module.exports = {
    createJWT,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    checkAccessToken,
    decodeToken,
    createJWTResetPassword
};
