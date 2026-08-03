const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HTML UI Response
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ID Sell User Panel</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { background-color: #f4f6f9; color: #333; }
            .top-bar { background: #2c3e50; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
            .menu-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
            .user-info { display: flex; align-items: center; gap: 20px; font-size: 14px; }
            .balance-box { background: #27ae60; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
            .sidebar { height: 100%; width: 250px; position: fixed; z-index: 101; top: 0; left: -250px; background-color: #2c3e50; color: white; transition: 0.3s; padding-top: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 0 5px rgba(0,0,0,0.3); }
            .sidebar-header { padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #34495e; }
            .close-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
            .sidebar-links { list-style: none; padding: 20px 0; flex-grow: 1; }
            .sidebar-links li a { padding: 12px 20px; text-decoration: none; font-size: 16px; color: white; display: block; transition: 0.2s; }
            .sidebar-links li a:hover { background: #34495e; }
            .sidebar-footer { padding: 20px; border-top: 1px solid #34495e; }
            .sidebar-footer a { color: #e74c3c; text-decoration: none; font-weight: bold; display: block; }
            .container { max-width: 700px; margin: 80px auto 30px auto; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            h2 { text-align: center; margin-bottom: 20px; color: #2c3e50; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 14px; }
            select, input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
            .submit-btn { background: #3498db; color: white; border: none; padding: 12px; width: 100%; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; }
            .submit-btn:hover { background: #2980b9; }
            .history-section { margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 13px; }
            th { background: #f8f9fa; }
            .badge-pending { background: #f39c12; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .delete-btn { background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; }
        </style>
    </head>
    <body>
        <div class="top-bar">
            <button class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
            <div class="user-info">
                <span>স্বাগতম, রাহিম!</span>
                <div class="balance-box">💰 ৳1,250</div>
            </div>
        </div>

        <div id="mySidebar" class="sidebar">
            <div>
                <div class="sidebar-header">
                    <h3>মেনু</h3>
                    <button class="close-btn" onclick="toggleSidebar()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <ul class="sidebar-links">
                    <li><a href="#"><i class="fa-solid fa-chart-line"></i> Report</a></li>
                    <li><a href="#"><i class="fa-solid fa-wallet"></i> Payment</a></li>
                </ul>
            </div>
            <div class="sidebar-footer">
                <a href="#"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
            </div>
        </div>

        <div class="container">
            <h2>Sell Your ID Securely</h2>
            <form onsubmit="submitID(event)">
                <div class="form-group">
                    <label>Select Category:</label>
                    <select id="category" required>
                        <option value="">-- Select Category --</option>
                        <option value="Free Fire">Free Fire</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Gmail">Gmail</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Account Details:</label>
                    <input type="text" id="details" placeholder="Enter details..." required>
                </div>
                <div class="form-group">
                    <label>Asking Price (BDT):</label>
                    <input type="number" id="price" placeholder="e.g., 500" required>
                </div>
                <button type="submit" class="submit-btn">Submit ID Now</button>
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

        <script>
            function toggleSidebar() {
                const sidebar = document.getElementById("mySidebar");
                sidebar.style.left = sidebar.style.left === "0px" ? "-250px" : "0px";
            }
            function submitID(event) {
                event.preventDefault();
                const category = document.getElementById("category").value;
                const details = document.getElementById("details").value;
                const table = document.getElementById("historyTable");
                const newRow = document.createElement("tr");
                newRow.innerHTML = \`
                    <td>\${category}</td>
                    <td>\${details}</td>
                    <td><span class="badge-pending">Pending</span></td>
                    <td><button class="delete-btn" onclick="this.parentElement.parentElement.remove()">Delete</button></td>
                \`;
                table.prepend(newRow);
                alert("আইডি সফলভাবে সাবমিট হয়েছে!");
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
