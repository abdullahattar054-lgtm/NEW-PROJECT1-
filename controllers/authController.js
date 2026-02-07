import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        const token = generateToken(user._id);

        res.status(201).json({
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
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const token = generateToken(user._id);

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
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message,
        });
    }
};

// @desc    Google OAuth Login
// @route   POST /api/v1/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { credential, accessToken } = req.body;
        const token = credential || accessToken || req.body.token;

        console.log('📡 Google Auth Handshake Started');

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'No Google token provided',
            });
        }

        let googleId, email, name, avatar;

        try {
            // 1. Try verifying as ID Token (Credential)
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            avatar = payload.picture;
            console.log('🛡️ Verified via ID Token');
        } catch (idErr) {
            console.log('ℹ️ Not an ID Token, trying Access Token flow...');
            // 2. Fallback to Access Token (fetching profile via Google API)
            try {
                const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
                if (!response.ok) throw new Error('Failed to fetch user info from Google');

                const payload = await response.json();
                googleId = payload.sub;
                email = payload.email;
                name = payload.name;
                avatar = payload.picture;
                console.log('🌐 Verified via Access Token');
            } catch (accessErr) {
                console.error('❌ Google Token Verification Failed:', idErr.message, accessErr.message);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Google token',
                });
            }
        }

        console.log(`👤 Google User Authenticated: ${email}`);

        // Find or create user
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user with googleId if not present
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = avatar;
                await user.save();
                console.log('✅ Updated existing user with Google ID');
            }
        } else {
            // Create new Google user
            user = await User.create({
                name,
                email,
                googleId,
                avatar,
                password: Math.random().toString(36).slice(-12), // Dummy password for schema compliance
            });
            console.log('✅ Created new Google user');
        }

        const jwtToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Google Auth Critical Error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message,
        });
    }
};


// @desc    Debug Auth Config
// @route   GET /api/v1/auth/debug
// @access  Public
export const debugAuth = async (req, res) => {
    res.status(200).json({
        success: true,
        env: {
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
            GOOGLE_CLIENT_ID_VAL: process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing',
            NODE_ENV: process.env.NODE_ENV,
        },
        message: 'Debug info'
    });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                addresses: user.addresses,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message,
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, avatar } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (avatar) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.user.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message,
        });
    }
};

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            token,
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password',
            error: error.message,
        });
    }
};

// @desc    Add address
// @route   POST /api/v1/auth/address
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const { street, city, state, postalCode, country, isDefault } = req.body;

        const user = await User.findById(req.user.id);

        const newAddress = {
            street,
            city,
            state,
            postalCode,
            country: country || 'Pakistan',
            isDefault: isDefault || false,
        };

        // If this is default, unset other defaults
        if (newAddress.isDefault && user.addresses) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        if (!user.addresses) {
            user.addresses = [];
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({
            success: true,
            addresses: user.addresses,
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add address',
            error: error.message,
        });
    }
};