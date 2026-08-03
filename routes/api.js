const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data.json');

const defaultCategories = [
    { id: 'instagram_2fa', name: 'Instagram 2FA ID', icon: '📸', gradient: 'linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)' },
    { id: 'fb_page_cookies', name: 'Facebook Page Cookies', icon: '📄', gradient: 'linear-gradient(135deg, #1877f2 0%, #0d5bb9 100%)' },
    { id: 'fb_cookies_id', name: 'Facebook Cookies ID', icon: '🍪', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
    { id: 'hotmail_cookies', name: 'Hotmail Page Cookie\'s ID', icon: '✉️', gradient: 'linear-gradient(135deg, #00a4ef 0%, #0072c6 100%)' }
];

router.get('/categories', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        return res.json({ success: true, categories: data.categories || defaultCategories });
    }
    res.json({ success: true, categories: defaultCategories });
});

module.exports = router;
