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


// Get Current User

router.get("/user", (req,res)=>{


    if(!req.session.user){

        return res.json({
            success:false,
            message:"Not logged in"
        });

    }


    const db = loadDB();


    const user = db.users.find(
        u=>u.id === req.session.user.id
    );


    res.json({

        success:true,

        user

    });


});



// Notifications

router.get("/notifications",(req,res)=>{


    const db = loadDB();


    res.json({

        success:true,

        notifications:db.notifications || []

    });


});



// Add Balance (Admin Use)

router.post("/balance/add",(req,res)=>{


    const {userId, amount} = req.body;


    const db = loadDB();


    const user = db.users.find(
        u=>u.id === userId
    );


    if(!user){

        return res.json({

            success:false,

            message:"User not found"

        });

    }


    user.balance += Number(amount);


    saveDB(db);


    res.json({

        success:true

    });


});



module.exports = router;
