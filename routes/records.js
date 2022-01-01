"use strict";

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const readLine = require("readline");
let router = express.Router();

const fileStorageEngine = multer.diskStorage({
    destination: (req, files, cb1) => {
        cb1(null, "./public/records");
    },
    filename: (req, file, cb2) => {
        cb2(null, Date.now() + "--" + file.originalname);
    }
});

const upload = multer({
    storage: fileStorageEngine
});

//error in the multer middleware is handled by express itself
router.route("/")
    .post(upload.single("record"), (req, res) => {
       const filePath = req.file.path;
       const results = {
         P:0, 
         QRS:0,
         meanFrequency: 0,
         minFrequency:{
         value: 9999999,
         time: 0
       },
       maxFrequency:{
         value: 0,
         time: 0
       }
         };

       const frequencyCollector = {sumOfFrequency: 0, cycleCount:0};

        let time  = 0;
        let lastTimeStamp = 0;

        readLine.createInterface({
          input: fs.createReadStream(filePath)
        }).on("line", line=>{
          const cols = line.split(",");
          const waveType = cols[0];
          const startTime = cols[1];
          const endTime = cols[2];
          const tags = cols.slice(3);
          if((waveType === "P" || waveType === "QRS") && tags.includes("premature")){
            results[waveType]++;
          }
          
          time += (cols[2] - cols[1]);
          time += (cols[1] - lastTimeStamp);
          lastTimeStamp = cols[2];

          if(waveType === "QRS"){
            let frequency = Math.floor((60/time)*1000);
            //check if frequency is maxValue or minValue
            if(frequency > results.maxFrequency.value){
              results.maxFrequency.value = frequency;
              results.maxFrequency.time = Number(cols[2]); 
            }

            if(frequency<results.minFrequency.value){
              results.minFrequency.value = frequency;
              results.minFrequency.time = Number(cols[2]); 
            }

            frequencyCollector.sumOfFrequency += frequency;
            frequencyCollector.cycleCount ++;
            time = 0;
          }

        }).on("close", ()=>{
          let heartRate = Math.floor(frequencyCollector.sumOfFrequency/frequencyCollector.cycleCount);
          results.meanFrequency = heartRate;
          results.maxFrequency.time += Number(req.body.time);
          results.minFrequency.time += Number(req.body.time);
          res.status(200).json(results);
        });
    });

module.exports = router;