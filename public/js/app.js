
// Global App JS

document.addEventListener("DOMContentLoaded",()=>{


    console.log("Premium Panel Loaded");


});


// Simple Alert Helper

function showMessage(message){

    alert(message);

}


// API Request Helper

async function api(url, options={}){


    const response = await fetch(url,{

        headers:{
            "Content-Type":"application/json"
        },

        ...options

    });


    return await response.json();

}
