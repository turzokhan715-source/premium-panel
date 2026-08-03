const express = require("express");
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


// Middleware

function auth(req, res, next) {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    next();
}


// Dashboard

router.get("/dashboard", auth, (req, res) => {

    const db = loadDB();

    const user = db.users.find(
        u => u.id === req.session.user.id
    );

    res.render("dashboard", {
        user
    });

});


// Wallet

router.get("/wallet", auth, (req, res) => {

    const db = loadDB();

    const user = db.users.find(
        u => u.id === req.session.user.id
    );

    res.render("wallet", {
        user
    });

});


// Submit Page

router.get("/submit", auth, (req, res) => {

    res.render("submit");

});


// Submit Request

router.post("/submit", auth, (req, res) => {

    const { title, details } = req.body;

    const db = loadDB();

    db.submissions.push({

        id: Date.now(),

        userId: req.session.user.id,

        title,

        details,

        status: "pending",

        createdAt: new Date().toISOString()

    });


    saveDB(db);


    res.json({

        success: true,

        message: "Submitted successfully"

    });

});


// Withdraw Request

router.post("/withdraw", auth, (req, res) => {

    const { amount, method } = req.body;


    const db = loadDB();


    const user = db.users.find(
        u => u.id === req.session.user.id
    );


    if(user.balance < amount){

        return res.json({

            success:false,

            message:"Insufficient balance"

        });

    }


    db.withdrawals.push({

        id: Date.now(),

        userId:user.id,

        amount,

        method,

        status:"pending",

        createdAt:new Date().toISOString()

    });


    saveDB(db);


    res.json({

        success:true,

        message:"Withdrawal request sent"

    });


});


module.exports = router;
