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

// Middleware: Admin check
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.status(403).send("Access Denied: Admins Only");
}

// Admin Dashboard
router.get("/dashboard", isAdmin, (req, res) => {
  const db = loadDB();
  res.render("admin-dashboard", {
    users: db.users,
    submissions: db.submissions,
    withdrawals: db.withdrawals
  });
});

// Update Submission Status (approve / reject)
router.post("/submission/status", isAdmin, (req, res) => {
  const { submissionId, status } = req.body;
  const db = loadDB();

  const submission = db.submissions.find(s => s.id === submissionId);
  if (!submission) {
    return res.json({ success: false, message: "Submission not found" });
  }

  submission.status = status;
  saveDB(db);

  res.json({ success: true, message: `Submission updated to ${status}` });
});

// Process Withdrawal (approve / reject)
router.post("/withdraw/status", isAdmin, (req, res) => {
  const { withdrawalId, status } = req.body;
  const db = loadDB();

  const withdrawal = db.withdrawals.find(w => w.id === withdrawalId);
  if (!withdrawal) {
    return res.json({ success: false, message: "Withdrawal not found" });
  }

  if (status === "approved" && withdrawal.status !== "approved") {
    const user = db.users.find(u => u.id === withdrawal.userId);
    if (user && user.balance >= withdrawal.amount) {
      user.balance -= withdrawal.amount;
    } else {
      return res.json({ success: false, message: "User balance insufficient" });
    }
  }

  withdrawal.status = status;
  saveDB(db);

  res.json({ success: true, message: `Withdrawal ${status}` });
});

module.exports = router;
