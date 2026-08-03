const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const router = express.Router();

const DB = path.join(__dirname, "..", "data.json");

function loadDB() {
  return JSON.parse(fs.readFileSync(DB));
}

function saveDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// Middleware: Session check
function isUser(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login");
}

// User Dashboard
router.get("/dashboard", isUser, (req, res) => {
  const db = loadDB();
  const currentUser = db.users.find(u => u.id === req.session.user.id) || req.session.user;
  const mySubmissions = db.submissions.filter(s => s.userId === currentUser.id);
  const myWithdrawals = db.withdrawals.filter(w => w.userId === currentUser.id);

  res.render("dashboard", {
    user: currentUser,
    submissions: mySubmissions,
    withdrawals: myWithdrawals
  });
});

// Submit Form / Work
router.post("/submit", isUser, (req, res) => {
  const { title, details } = req.body;
  const db = loadDB();

  const newSubmission = {
    id: uuid(),
    userId: req.session.user.id,
    username: req.session.user.username,
    title,
    details,
    status: "pending",
    createdAt: Date.now()
  };

  db.submissions.push(newSubmission);
  saveDB(db);

  res.json({ success: true, message: "Submission successful" });
});

// Request Payment / Withdrawal
router.post("/withdraw", isUser, (req, res) => {
  const { amount, method, accountInfo } = req.body;
  const db = loadDB();
  const currentUser = db.users.find(u => u.id === req.session.user.id);

  if (!currentUser || currentUser.balance < amount) {
    return res.json({ success: false, message: "Insufficient balance" });
  }

  const newWithdrawal = {
    id: uuid(),
    userId: currentUser.id,
    username: currentUser.username,
    amount: Number(amount),
    method,
    accountInfo,
    status: "pending",
    createdAt: Date.now()
  };

  db.withdrawals.push(newWithdrawal);
  saveDB(db);

  res.json({ success: true, message: "Withdrawal request submitted" });
});

module.exports = router;
