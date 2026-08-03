const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data.json');

function loadData() {
    if (!fs.existsSync(DATA_FILE)) return { users: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Register API
router.post('/register', (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    const data = loadData();
    if (!data.users) data.users = [];

    if (data.users.find(u => u.email === email || u.username === username)) {
        return res.json({ success: false, message: 'User already exists!' });
    }

    const newUser = { id: Date.now(), firstName, lastName, username, email, password, balance: 0 };
    data.users.push(newUser);
    saveData(data);
    res.json({ success: true, user: newUser });
});

// Login API
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const data = loadData();
    const user = (data.users || []).find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: 'Invalid credentials!' });
    }
});

module.exports = router;
