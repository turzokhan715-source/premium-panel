const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DB = path.join(__dirname, "..", "data.json");

function loadDB() {
    return JSON.parse(fs.readFileSync(DB));
}

function saveDB(data) {
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// Register
router.post("/register", async (req, res) => {

    const { username, password } = req.body;

    const db = loadDB();

    const exists = db.users.find(u => u.username === username);

    if (exists) {
        return res.json({
            success: false,
            message: "Username already exists"
        });
    }

    const hash = await bcrypt.hash(password, 10);

    db.users.push({
        id: uuid(),
        username,
        password: hash,
        balance: 0,
        role: "user",
        createdAt: Date.now()
    });

    saveDB(db);

    res.json({
        success: true
    });

});

// Login
router.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const db = loadDB();

    const user = db.users.find(u => u.username === username);

    if (!user) {
        return res.json({
            success: false,
            message: "User not found"
        });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.json({
            success: false,
            message: "Wrong password"
        });
    }

    req.session.user = user;

    res.json({
        success: true
    });

});

// Logout

router.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/login");

    });

});

module.exports = router;
