const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    getAllCategories
} = require('../controllers/categoryController');

// Public routes
router.get('/', getCategories);
router.get('/all', getAllCategories);
router.get('/:id', getCategory);

module.exports = router;
