const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-Memory Database
let categories = [
    { name: "Free Fire", price: 50 },
    { name: "Facebook", price: 100 },
    { name: "Gmail", price: 30 },
    { name: "Page", price: 200 }
];

let submittedIds = [];
let adminReports = {};
let claimedUidsStore = {
    "Free Fire": [],
    "Facebook": [],
    "Gmail": [],
    "Page": []
};
let paymentRequests = [];
let usersList = [];
let adminAuthenticatedSessions = {}; // Admin session storage

// Helper function: Fixed design for file box layout
function formatAsFileBox(detailsText, itemId) {
    const lines = detailsText.split('\n').filter(line => line.trim() !== '');
    let fileHtml = '<div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 450px;">';
    
    fileHtml += '<div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; text-align: left; max-height: 150px; overflow-y: auto; font-family: \'Courier New\', Courier, monospace; font-size: 11px; display: flex;">';
    
    fileHtml += '<div style="background: #1e293b; color: #64748b; padding: 8px 8px; user-select: none; border-right: 1px solid #334155; text-align: right;">';
    lines.forEach((_, idx) => { fileHtml += '<div>' + (idx + 1) + '</div>'; });
    fileHtml += '</div>';

    fileHtml += '<div style="padding: 8px 10px; color: #e2e8f0; white-space: pre-wrap; word-break: break-all; flex-grow: 1;">';
    lines.forEach(line => { fileHtml += '<div>' + line + '</div>'; });
    fileHtml += '</div></div>';

    fileHtml += '<a href="/admin/download/' + itemId + '" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.4); padding: 5px 10px; border-radius: 5px; font-size: 12px; text-decoration: none; font-weight: bold; width: fit-content;"><i class="fa-solid fa-download"></i> Download File (.txt)</a>';
    
    fileHtml += '</div>';
    return fileHtml;
}

// ================= AUTHENTICATION ROUTES (Register & Login) =================
app.get('/auth', (req, res) => {
    const mode = req.query.mode || 'login';
    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Access - Portal</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
            body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 15px; }
            .auth-card { background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.1); width: 100%; max-width: 420px; padding: 30px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); }
            .brand-title { text-align: center; margin-bottom: 25px; }
            .brand-title h2 { font-size: 24px; color: #38bdf8; font-weight: 700; margin-bottom: 6px; }
            .brand-title p { font-size: 13px; color: #94a3b8; }
            .form-group { margin-bottom: 18px; }
            label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #cbd5e1; }
            input { width: 100%; padding: 12px 14px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none; font-size: 14px; }
            input:focus { border-color: #38bdf8; }
            .submit-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: 0.3s; }
            .submit-btn:hover { opacity: 0.9; }
            .toggle-link { text-align: center; margin-top: 20px; font-size: 14px; color: #94a3b8; }
            .toggle-link a { color: #38bdf8; text-decoration: none; font-weight: bold; }
            
            @media (max-width: 480px) {
                .auth-card { padding: 20px; }
                .brand-title h2 { font-size: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="auth-card">
            <div class="brand-title">
                <h2><i class="fa-solid fa-shield-halved"></i> ID Sell Portal</h2>
                <p>${mode === 'register' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'আপনার অ্যাকাউন্টে লগইন করুন'}</p>
            </div>

            ${mode === 'register' ? `
                <form action="/register" method="POST">
                    <div class="form-group">
                        <label><i class="fa-solid fa-user"></i> Full Name:</label>
                        <input type="text" name="name" placeholder="আপনার নাম লিখুন" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-envelope"></i> Gmail Address:</label>
                        <input type="email" name="email" placeholder="example@gmail.com" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fa-brands fa-telegram"></i> Telegram Username:</label>
                        <input type="text" name="telegram" placeholder="@username" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-at"></i> Username:</label>
                        <input type="text" name="username" placeholder="ইউজারনেম দিন" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-lock"></i> Password:</label>
                        <input type="password" name="password" placeholder="পাসওয়ার্ড দিন" required>
                    </div>
                    <button type="submit" class="submit-btn"><i class="fa-solid fa-user-plus"></i> Register Account</button>
                </form>
                <div class="toggle-link">
                    ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="/auth?mode=login">লগইন করুন</a>
                </div>
            ` : `
                <form action="/login" method="POST">
                    <div class="form-group">
                        <label><i class="fa-solid fa-envelope"></i> Gmail Address:</label>
                        <input type="email" name="email" placeholder="আপনার রেজিস্টার্ড জিমেইল দিন" required>
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-lock"></i> Password:</label>
                        <input type="password" name="password" placeholder="পাসওয়ার্ড দিন" required>
                    </div>
                    <button type="submit" class="submit-btn"><i class="fa-solid fa-right-to-bracket"></i> Login Now</button>
                </form>
                <div class="toggle-link">
                    অ্যাকাউন্ট নেই? <a href="/auth?mode=register">রেজিস্ট্রেশন করুন</a>
                </div>
            `}
        </div>
    </body>
    </html>
    `);
});

// Handle Registration Processing
app.post('/register', (req, res) => {
    const { name, email, telegram, username, password } = req.body;
    const exists = usersList.find(u => u.email === email || u.username === username);
    if(exists) {
        return res.send(`<script>alert("এই জিমেইল অথবা ইউজারনেম দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা রয়েছে!"); window.location.href='/auth?mode=register';</script>`);
    }
    usersList.push({ name, email, telegram, username, password, balance: 0 });
    res.redirect(`/auth?mode=login`);
});

// Handle Login Processing 
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersList.find(u => u.email === email && u.password === password);
    if(user) {
        res.redirect(`/?user=${encodeURIComponent(user.email)}`);
    } else {
        res.send(`<script>alert("ভুল জিমেইল অথবা পাসওয়ার্ড!"); window.location.href='/auth?mode=login';</script>`);
    }
});


// ================= ADMIN LOGIN ROUTE (@NOYONVAI) =================
app.get('/admin-login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - Portal</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
            body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 15px; }
            .auth-card { background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.1); width: 100%; max-width: 400px; padding: 30px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); text-align: center; }
            .brand-title h2 { font-size: 24px; color: #f43f5e; font-weight: 700; margin-bottom: 6px; }
            .brand-title p { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
            .form-group { margin-bottom: 18px; text-align: left; }
            label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #cbd5e1; }
            input { width: 100%; padding: 12px 14px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none; font-size: 14px; }
            .submit-btn { background: linear-gradient(135deg, #f43f5e, #be123c); color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="auth-card">
            <div class="brand-title">
                <h2><i class="fa-solid fa-user-shield"></i> Admin Portal</h2>
                <p>অ্যাডমিন প্যানেলে প্রবেশ করতে পাসওয়ার্ড দিন</p>
            </div>
            <form action="/admin-auth" method="POST">
                <div class="form-group">
                    <label><i class="fa-solid fa-lock"></i> Admin Password:</label>
                    <input type="password" name="password" placeholder="পাসওয়ার্ড লিখুন..." required>
                </div>
                <button type="submit" class="submit-btn"><i class="fa-solid fa-right-to-bracket"></i> Enter Admin Panel</button>
            </form>
        </div>
    </body>
    </html>
    `);
});

app.post('/admin-auth', (req, res) => {
    const { password } = req.body;
    if(password === "@NOYONVAI") {
        const token = Math.random().toString(36).substring(2);
        adminAuthenticatedSessions[token] = true;
        res.cookie('admin_token', token, { httpOnly: true });
        res.redirect('/admin');
    } else {
        res.send(`<script>alert("ভুল পাসওয়ার্ড!"); window.location.href='/admin-login';</script>`);
    }
});


// ================= USER PANEL ROUTE =================
app.get('/', (req, res) => {
    const userEmailQuery = req.query.user;
    if(!userEmailQuery) return res.redirect('/auth?mode=login');

    const currentUser = usersList.find(u => u.email === userEmailQuery);
    if(!currentUser) return res.redirect('/auth?mode=login');

    const userSubmissions = submittedIds.filter(item => item.userEmail === currentUser.email);
    const userPayments = paymentRequests.filter(pay => pay.userEmail === currentUser.email);

    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium ID Sell Panel - User</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
            body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; min-height: 100vh; overflow-x: hidden; }
            .top-bar { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            .menu-btn { background: none; border: none; color: #38bdf8; font-size: 22px; cursor: pointer; }
            .user-info { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; flex-wrap: wrap; justify-content: flex-end; }
            .balance-box { background: linear-gradient(135deg, #10b981, #059669); padding: 5px 10px; border-radius: 20px; font-weight: bold; font-size: 13px; }
            .logout-link { color: #f43f5e; text-decoration: none; font-size: 13px; font-weight: bold; background: rgba(244,63,94,0.1); padding: 5px 8px; border-radius: 6px; }
            
            .sidebar { height: 100%; width: 260px; position: fixed; z-index: 101; top: 0; left: -260px; background-color: #0f172a; color: white; transition: 0.3s ease-in-out; padding-top: 20px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.05); }
            .sidebar-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .close-btn { background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; }
            .sidebar-links { list-style: none; padding: 20px 0; flex-grow: 1; }
            .sidebar-links li a { padding: 14px 20px; text-decoration: none; font-size: 15px; color: #cbd5e1; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer; }
            .sidebar-links li a:hover, .sidebar-links li a.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
            .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; color: #94a3b8; }
            .sidebar-footer a { color: #38bdf8; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-top: 6px; }
            
            .container { max-width: 900px; margin: 90px auto 30px auto; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: none; width: 95%; }
            .container.active-section { display: block; }
            
            .section-header-banner { text-align: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; }
            .section-header-banner h2 { color: #f8fafc; font-size: 22px; font-weight: 700; margin-bottom: 5px; }
            .section-header-banner p { color: #38bdf8; font-size: 13px; font-weight: 500; }

            .form-group { margin-bottom: 18px; }
            label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #94a3b8; }
            select, input, textarea { width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; color: white; outline: none; }
            textarea { resize: vertical; height: 110px; }
            .submit-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.3s; }
            .history-section { margin-top: 30px; overflow-x: auto; }
            .history-section h3 { font-size: 18px; margin-bottom: 12px; color: #cbd5e1; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); min-width: 600px; }
            th, td { padding: 12px; text-align: center; font-size: 13px; vertical-align: middle; }
            th { background: rgba(15, 23, 42, 0.8); color: #38bdf8; font-weight: 600; }
            td { background: rgba(30, 41, 59, 0.4); border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; }
            .badge-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
            .badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
            .delete-btn { background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.4); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-block; }

            @media (max-width: 600px) {
                .container { padding: 15px; margin-top: 80px; }
                .section-header-banner h2 { font-size: 18px; }
                .user-info span { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="top-bar">
            <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars-staggered"></i></button>
            <div class="user-info">
                <span>স্বাগতম, ${currentUser.name}!</span>
                <div class="balance-box" id="userBalance">💰 ৳${currentUser.balance}</div>
                <a href="/auth?mode=login" class="logout-link"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
            </div>
        </div>

        <div id="mySidebar" class="sidebar">
            <div>
                <div class="sidebar-header">
                    <h3><b>মেনু প্যানেল</b></h3>
                    <button class="close-btn" onclick="toggleSidebar()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <ul class="sidebar-links">
                    <li><a id="nav-homeSection" onclick="switchSection('homeSection', this)"><i class="fa-solid fa-house"></i> Home Dashboard</a></li>
                    <li><a id="nav-reportSection" onclick="switchSection('reportSection', this)"><i class="fa-solid fa-chart-line"></i> Report & Claim</a></li>
                    <li><a id="nav-paymentSection" onclick="switchSection('paymentSection', this)"><i class="fa-solid fa-wallet"></i> Payment Request</a></li>
                </ul>
            </div>
            <div class="sidebar-footer">
                <div>Support Admin:</div>
                <a href="https://t.me/XINPANEL_CHANNEL" target="_blank"><i class="fa-brands fa-telegram"></i> XINPANEL_CHANNEL</a>
            </div>
        </div>

        <!-- Home Section -->
        <div id="homeSection" class="container">
            <div class="section-header-banner">
                <h2>✨ Secure ID Submission Dashboard ✨</h2>
                <p>আপনার অ্যাকাউন্ট সুরক্ষিত রেখে খুব সহজেই গেম বা সোশ্যাল মিডিয়া আইডি জমা দিন।</p>
            </div>
            <form action="/submit-id" method="POST">
                <input type="hidden" name="userEmail" value="${currentUser.email}">
                <div class="form-group">
                    <label>Select Category:</label>
                    <select name="category" required>
                        <option value="">-- Select Category --</option>
                        ${categories.map(c => '<option value="' + c.name + '">' + c.name + ' (Price: ৳' + c.price + ')</option>').join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Account Details (Username / Link & Password):</label>
                    <textarea name="details" placeholder="এখানে আপনার আইডির ইউজারনেম, পাসওয়ার্ড বা বিস্তারিত তথ্য লিখুন..." required></textarea>
                </div>
                <button type="submit" class="submit-btn"><i class="fa-solid fa-paper-plane"></i> Submit ID Now</button>
            </form>

            <div class="history-section">
                <h3>My Submissions History</h3>
                <table>
                    <thead>
                        <tr><th style="width: 100px;">Category</th><th>Details (File View)</th><th style="width: 90px;">Status</th><th style="width: 70px;">Action</th></tr>
                    </thead>
                    <tbody>
                        ${userSubmissions.length > 0 ? userSubmissions.map(item => `
                            <tr>
                                <td><b>${item.category}</b></td>
                                <td style="text-align: left; padding: 10px;">${formatAsFileBox(item.details, item.id)}</td>
                                <td><span class="${item.status === 'Success' ? 'badge-success' : 'badge-pending'}">${item.status}</span></td>
                                <td><a href="/delete/${item.id}?user=${encodeURIComponent(currentUser.email)}" class="delete-btn">Delete</a></td>
                            </tr>
                        `).join('') : `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 15px;">কোনো সাবমিশন হিস্ট্রি নেই!</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Report Section -->
        <div id="reportSection" class="container">
            <div class="section-header-banner">
                <h2>📊 ID Report & Instant Claim Box 📊</h2>
                <p>আপনার দেওয়া UID গুলো চেক করুন এবং বৈধ আইডিগুলোর পেমেন্ট সাথে সাথে ব্যালেন্সে যোগ করুন।</p>
            </div>
            <div class="form-group">
                <label>Select Category:</label>
                <select id="userReportCategory" onchange="clearUserMatchResult()">
                    <option value="">-- Select Category --</option>
                    ${categories.map(c => '<option value="' + c.name + '">' + c.name + ' (৳' + c.price + ' per valid ID)</option>').join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Paste UIDs (Each in a new line or comma separated):</label>
                <textarea id="userUidsInput" placeholder="UID101, UID999, etc..."></textarea>
            </div>
            <button type="button" class="submit-btn" onclick="checkUserUids()"><i class="fa-solid fa-magnifying-glass"></i> Check & Match UIDs</button>

            <div id="matchResultBox" style="margin-top: 25px; display: none;">
                <h3 style="margin-bottom: 10px; color: #cbd5e1; font-size: 16px;">Matching Result:</h3>
                <div id="matchedListContainer" style="background: rgba(15,23,42,0.6); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); max-height: 200px; overflow-y: auto; margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 8px;"></div>
                <button type="button" id="claimBtn" class="submit-btn" style="background: linear-gradient(135deg, #10b981, #059669); display: none;" onclick="claimRewards()"><i class="fa-solid fa-hand-holding-dollar"></i> Claim Reward to Balance</button>
            </div>
        </div>

        <!-- Payment Section -->
        <div id="paymentSection" class="container">
            <div class="section-header-banner">
                <h2>💳 Wallet & Payment Withdrawal 💳</h2>
                <p>আপনার জমানো ব্যালেন্স বিকাশ, নগদ বা বাইন্যান্সের মাধ্যমে খুব দ্রুত উত্তোলন করুন।</p>
            </div>
            <form action="/request-payment" method="POST">
                <input type="hidden" name="userEmail" value="${currentUser.email}">
                <div class="form-group">
                    <label>Select Payment Method:</label>
                    <select name="method" required>
                        <option value="">-- Select Method --</option>
                        <option value="Bkash">Bkash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Binance">Binance</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Account / Wallet Number:</label>
                    <input type="text" name="number" placeholder="নাম্বার দিন..." required>
                </div>
                <div class="form-group">
                    <label>Amount (BDT):</label>
                    <input type="number" step="any" name="amount" placeholder="পরিমাণ..." required>
                </div>
                <button type="submit" class="submit-btn">Send Payment Request</button>
            </form>

            <div class="history-section">
                <h3>Payment History</h3>
                <table>
                    <thead>
                        <tr><th>Method</th><th>Account Number</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${userPayments.length > 0 ? userPayments.map(pay => `
                            <tr>
                                <td><b>${pay.method}</b></td>
                                <td>${pay.number}</td>
                                <td>৳${pay.amount}</td>
                                <td><span class="${pay.status === 'Success' ? 'badge-success' : 'badge-pending'}">${pay.status}</span></td>
                            </tr>
                        `).join('') : `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 15px;">কোনো পেমেন্ট হিস্ট্রি নেই!</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <script>
            let userBalance = ${currentUser.balance};
            let currentClaimableUids = [];
            let currentClaimableAmount = 0;
            const currentUserEmail = "${currentUser.email}";

            const adminReportsData = ${JSON.stringify(adminReports)};
            const claimedUidsStoreData = ${JSON.stringify(claimedUidsStore)};
            const categoryPrices = ${JSON.stringify(categories.reduce((acc, c) => ({...acc, [c.name]: c.price}), {}))};

            function switchSection(sectionId, element, saveToStorage = true) {
                document.querySelectorAll('.container').forEach(el => el.classList.remove('active-section'));
                document.getElementById(sectionId).classList.add('active-section');
                document.querySelectorAll('.sidebar-links a').forEach(el => el.classList.remove('active'));
                
                if(element) {
                    element.classList.add('active');
                } else {
                    const navEl = document.getElementById('nav-' + sectionId);
                    if(navEl) navEl.classList.add('active');
                }

                if(saveToStorage) {
                    localStorage.setItem('activeUserSection', sectionId);
                }
                
                const sidebar = document.getElementById("mySidebar");
                if(sidebar.style.left === "0px") {
                    sidebar.style.left = "-260px";
                }
            }

            window.onload = function() {
                const savedSection = localStorage.getItem('activeUserSection') || 'homeSection';
                switchSection(savedSection, null, false);
            };

            function toggleSidebar() {
                const sidebar = document.getElementById("mySidebar");
                sidebar.style.left = sidebar.style.left === "0px" ? "-260px" : "0px";
            }

            function clearUserMatchResult() {
                document.getElementById("matchResultBox").style.display = "none";
                document.getElementById("matchedListContainer").innerHTML = "";
                currentClaimableUids = [];
                currentClaimableAmount = 0;
            }

            function checkUserUids() {
                const category = document.getElementById("userReportCategory").value;
                const rawText = document.getElementById("userUidsInput").value;
                if(!category) { alert("দয়া করে ক্যাটাগরি সিলেক্ট করুন!"); return; }
                if(!rawText.trim()) { alert("দয়া করে UID ইনপুট দিন!"); return; }

                const uids = rawText.split(/[\\n,]+/).map(u => u.trim()).filter(u => u.length > 0);
                const validAdminUids = adminReportsData[category] || [];
                const alreadyClaimedList = claimedUidsStoreData[category] || [];
                const pricePerId = categoryPrices[category] || 0;

                currentClaimableUids = [];
                currentClaimableAmount = 0;
                let containerHtml = "";

                uids.forEach(uid => {
                    const isValid = validAdminUids.includes(uid);
                    const isClaimed = alreadyClaimedList.includes(uid);

                    if(isValid && !isClaimed) {
                        currentClaimableUids.push(uid);
                        currentClaimableAmount += pricePerId;
                    }

                    let bgColor, borderColor, textColor, badgeText;
                    if(isValid) {
                        if(isClaimed) {
                            bgColor = "rgba(100, 116, 139, 0.2)";
                            borderColor = "#64748b";
                            textColor = "#94a3b8";
                            badgeText = " (Claimed)";
                        } else {
                            bgColor = "rgba(16, 185, 129, 0.2)";
                            borderColor = "#10b981";
                            textColor = "#34d399";
                            badgeText = " (Valid)";
                        }
                    } else {
                        bgColor = "rgba(244, 63, 94, 0.2)";
                        borderColor = "#f43f5e";
                        textColor = "#f87171";
                        badgeText = " (Invalid)";
                    }

                    containerHtml += '<div style="background: ' + bgColor + '; border: 1px solid ' + borderColor + '; color: ' + textColor + '; padding: 5px 10px; border-radius: 6px; font-weight: bold; font-size: 12px;">' + uid + badgeText + '</div>';
                });

                document.getElementById("matchedListContainer").innerHTML = containerHtml;
                document.getElementById("matchResultBox").style.display = "block";

                const claimBtn = document.getElementById("claimBtn");
                if(currentClaimableUids.length > 0) {
                    claimBtn.style.display = "block";
                    claimBtn.innerHTML = '<i class="fa-solid fa-hand-holding-dollar"></i> Claim Reward (' + currentClaimableUids.length + ' New Valid IDs = ৳' + currentClaimableAmount + ')';
                } else {
                    claimBtn.style.display = "none";
                }
            }

            function claimRewards() {
                const category = document.getElementById("userReportCategory").value;
                if(currentClaimableUids.length === 0) return;

                fetch('/claim-rewards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUserEmail, category: category, uids: currentClaimableUids })
                })
                .then(res => res.json())
                .then(data => {
                    if(data.success) {
                        userBalance = data.newBalance;
                        document.getElementById("userBalance").innerText = "💰 ৳" + userBalance;
                        alert("সফলভাবে ৳" + data.addedAmount + " ব্যালেন্সে যোগ করা হয়েছে!");
                        if(!claimedUidsStoreData[category]) claimedUidsStoreData[category] = [];
                        claimedUidsStoreData[category].push(...currentClaimableUids);
                        checkUserUids();
                    } else {
                        alert(data.message || "ক্লেম করতে সমস্যা হয়েছে!");
                    }
                });
            }
        </script>
    </body>
    </html>
    `);
});

// Handle User ID Submission
app.post('/submit-id', (req, res) => {
    const { userEmail, category, details } = req.body;
    if (category && details) {
        submittedIds.push({
            id: submittedIds.length > 0 ? submittedIds[submittedIds.length - 1].id + 1 : 1,
            userEmail: userEmail,
            category: category,
            details: details,
            status: "Pending"
        });
    }
    res.redirect(`/?user=${encodeURIComponent(userEmail)}`);
});

// Handle Claim Reward Endpoint
app.post('/claim-rewards', (req, res) => {
    const { email, category, uids } = req.body;
    const pricePerId = categories.find(c => c.name === category)?.price || 0;
    const currentUser = usersList.find(u => u.email === email);
    
    if(!currentUser) return res.json({ success: false, message: "User not found!" });
    if(!claimedUidsStore[category]) claimedUidsStore[category] = [];

    let newValidUids = uids.filter(uid => !claimedUidsStore[category].includes(uid));
    let earnedAmount = newValidUids.length * pricePerId;

    if(earnedAmount > 0) {
        claimedUidsStore[category].push(...newValidUids);
        currentUser.balance += earnedAmount;
        res.json({ success: true, newBalance: currentUser.balance, addedAmount: earnedAmount });
    } else {
        res.json({ success: false, message: "এই ইউআইডিগুলো ইতিমধ্যে ক্লেম করা হয়েছে!" });
    }
});

// Handle Payment Request
app.post('/request-payment', (req, res) => {
    const { userEmail, method, number, amount } = req.body;
    const reqAmount = parseFloat(amount);
    const currentUser = usersList.find(u => u.email === userEmail);

    if(currentUser && reqAmount > 0 && reqAmount <= currentUser.balance) {
        currentUser.balance -= reqAmount;
        paymentRequests.push({
            id: paymentRequests.length > 0 ? paymentRequests[paymentRequests.length - 1].id + 1 : 1,
            userEmail: userEmail,
            method: method,
            number: number,
            amount: reqAmount,
            status: "Pending"
        });
    }
    res.redirect(`/?user=${encodeURIComponent(userEmail)}`);
});

// Handle Delete ID
app.get('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userEmail = req.query.user;
    submittedIds = submittedIds.filter(s => s.id !== id);
    if(req.headers.referer && req.headers.referer.includes('/admin')) {
        res.redirect('/admin');
    } else {
        res.redirect(`/?user=${encodeURIComponent(userEmail)}`);
    }
});

app.get('/admin/delete-payment/:id', (req, res) => {
    const id = parseInt(req.params.id);
    paymentRequests = paymentRequests.filter(p => p.id !== id);
    res.redirect('/admin');
});

app.get('/admin/download/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = submittedIds.find(s => s.id === id);
    if(item) {
        res.setHeader('Content-disposition', 'attachment; filename=' + item.category + '_ID_' + item.id + '.txt');
        res.setHeader('Content-type', 'text/plain');
        res.write(item.details);
        res.end();
    } else {
        res.status(404).send("File not found!");
    }
});

app.post('/admin/update-status/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = submittedIds.find(s => s.id === id);
    if(item) item.status = "Success";
    res.redirect('/admin');
});

app.post('/admin/update-payment/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const payment = paymentRequests.find(p => p.id === id);
    if(payment) payment.status = "Success";
    res.redirect('/admin');
});

app.post('/admin/add-category', (req, res) => {
    const { name, price } = req.body;
    if (name && price) {
        if (!categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            categories.push({ name, price: parseFloat(price) });
            if(!claimedUidsStore[name]) claimedUidsStore[name] = [];
        }
    }
    res.redirect('/admin');
});

app.get('/admin/delete-category/:name', (req, res) => {
    const catName = req.params.name;
    categories = categories.filter(c => c.name !== catName);
    res.redirect('/admin');
});

app.post('/admin/save-report', (req, res) => {
    const { category, uids } = req.body;
    if (category) {
        const uidArray = uids ? uids.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0) : [];
        adminReports[category] = uidArray;
    }
    res.redirect('/admin');
});

// ================= ADMIN PANEL ROUTE (Secured with Password) =================
app.get('/admin', (req, res) => {
    const cookieHeader = req.headers.cookie || '';
    const tokenMatch = cookieHeader.split('; ').find(row => row.startsWith('admin_token='));
    const token = tokenMatch ? tokenMatch.split('=')[1] : null;

    if (!token || !adminAuthenticatedSessions[token]) {
        return res.redirect('/admin-login');
    }

    const selectedCategory = req.query.category || "";
    const filteredIds = selectedCategory 
        ? submittedIds.filter(item => item.category === selectedCategory) 
        : submittedIds;

    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Management Panel</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
            body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; min-height: 100vh; overflow-x: hidden; }
            .top-bar { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            .menu-btn { background: none; border: none; color: #38bdf8; font-size: 22px; cursor: pointer; }
            .sidebar { height: 100%; width: 260px; position: fixed; z-index: 101; top: 0; left: -260px; background-color: #0f172a; color: white; transition: 0.3s ease-in-out; padding-top: 20px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.05); }
            .sidebar-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .close-btn { background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; }
            .sidebar-links { list-style: none; padding: 20px 0; flex-grow: 1; }
            .sidebar-links li a { padding: 14px 20px; text-decoration: none; font-size: 15px; color: #cbd5e1; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer; }
            .sidebar-links li a:hover, .sidebar-links li a.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
            .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; color: #94a3b8; }
            .sidebar-footer a { color: #38bdf8; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-top: 6px; }
            
            .container { max-width: 950px; margin: 90px auto 30px auto; background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: none; width: 95%; }
            .container.active-section { display: block; }
            
            .section-header-banner { text-align: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; }
            .section-header-banner h2 { color: #38bdf8; font-size: 22px; font-weight: 700; margin-bottom: 5px; }
            .section-header-banner p { color: #94a3b8; font-size: 13px; font-weight: 500; }

            .form-group { margin-bottom: 18px; }
            label { display: block; margin-bottom: 6px; font-weight: 600; color: #94a3b8; font-size: 13px; }
            input, select, textarea { width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none; font-size: 14px; }
            textarea { resize: vertical; height: 110px; }
            .submit-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; }
            .delete-btn { background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.4); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-block; font-size: 11px; }
            .success-btn { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 10px; border-radius: 6px; cursor: default; font-weight: 600; font-size: 11px; }
            .received-btn { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; }
            .sheet-table-wrapper { overflow-x: auto; width: 100%; }
            .sheet-table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 6px; overflow: hidden; margin-top: 15px; min-width: 650px; }
            .sheet-table th { background: #0f172a; color: #38bdf8; border: 1px solid #334155; padding: 10px; font-size: 13px; }
            .sheet-table td { border: 1px solid #334155; padding: 10px; color: #e2e8f0; vertical-align: middle; font-size: 13px; text-align: center; }
            .back-btn-top { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 12px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 6px; }

            @media (max-width: 600px) {
                .container { padding: 15px; margin-top: 80px; }
                .section-header-banner h2 { font-size: 18px; }
            }
        </style>
    </head>
    <body>
        <div class="top-bar">
            <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars-staggered"></i></button>
            <a href="/auth?mode=login" class="back-btn-top"><i class="fa-solid fa-arrow-left"></i> Logout</a>
        </div>

        <div id="mySidebar" class="sidebar">
            <div>
                <div class="sidebar-header">
                    <h3><b>অ্যাডমিন মেনু</b></h3>
                    <button class="close-btn" onclick="toggleSidebar()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <ul class="sidebar-links">
                    <li><a id="admin-nav-paymentSection" onclick="switchAdminSection('paymentSection', this)"><i class="fa-solid fa-wallet"></i> Payment Requests</a></li>
                    <li><a id="admin-nav-categorySection" onclick="switchAdminSection('categorySection', this)"><i class="fa-solid fa-folder-plus"></i> Category & Price</a></li>
                    <li><a id="admin-nav-reportSetSection" onclick="switchAdminSection('reportSetSection', this)"><i class="fa-solid fa-file-lines"></i> Valid UIDs Setup</a></li>
                    <li><a id="admin-nav-idsSection" onclick="switchAdminSection('idsSection', this)"><i class="fa-solid fa-table"></i> Submitted IDs</a></li>
                </ul>
            </div>
            <div class="sidebar-footer">
                <div>Admin Panel</div>
                <a href="/auth?mode=login"><i class="fa-solid fa-user"></i> Go to Login</a>
            </div>
        </div>

        <!-- 1. Payment Requests Section -->
        <div id="paymentSection" class="container">
            <div class="section-header-banner">
                <h2>💳 User Payment Requests Management 💳</h2>
                <p>ইউজারদের পাঠানো পেমেন্ট রিকোয়েস্টগুলো যাচাই করুন এবং টাকা পাঠিয়ে সাকসেস করুন।</p>
            </div>
            <div class="sheet-table-wrapper">
                <table class="sheet-table">
                    <thead>
                        <tr>
                            <th style="width: 45px;">SL</th>
                            <th>User Email</th>
                            <th>Method</th>
                            <th>Account Number</th>
                            <th>Amount</th>
                            <th style="width: 110px;">Action Status</th>
                            <th style="width: 75px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentRequests.length > 0 ? paymentRequests.map((pay, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td style="font-size: 11px; color: #94a3b8;">${pay.userEmail}</td>
                                <td><b>${pay.method}</b></td>
                                <td>${pay.number}</td>
                                <td style="color: #10b981; font-weight: bold;">৳${pay.amount}</td>
                                <td>
                                    ${pay.status === 'Success' 
                                        ? `<button class="success-btn">Success ✓</button>`
                                        : `<form action="/admin/update-payment/${pay.id}" method="POST"><button type="submit" class="received-btn">Send Money</button></form>`
                                    }
                                </td>
                                <td><a href="/admin/delete-payment/${pay.id}" class="delete-btn">Delete</a></td>
                            </tr>
                        `).join('') : `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 20px;">কোনো পেমেন্ট রিকোয়েস্ট নেই!</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 2. Category & Price Section -->
        <div id="categorySection" class="container">
            <div class="section-header-banner">
                <h2>📁 Manage Categories & Pricing 📁</h2>
                <p>নতুন ক্যাটাগরি যুক্ত করুন এবং প্রতিটি আইডির মূল্য নির্ধারণ করুন।</p>
            </div>
            <form action="/admin/add-category" method="POST">
                <div class="form-group">
                    <label>Category Name:</label>
                    <input type="text" name="name" placeholder="যেমন: Free Fire, Gmail..." required>
                </div>
                <div class="form-group">
                    <label>Price (BDT):</label>
                    <input type="number" step="any" name="price" placeholder="৳ মূল্য..." required>
                </div>
                <button type="submit" class="submit-btn" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fa-solid fa-plus"></i> Add Category</button>
            </form>

            <div style="margin-top: 25px;">
                <h3 style="color: #cbd5e1; margin-bottom: 12px; font-size: 15px;">Existing Categories:</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${categories.map(c => `
                        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px;">
                            <span><b>${c.name}</b> (৳${c.price})</span>
                            <a href="/admin/delete-category/${encodeURIComponent(c.name)}" style="color: #f43f5e; text-decoration: none;"><i class="fa-solid fa-xmark"></i></a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- 3. Valid UIDs Setup Section -->
        <div id="reportSetSection" class="container">
            <div class="section-header-banner">
                <h2>📊 Set Valid UIDs for User Claims 📊</h2>
                <p>রিপোর্টের জন্য বৈধ ইউআইডি লিস্ট সেট করুন যা ইউজাররা চেক ও ক্লেম করতে পারবে।</p>
            </div>
            <form action="/admin/save-report" method="POST">
                <div class="form-group">
                    <label>Select Category:</label>
                    <select name="category" id="reportCatSelect" required onchange="loadCategoryUids(this.value)">
                        <option value="">-- Select Category --</option>
                        ${categories.map(c => '<option value="' + c.name + '">' + c.name + '</option>').join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Valid UIDs (Each in a new line or comma separated):</label>
                    <textarea name="uids" id="reportUidsTextarea" placeholder="UID101, UID102..."></textarea>
                </div>
                <button type="submit" class="submit-btn"><i class="fa-solid fa-floppy-disk"></i> Save Report Uids</button>
            </form>
        </div>

        <!-- 4. Submitted IDs Section -->
        <div id="idsSection" class="container">
            <div class="section-header-banner">
                <h2>📋 Submitted IDs Management (Sheet View) 📋</h2>
                <p>ইউজারদের সাবমিট করা অ্যাকাউন্ট ডিটেইলস ফাইলের মতো দেখুন ও ডাউনলোড করুন।</p>
            </div>
            <div class="form-group">
                <label>Filter Submitted IDs by Category:</label>
                <select id="filterCategory" onchange="filterByCategory(this.value)">
                    <option value="">-- All Categories --</option>
                    ${categories.map(c => '<option value="' + c.name + '" ' + (selectedCategory === c.name ? 'selected' : '') + '>' + c.name + '</option>').join('')}
                </select>
            </div>

            <div class="sheet-table-wrapper">
                <table class="sheet-table" style="margin-top: 15px;">
                    <thead>
                        <tr>
                            <th style="width: 45px;">SL</th>
                            <th style="width: 100px;">Category</th>
                            <th>Account Details (File View & Download)</th>
                            <th style="width: 100px;">Status Action</th>
                            <th style="width: 75px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredIds.length > 0 ? filteredIds.map((item, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td><b style="color: #38bdf8;">${item.category}</b></td>
                                <td style="text-align: left; padding: 10px;">${formatAsFileBox(item.details, item.id)}</td>
                                <td>
                                    ${item.status === 'Success' 
                                        ? `<button class="success-btn">Success ✓</button>`
                                        : `<form action="/admin/update-status/${item.id}" method="POST"><button type="submit" class="received-btn">Received</button></form>`
                                    }
                                </td>
                                <td><a href="/delete/${item.id}" class="delete-btn">Delete</a></td>
                            </tr>
                        `).join('') : `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">কোনো আইডি পাওয়া যায়নি!</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <script>
            const allReports = ${JSON.stringify(adminReports)};

            function switchAdminSection(sectionId, element, saveToStorage = true) {
                document.querySelectorAll('.container').forEach(el => el.classList.remove('active-section'));
                document.getElementById(sectionId).classList.add('active-section');
                document.querySelectorAll('.sidebar-links a').forEach(el => el.classList.remove('active'));
                
                if(element) {
                    element.classList.add('active');
                } else {
                    const navEl = document.getElementById('admin-nav-' + sectionId);
                    if(navEl) navEl.classList.add('active');
                }

                if(saveToStorage) {
                    localStorage.setItem('activeAdminSection', sectionId);
                }
                
                const sidebar = document.getElementById("mySidebar");
                if(sidebar.style.left === "0px") {
                    sidebar.style.left = "-260px";
                }
            }

            window.onload = function() {
                const savedSection = localStorage.getItem('activeAdminSection') || 'paymentSection';
                switchAdminSection(savedSection, null, false);
            };

            function toggleSidebar() {
                const sidebar = document.getElementById("mySidebar");
                sidebar.style.left = sidebar.style.left === "0px" ? "-260px" : "0px";
            }
            function loadCategoryUids(cat) {
                const textarea = document.getElementById("reportUidsTextarea");
                if(cat && allReports[cat]) {
                    textarea.value = allReports[cat].join(", ");
                } else {
                    textarea.value = "";
                }
            }
            function filterByCategory(cat) {
                if(cat) {
                    window.location.href = "/admin?category=" + encodeURIComponent(cat);
                } else {
                    window.location.href = "/admin";
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
