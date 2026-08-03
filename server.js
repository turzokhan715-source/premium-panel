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

let submittedIds = [
    { 
        id: 1, 
        category: "Free Fire", 
        details: "61592277435372 Turzokhan29 ps_n=1; sb=LmRpana1Fv0_kZlIrS3uC0Db;\n61592319103567 Turzokhan29 fr=0ArvGMvmkcliTdRU7.AWd6g0EqJYuVMWnFqrhoisV0rmrbjLbA6q_eKtlPx", 
        status: "Pending" 
    }
];

let adminReports = {
    "Free Fire": ["61592277435372", "61592319103567", "61592730895703"],
    "Facebook": ["FB999", "FB888"]
};

// Track already claimed UIDs globally per category
let claimedUidsStore = {
    "Free Fire": [],
    "Facebook": [],
    "Gmail": [],
    "Page": []
};

// Payment requests array
let paymentRequests = [
    { id: 1, method: "Bkash", number: "01712345678", amount: 500, status: "Pending" }
];

// User state container
let userData = {
    name: "রাহিম",
    balance: 1250
};

// Helper function: Fixed design for file box layout
function formatAsFileBox(detailsText, itemId) {
    const lines = detailsText.split('\n').filter(line => line.trim() !== '');
    let fileHtml = `<div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 450px;">`;
    
    fileHtml += `<div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; text-align: left; max-height: 150px; overflow-y: auto; font-family: 'Courier New', Courier, monospace; font-size: 11px; display: flex;">`;
    
    fileHtml += `<div style="background: #1e293b; color: #64748b; padding: 8px 8px; user-select: none; border-right: 1px solid #334155; text-align: right;">`;
    lines.forEach((_, idx) => { fileHtml += `<div>${idx + 1}</div>`; });
    fileHtml += `</div>`;

    fileHtml += `<div style="padding: 8px 10px; color: #e2e8f0; white-space: pre-wrap; word-break: break-all; flex-grow: 1;">`;
    lines.forEach(line => { fileHtml += `<div>${line}</div>`; });
    fileHtml += `</div></div>`;

    fileHtml += `<a href="/admin/download/${itemId}" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.4); padding: 5px 10px; border-radius: 5px; font-size: 12px; text-decoration: none; font-weight: bold; width: fit-content;"><i class="fa-solid fa-download"></i> Download File (.txt)</a>`;
    
    fileHtml += `</div>`;
    return fileHtml;
}

// ================= USER PANEL ROUTE =================
app.get('/', (req, res) => {
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
            body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; min-height: 100vh; }
            .top-bar { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            .menu-btn { background: none; border: none; color: #38bdf8; font-size: 22px; cursor: pointer; }
            .user-info { display: flex; align-items: center; gap: 20px; font-size: 15px; font-weight: 500; }
            .balance-box { background: linear-gradient(135deg, #10b981, #059669); padding: 6px 14px; border-radius: 20px; font-weight: bold; }
            .sidebar { height: 100%; width: 260px; position: fixed; z-index: 101; top: 0; left: -260px; background-color: #0f172a; color: white; transition: 0.3s ease-in-out; padding-top: 20px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.05); }
            .sidebar-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .close-btn { background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; }
            .sidebar-links { list-style: none; padding: 20px 0; flex-grow: 1; }
            .sidebar-links li a { padding: 14px 20px; text-decoration: none; font-size: 16px; color: #cbd5e1; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer; }
            .sidebar-links li a:hover, .sidebar-links li a.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
            .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; color: #94a3b8; }
            .sidebar-footer a { color: #38bdf8; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-top: 6px; }
            .container { max-width: 900px; margin: 100px auto 40px auto; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); padding: 35px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: none; }
            .container.active-section { display: block; }
            h2 { text-align: center; margin-bottom: 25px; color: #f8fafc; font-size: 26px; font-weight: 700; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #94a3b8; }
            select, input, textarea { width: 100%; padding: 14px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; color: white; outline: none; }
            textarea { resize: vertical; height: 120px; }
            .submit-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 14px; width: 100%; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; }
            .history-section { margin-top: 40px; }
            .history-section h3 { font-size: 20px; margin-bottom: 15px; color: #cbd5e1; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
            th, td { padding: 14px; text-align: center; font-size: 14px; vertical-align: middle; }
            th { background: rgba(15, 23, 42, 0.8); color: #38bdf8; font-weight: 600; }
            td { background: rgba(30, 41, 59, 0.4); border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; }
            .badge-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .delete-btn { background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.4); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-decoration: none; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="top-bar">
            <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars-staggered"></i></button>
            <div class="user-info">
                <span>স্বাগতম, ${userData.name}!</span>
                <div class="balance-box" id="userBalance">💰 ৳${userData.balance}</div>
            </div>
        </div>

        <div id="mySidebar" class="sidebar">
            <div>
                <div class="sidebar-header">
                    <h3><b>মেনু প্যানেল</b></h3>
                    <button class="close-btn" onclick="toggleSidebar()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <ul class="sidebar-links">
                    <li><a onclick="switchSection('homeSection', this)" class="active"><i class="fa-solid fa-house"></i> Home</a></li>
                    <li><a onclick="switchSection('reportSection', this)"><i class="fa-solid fa-chart-line"></i> Report</a></li>
                    <li><a onclick="switchSection('paymentSection', this)"><i class="fa-solid fa-wallet"></i> Payment</a></li>
                </ul>
            </div>
            <div class="sidebar-footer">
                <div>Support Admin:</div>
                <a href="https://web.telegram.org/a/#8629952050" target="_blank"><i class="fa-brands fa-telegram"></i> @Gmail_generator1</a>
            </div>
        </div>

        <!-- Home Section -->
        <div id="homeSection" class="container active-section">
            <h2>✨ Sell Your ID Securely ✨</h2>
            <form action="/submit-id" method="POST">
                <div class="form-group">
                    <label>Select Category:</label>
                    <select name="category" required>
                        <option value="">-- Select Category --</option>
                        ${categories.map(c => `<option value="${c.name}">${c.name} (Price: ৳${c.price})</option>`).join('')}
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
                        <tr><th style="width: 120px;">Category</th><th>Details (File View)</th><th style="width: 100px;">Status</th><th style="width: 80px;">Action</th></tr>
                    </thead>
                    <tbody>
                        ${submittedIds.map(item => `
                            <tr>
                                <td><b>${item.category}</b></td>
                                <td style="text-align: left; padding: 10px;">${formatAsFileBox(item.details, item.id)}</td>
                                <td><span class="${item.status === 'Success' ? 'badge-success' : 'badge-pending'}">${item.status}</span></td>
                                <td><a href="/delete/${item.id}" class="delete-btn">Delete</a></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Report Section -->
        <div id="reportSection" class="container">
            <h2>📊 ID Report & Claim Box 📊</h2>
            <div class="form-group">
                <label>Select Category:</label>
                <select id="userReportCategory" onchange="clearUserMatchResult()">
                    <option value="">-- Select Category --</option>
                    ${categories.map(c => `<option value="${c.name}">${c.name} (৳${c.price} per valid ID)</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Paste UIDs (Each in a new line or comma separated):</label>
                <textarea id="userUidsInput" placeholder="UID101, UID999, etc..."></textarea>
            </div>
            <button type="button" class="submit-btn" onclick="checkUserUids()"><i class="fa-solid fa-magnifying-glass"></i> Check & Match UIDs</button>

            <div id="matchResultBox" style="margin-top: 25px; display: none;">
                <h3 style="margin-bottom: 10px; color: #cbd5e1;">Matching Result:</h3>
                <div id="matchedListContainer" style="background: rgba(15,23,42,0.6); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); max-height: 200px; overflow-y: auto; margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 8px;"></div>
                <button type="button" id="claimBtn" class="submit-btn" style="background: linear-gradient(135deg, #10b981, #059669); display: none;" onclick="claimRewards()"><i class="fa-solid fa-hand-holding-dollar"></i> Claim Reward to Balance</button>
            </div>
        </div>

        <!-- Payment Section -->
        <div id="paymentSection" class="container">
            <h2>💳 Request Payment & History 💳</h2>
            <form action="/request-payment" method="POST">
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
                    <input type="number" name="amount" placeholder="পরিমাণ..." required>
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
                        ${paymentRequests.length > 0 ? paymentRequests.map(pay => `
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
            let userBalance = ${userData.balance};
            let currentClaimableUids = [];
            let currentClaimableAmount = 0;

            const adminReportsData = ${JSON.stringify(adminReports)};
            const claimedUidsStoreData = ${JSON.stringify(claimedUidsStore)};
            const categoryPrices = ${JSON.stringify(categories.reduce((acc, c) => ({...acc, [c.name]: c.price}), {}))};

            function toggleSidebar() {
                const sidebar = document.getElementById("mySidebar");
                sidebar.style.left = sidebar.style.left === "0px" ? "-260px" : "0px";
            }
            function switchSection(sectionId, element) {
                document.querySelectorAll('.container').forEach(el => el.classList.remove('active-section'));
                document.getElementById(sectionId).classList.add('active-section');
                document.querySelectorAll('.sidebar-links a').forEach(el => el.classList.remove('active'));
                element.classList.add('active');
                toggleSidebar();
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

                    containerHtml += \`<div style="background: \${bgColor}; border: 1px solid \${borderColor}; color: \${textColor}; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 13px;">\${uid}\${badgeText}</div>\`;
                });

                document.getElementById("matchedListContainer").innerHTML = containerHtml;
                document.getElementById("matchResultBox").style.display = "block";

                const claimBtn = document.getElementById("claimBtn");
                if(currentClaimableUids.length > 0) {
                    claimBtn.style.display = "block";
                    claimBtn.innerHTML = \`<i class="fa-solid fa-hand-holding-dollar"></i> Claim Reward (\${currentClaimableUids.length} New Valid IDs = ৳\${currentClaimableAmount})\`;
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
                    body: JSON.stringify({ category: category, uids: currentClaimableUids })
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
    const { category, details } = req.body;
    if (category && details) {
        submittedIds.push({
            id: submittedIds.length > 0 ? submittedIds[submittedIds.length - 1].id + 1 : 1,
            category: category,
            details: details,
            status: "Pending"
        });
    }
    res.redirect('/');
});

// Handle Claim Reward Endpoint
app.post('/claim-rewards', (req, res) => {
    const { category, uids } = req.body;
    const pricePerId = categories.find(c => c.name === category)?.price || 0;
    
    if(!claimedUidsStore[category]) claimedUidsStore[category] = [];

    let newValidUids = uids.filter(uid => !claimedUidsStore[category].includes(uid));
    let earnedAmount = newValidUids.length * pricePerId;

    if(earnedAmount > 0) {
        claimedUidsStore[category].push(...newValidUids);
        userData.balance += earnedAmount;
        res.json({ success: true, newBalance: userData.balance, addedAmount: earnedAmount });
    } else {
        res.json({ success: false, message: "এই ইউআইডিগুলো ইতিমধ্যে ক্লেম করা হয়েছে!" });
    }
});

// Handle Payment Request (Deduct from balance and save to history)
app.post('/request-payment', (req, res) => {
    const { method, number, amount } = req.body;
    const reqAmount = parseFloat(amount);

    if(reqAmount > 0 && reqAmount <= userData.balance) {
        userData.balance -= reqAmount;
        paymentRequests.push({
            id: paymentRequests.length > 0 ? paymentRequests[paymentRequests.length - 1].id + 1 : 1,
            method: method,
            number: number,
            amount: reqAmount,
            status: "Pending"
        });
    }
    res.redirect('/');
});

// Handle Delete ID
app.get('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    submittedIds = submittedIds.filter(s => s.id !== id);
    if(req.headers.referer && req.headers.referer.includes('/admin')) {
        res.redirect('/admin');
    } else {
        res.redirect('/');
    }
});

// Handle Delete Payment Request
app.get('/admin/delete-payment/:id', (req, res) => {
    const id = parseInt(req.params.id);
    paymentRequests = paymentRequests.filter(p => p.id !== id);
    res.redirect('/admin');
});

// Handle Download ID File (.txt)
app.get('/admin/download/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = submittedIds.find(s => s.id === id);
    if(item) {
        res.setHeader('Content-disposition', `attachment; filename=${item.category}_ID_${item.id}.txt`);
        res.setHeader('Content-type', 'text/plain');
        res.write(item.details);
        res.end();
    } else {
        res.status(404).send("File not found!");
    }
});

// Handle Admin Status Update to Success (Submitted IDs)
app.post('/admin/update-status/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = submittedIds.find(s => s.id === id);
    if(item) {
        item.status = "Success";
    }
    res.redirect('/admin');
});

// Handle Admin Payment Request Status Update to Success
app.post('/admin/update-payment/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const payment = paymentRequests.find(p => p.id === id);
    if(payment) {
        payment.status = "Success";
    }
    res.redirect('/admin');
});

// Handle Admin Add Category & Price
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

// Handle Admin Delete Category
app.get('/admin/delete-category/:name', (req, res) => {
    const catName = req.params.name;
    categories = categories.filter(c => c.name !== catName);
    res.redirect('/admin');
});

// Handle Admin Save/Update Report UIDs
app.post('/admin/save-report', (req, res) => {
    const { category, uids } = req.body;
    if (category) {
        const uidArray = uids ? uids.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0) : [];
        adminReports[category] = uidArray;
    }
    res.redirect('/admin');
});

// ================= ADMIN PANEL ROUTE =================
app.get('/admin', (req, res) => {
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
            body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; min-height: 100vh; }
            .top-bar { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            .menu-btn { background: none; border: none; color: #38bdf8; font-size: 22px; cursor: pointer; }
            .sidebar { height: 100%; width: 260px; position: fixed; z-index: 101; top: 0; left: -260px; background-color: #0f172a; color: white; transition: 0.3s ease-in-out; padding-top: 20px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.05); }
            .sidebar-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .close-btn { background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; }
            .sidebar-links { list-style: none; padding: 20px 0; flex-grow: 1; }
            .sidebar-links li a { padding: 14px 20px; text-decoration: none; font-size: 16px; color: #cbd5e1; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer; }
            .sidebar-links li a:hover, .sidebar-links li a.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
            .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; color: #94a3b8; }
            .sidebar-footer a { color: #38bdf8; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-top: 6px; }
            
            .container { max-width: 950px; margin: 100px auto 40px auto; background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); padding: 35px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: none; }
            .container.active-section { display: block; }
            h2 { text-align: center; margin-bottom: 25px; color: #38bdf8; font-size: 26px; font-weight: 700; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; font-weight: 600; color: #94a3b8; font-size: 14px; }
            input, select, textarea { width: 100%; padding: 14px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none; font-size: 15px; }
            textarea { resize: vertical; height: 120px; }
            .submit-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 14px; width: 100%; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
            .delete-btn { background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.4); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-block; font-size: 12px; }
            .success-btn { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 6px 12px; border-radius: 6px; cursor: default; font-weight: 600; font-size: 12px; }
            .received-btn { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; }
            .sheet-table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 6px; overflow: hidden; margin-top: 15px; }
            .sheet-table th { background: #0f172a; color: #38bdf8; border: 1px solid #334155; padding: 12px; font-size: 14px; }
            .sheet-table td { border: 1px solid #334155; padding: 12px; color: #e2e8f0; vertical-align: middle; font-size: 14px; text-align: center; }
            .back-btn-top { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 6px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px; }
        </style>
    </head>
    <body>
        <div class="top-bar">
            <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars-staggered"></i></button>
            <a href="/" class="back-btn-top"><i class="fa-solid fa-arrow-left"></i> User Panel</a>
        </div>

        <div id="mySidebar" class="sidebar">
            <div>
                <div class="sidebar-header">
                    <h3><b>অ্যাডমিন মেনু</b></h3>
                    <button class="close-btn" onclick="toggleSidebar()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <ul class="sidebar-links">
                    <li><a onclick="switchSection('paymentSection', this)" class="active"><i class="fa-solid fa-wallet"></i> Payment Requests</a></li>
                    <li><a onclick="switchSection('categorySection', this)"><i class="fa-solid fa-folder-plus"></i> Category & Price</a></li>
                    <li><a onclick="switchSection('reportSetSection', this)"><i class="fa-solid fa-file-lines"></i> Valid UIDs Setup</a></li>
                    <li><a onclick="switchSection('idsSection', this)"><i class="fa-solid fa-table"></i> Submitted IDs</a></li>
                </ul>
            </div>
            <div class="sidebar-footer">
                <div>Admin Panel</div>
                <a href="/"><i class="fa-solid fa-user"></i> Go to User Panel</a>
            </div>
        </div>

        <!-- 1. Payment Requests Section -->
        <div id="paymentSection" class="container active-section">
            <h2>💳 User Payment Requests 💳</h2>
            <table class="sheet-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">SL</th>
                        <th>Method</th>
                        <th>Account Number</th>
                        <th>Amount</th>
                        <th style="width: 120px;">Action Status</th>
                        <th style="width: 80px;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${paymentRequests.length > 0 ? paymentRequests.map((pay, idx) => `
                        <tr>
                            <td>${idx + 1}</td>
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
                    `).join('') : `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">কোনো পেমেন্ট রিকোয়েস্ট নেই!</td></tr>`}
                </tbody>
            </table>
        </div>

        <!-- 2. Category & Price Section -->
        <div id="categorySection" class="container">
            <h2>📁 Manage Category & Price 📁</h2>
            <form action="/admin/add-category" method="POST">
                <div class="form-group">
                    <label>Category Name:</label>
                    <input type="text" name="name" placeholder="যেমন: Free Fire, Gmail..." required>
                </div>
                <div class="form-group">
                    <label>Price (BDT):</label>
                    <input type="number" name="price" placeholder="৳ মূল্য..." required>
                </div>
                <button type="submit" class="submit-btn" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fa-solid fa-plus"></i> Add Category</button>
            </form>

            <div style="margin-top: 25px;">
                <h3 style="color: #cbd5e1; margin-bottom: 12px; font-size: 16px;">Existing Categories:</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${categories.map(c => `
                        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 6px; display: flex; align-items: center; gap: 12px; font-size: 14px;">
                            <span><b>${c.name}</b> (৳${c.price})</span>
                            <a href="/admin/delete-category/${encodeURIComponent(c.name)}" style="color: #f43f5e; text-decoration: none;"><i class="fa-solid fa-xmark"></i></a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- 3. Valid UIDs Setup Section -->
        <div id="reportSetSection" class="container">
            <h2>📊 Set Valid UIDs for Reports 📊</h2>
            <form action="/admin/save-report" method="POST">
                <div class="form-group">
                    <label>Select Category:</label>
                    <select name="category" id="reportCatSelect" required onchange="loadCategoryUids(this.value)">
                        <option value="">-- Select Category --</option>
                        ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
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
            <h2>📋 Submitted IDs (Google Sheet View) 📋</h2>
            <div class="form-group">
                <label>Filter Submitted IDs by Category:</label>
                <select id="filterCategory" onchange="filterByCategory(this.value)">
                    <option value="">-- All Categories --</option>
                    ${categories.map(c => `<option value="${c.name}" ${selectedCategory === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>

            <table class="sheet-table" style="margin-top: 20px;">
                <thead>
                    <tr>
                        <th style="width: 50px;">SL</th>
                        <th style="width: 120px;">Category</th>
                        <th>Account Details (File View & Download)</th>
                        <th style="width: 110px;">Status Action</th>
                        <th style="width: 80px;">Action</th>
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

        <script>
            const allReports = ${JSON.stringify(adminReports)};
            
            function toggleSidebar() {
                const sidebar = document.getElementById("mySidebar");
                sidebar.style.left = sidebar.style.left === "0px" ? "-260px" : "0px";
            }
            function switchSection(sectionId, element) {
                document.querySelectorAll('.container').forEach(el => el.classList.remove('active-section'));
                document.getElementById(sectionId).classList.add('active-section');
                document.querySelectorAll('.sidebar-links a').forEach(el => el.classList.remove('active'));
                element.classList.add('active');
                toggleSidebar();
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
