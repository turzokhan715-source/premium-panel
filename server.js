require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 10000;


// ======================
// Middleware
// ======================

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        extended:true
    })
);


app.use(cookieParser());


app.use(
    session({

        secret:process.env.SESSION_SECRET || "secret",

        resave:false,

        saveUninitialized:false,

        cookie:{
            maxAge:1000*60*60*24
        }

    })
);



app.set(
    "view engine",
    "ejs"
);


app.set(
    "views",
    path.join(__dirname,"views")
);



app.use(
    express.static(
        path.join(__dirname,"public")
    )
);



// ======================
// Database
// ======================

const DB = path.join(
    __dirname,
    "data.json"
);



function loadDB(){

    if(!fs.existsSync(DB)){

        fs.writeFileSync(
            DB,
            JSON.stringify(
                {
                    users:[],
                    submissions:[],
                    withdrawals:[],
                    reports:[],
                    notifications:[]
                },
                null,
                2
            )
        );

    }


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



// ======================
// Routes Import
// ======================

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");



// ======================
// Routes Use
// ======================

app.use(
    "/auth",
    authRoutes
);


app.use(
    "/",
    userRoutes
);


app.use(
    "/admin",
    adminRoutes
);


app.use(
    "/api",
    apiRoutes
);



// ======================
// Pages
// ======================

app.get("/",(req,res)=>{

    res.redirect("/login");

});


app.get("/login",(req,res)=>{

    res.render("login");

});


app.get("/register",(req,res)=>{

    res.render("register");

});



// ======================
// Start Server
// ======================

app.listen(PORT,()=>{

    console.log(
        `Server Running on PORT ${PORT}`
    );

});
