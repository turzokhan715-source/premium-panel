const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium ID Sell Panel</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; }
            body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; min-height: 100vh; }
            
            /* Top Bar */
            .top-bar { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            .menu-btn { background: none; border: none; color: #38bdf8; font-size: 22px; cursor: pointer; transition: 0.2s; }
            .menu-btn:hover { color: #0ea5e9; }
            .user-info { display: flex; align-items: center; gap: 20px; font-size: 15px; font-weight: 500; }
            .balance-box { background: linear-gradient(135deg, #10b981, #059669); padding: 6px 14px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 10px rgba(16,185,129,0.3); }

            /* Sidebar */
            .sidebar { height: 100%; width: 260px; position: fixed; z-index: 101; top: 0; left: -260px; background-color: #0f172a; color: white; transition: 0.3s ease-in-out; padding-top: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 5px 0 25px rgba(0,0,0,0.5); border-right: 1px solid rgba(255,255,255,0.05); }
            .sidebar-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .close-btn { background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; }
            .close-btn:hover { color: white; }
            .sidebar-links { list-style: none; padding: 20px 0; flex-grow: 1; }
            .sidebar-links li a { padding: 14px 20px; text-decoration: none; font-size: 16px; color: #cbd5e1; display: flex; align-items: center; gap: 12px; transition: 0.2s; cursor: pointer; }
            .sidebar-links li a:hover, .sidebar-links li a.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
            .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
            .sidebar-footer a { color: #f43f5e; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 10px; cursor: pointer; }

            /* Main Container */
            .container { max-width: 750px; margin: 100px auto 40px auto; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); padding: 35px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: none; }
            .container.active-section { display: block; }
            
            h2 { text-align: center; margin-bottom: 25px; color: #f8fafc; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
            
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #94a3b8; }
            
            select, textarea { width: 100%; padding: 14px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; color: white; outline: none; transition: 0.3s; }
            select:focus, textarea:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2); }
            
            textarea { resize: vertical; height: 120px; }

            .submit-btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 14px; width: 100%; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(14,165,233,0.4); }
            .submit-btn:hover { background: linear-gradient(135deg, #0284c7, #0369a1); transform: translateY(-1px); }

            /* History Section */
            .history-section { margin-top: 40px; }
            .history-section h3 { font-size: 20px; margin-bottom: 15px; color: #cbd5e1; }
            
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
            th, td { padding: 14px; text-align: center; font-size: 14px; }
            th { background: rgba(15, 23, 42, 0.8); color: #38bdf8; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); }
            td { background: rgba(30, 41, 59, 0.4); border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; }

            .badge-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .delete-btn { background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.4); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; }
            .delete-btn:hover { background: #f43f5e; color: white; }
        </style>
    </head>
    <body>

        <!-- Top Bar -->
        <div class="top-bar">
            <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars-staggered"></i></button>
            <div class="user-info">
                <span>স্বাগতম, রাহিম!</span>
                <div class="balance-box">💰 ৳1,250</div>
            </div>
        </div>

        <!-- Sidebar -->
        <div id="mySidebar" class="sidebar">
            <div>
                <div class="sidebar-header">
                    <h3><b>মেনু প্যানেল</b></h3>
                    <button class="close-btn" onclick="toggleSidebar()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <ul class="sidebar-links">
                    <li><a onclick="switchSection('homeSection', this)" class="active"><i class="fa-solid fa-house"></i> Home</a></li>
                    <li><a onclick="switchSection('reportSection', this)"><i class="fa-solid fa-chart-line"></i> Report</a></li>
                    <li><a onclick="alert('Payment পেজটি শীঘ্রই আসছে!')"><i class="fa-solid fa-wallet"></i> Payment</a></li>
                </ul>
            </div>
            <div class="sidebar-footer">
                <a onclick="alert('লগআউট সফল হয়েছে!')"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
            </div>
        </div>

        <!-- Home Section (With History) -->
        <div id="homeSection" class="container active-section">
            <h2>✨ Sell Your ID Securely ✨</h2>
            
            <form onsubmit="submitID(event, 'historyTable')">
                <div class="form-group">
                    <label>Select Category:</label>
                    <select id="category" required>
                        <option value="">-- Select Category --</option>
                        <option value="Free Fire">Free Fire</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Gmail">Gmail</option>
                        <option value="Page">Page</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Account Details (Username / Link & Password):</label>
                    <textarea id="details" placeholder="এখানে আপনার আইডির ইউজারনেম, পাসওয়ার্ড বা বিস্তারিত তথ্য লিখুন..." required></textarea>
                </div>

                <button type="submit" class="submit-btn"><i class="fa-solid fa-paper-plane"></i> Submit ID Now</button>
            </form>

            <div class="history-section">
                <h3>My Submissions History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="historyTable">
                        <tr>
                            <td>Free Fire</td>
                            <td>Level 72, Pass...</td>
                            <td><span class="badge-pending">Pending</span></td>
                            <td><button class="delete-btn" onclick="this.parentElement.parentElement.remove()">Delete</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Report Section (Without History) -->
        <div id="reportSection" class="container">
            <h2>📊 ID Submission Report Form 📊</h2>
            
            <form onsubmit="submitReport(event)">
                <div class="form-group">
                    <label>Select Category:</label>
                    <select id="reportCategory" required>
                        <option value="">-- Select Category --</option>
                        <option value="Free Fire">Free Fire</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Gmail">Gmail</option>
                        <option value="Page">Page</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Account Details (Username / Link & Password):</label>
                    <textarea id="reportDetails" placeholder="এখানে আপনার আইডির ইউজারনেম, পাসওয়ার্ড বা বিস্তারিত তথ্য লিখুন..." required></textarea>
                </div>

                <button type="submit" class="submit-btn"><i class="fa-solid fa-paper-plane"></i> Submit Report</button>
            </form>
        </div>

        <script>
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

            function submitID(event, tableId) {
                event.preventDefault();
                
                const category = document.getElementById("category").value;
                const details = document.getElementById("details").value;
                const table = document.getElementById(tableId);

                const newRow = document.createElement("tr");
                newRow.innerHTML = '<td>' + category + '</td><td>' + details + '</td><td><span class="badge-pending">Pending</span></td><td><button class="delete-btn" onclick="this.parentElement.parentElement.remove()">Delete</button></td>';

                table.prepend(newRow);
                event.target.reset();
                alert("আইডি সফলভাবে সাবমিট হয়েছে!");
            }

            function submitReport(event) {
                event.preventDefault();
                event.target.reset();
                alert("রিপোর্ট সফলভাবে সাবমিট হয়েছে!");
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
