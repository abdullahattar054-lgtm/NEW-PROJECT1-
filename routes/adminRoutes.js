import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;
