import express from 'express';
import {
    register,
    login,
    googleAuth,
    getMe,
    updateProfile,
    updatePassword,
    addAddress,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegistration, validateLogin, validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegistration, validate, register);
router.post('/login', validateLogin, validate, login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/address', protect, addAddress);

export default router;
