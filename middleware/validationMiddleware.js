import { body, validationResult } from 'express-validator';

export const validateRegistration = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
];

export const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

export const validateProduct = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
        .isIn(['Headphones', 'Earbuds', 'Smartwatches'])
        .withMessage('Invalid category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};
