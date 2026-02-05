import express from 'express';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlist,
    toggleWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.post('/toggle', toggleWishlist);
router.get('/check/:productId', checkWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.delete('/clear', clearWishlist);

export default router;
