"use strict";

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const bodyParser = require("body-parser");
const recordRoute = require("./routes/records");

//parser json and populate parsed data in request
app.use(bodyParser.json());

//setting the statics directory
app.use(express.static(path.join(__dirname, "./public/")));


//use record.js file to handle the requests that starts with /things
app.use("/POST/delineation", recordRoute);

//handle root route
app.get("/", (req, res)=>{
    //determine the content-type and automatically set header for us, awesome !!!
    res.sendFile(path.join(__dirname, "/index.html"));    
});

//handle and return response with status and message for not-found error
app.use((req, res, next)=>{
   return res.status(404).send("Page not found");
   //render the 404 error page
});

//for error handling; error handling middleware
app.use((err, req, res, next)=>{
   return res.status(500).send(`Sorry there is error with message saying: ${err.message}`);
})

//listening the port; right now its 3000
app.listen(port, (err)=>{
    if(err){
        console.log(`there is error - ${err}`);
    }
    console.log("listening on port 3000");
});
