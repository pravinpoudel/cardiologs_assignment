"use strict";

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const bodyParser = require("body-parser");
const recordRoute = require("./routes/records");

app.use(bodyParser.json());

//setting the statics
app.use(express.static(path.join(__dirname, "./public/")));


//use record.js file to handle the requests that starts with /things
//settingup the delineation route
app.use("/POST/delineation", recordRoute);

app.get("/", (req, res)=>{
    //determine the content-type and automatically set header for us, awesome !!!
    res.sendFile(path.join(__dirname, "/index.html"));    
});

app.use((req, res, next)=>{
   return res.status(404).send("Page not found");
});

//for error handling; error handling middleware
app.use((err, req, res, next)=>{
   return res.status(500).send(`Sorry there is error with message saying: ${err.message}`);
})

app.listen(port, (err)=>{
    if(err){
        console.log(`there is error - ${err}`);
    }
    console.log("listening on port 3000");
});
