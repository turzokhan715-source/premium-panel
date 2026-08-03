
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DB = path.join(__dirname, "..", "data.json");


function loadDB(){

    return JSON.parse(
        fs.readFileSync(DB)
    );

}


function saveDB(data){

    fs.writeFileSync(
        DB,
        JSON.stringify(data,null,2)
    );

}


// Admin Middleware

function adminAuth(req,res,next){

    if(
        !req.session.user ||
        req.session.user.role !== "admin"
    ){

        return res.redirect("/login");

    }

    next();

}


// Admin Panel

router.get("/admin", adminAuth, (req,res)=>{


    const db = loadDB();


    res.render("admin",{

        users:db.users,

        submissions:db.submissions,

        withdrawals:db.withdrawals

    });


});



// Approve Submission

router.post("/submission/approve/:id",adminAuth,(req,res)=>{


    const db = loadDB();


    const item = db.submissions.find(
        s=>s.id == req.params.id
    );


    if(item){

        item.status="approved";

    }


    saveDB(db);


    res.json({

        success:true

    });


});



// Reject Submission

router.post("/submission/reject/:id",adminAuth,(req,res)=>{


    const db = loadDB();


    const item = db.submissions.find(
        s=>s.id == req.params.id
    );


    if(item){

        item.status="rejected";

    }


    saveDB(db);


    res.json({

        success:true

    });


});



// Approve Withdraw

router.post("/withdraw/approve/:id",adminAuth,(req,res)=>{


    const db = loadDB();


    const item = db.withdrawals.find(
        w=>w.id == req.params.id
    );


    if(item){

        item.status="approved";

    }


    saveDB(db);


    res.json({

        success:true

    });


});



module.exports = router;
