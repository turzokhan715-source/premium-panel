const express = require('express');
const router = express.Router();

// Home / Landing Page Rendering
router.get('/', (req, res) => {
    res.render('login'); // বা res.render('dashboard')
});

module.exports = router;
