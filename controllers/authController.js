i// @desc    Google OAuth Login
// @route   POST /api/v1/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

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
        } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = googleId;
            user.isEmailVerified = true;
            if (!user.avatar) user.avatar = picture;
            await user.save();
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
        console.error('❌ Google Auth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message,
        });
    }
};