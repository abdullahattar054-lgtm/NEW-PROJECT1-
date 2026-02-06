import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth Login
// @route   POST /api/v1/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        console.log('🔐 Google Auth Request Received');
        console.log('Credential:', credential ? 'Present' : 'Missing');

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required',
            });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        console.log('✅ Google Token Verified:', email);

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                name,
                email,
                avatar: picture,
                googleId,
                isEmailVerified: true,
                password: Math.random().toString(36).slice(-8), // Random password
            });
            console.log('✅ New user created:', email);
        } else {
            // Update existing user
            if (!user.googleId) {
                user.googleId = googleId;
                user.isEmailVerified = true;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
            console.log('✅ Existing user logged in:', email);
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Google Auth Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message,
        });
    }
};