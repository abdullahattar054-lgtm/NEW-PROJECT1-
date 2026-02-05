import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { validateProduct, validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);
router.post('/', protect, admin, validateProduct, validate, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
