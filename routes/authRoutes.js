import express from 'express';
import {
    register,
    login,
    googleAuth,
    getMe,
    updateProfile,
    updatePassword,
    addAddress,
    debugAuth
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegistration, validateLogin, validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use((req, res, next) => {
    console.log(`🔐 Auth Route Entry: ${req.method} ${req.url}`);
    next();
});

router.get('/test', (req, res) => res.json({ msg: 'Auth Route Works' }));

router.post('/register', validateRegistration, validate, register);
router.post('/login', validateLogin, validate, login);
router.post('/google', googleAuth);
router.post('/google-callback', (req, res, next) => {
    console.log('📍 ROUTER HIT: /google-callback');
    return googleAuth(req, res, next);
});
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/address', protect, addAddress);
router.get('/debug', debugAuth);

export default router;