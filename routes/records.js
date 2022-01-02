"use strict";

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const readLine = require("readline");
let router = express.Router();

//we dont have limit on fileSize
const fileStorageEngine = multer.diskStorage({
    destination: (req, files, cb1) => {
        cb1(null, "./public/records");
    },
    filename: (req, file, cb2) => {
        //multer will not append file extension for us, so we need to return a filename complete with an extension
        cb2(null, Date.now() + "--" + file.originalname);
    }
});

let upload = multer({
    storage: fileStorageEngine,
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        // choose in between which file should be uplaoded and which should be skipped. Moreover, you can always pass an error
        //if things go wrong like we do
        if (extension === ".csv") {
            callback(null, true);
        } else {
            callback(null, false);
            return callback(new Error("only CSV file allowed"));
        }
    }
});

upload = upload.single("record");

//error in the multer middleware is handled by express itself but if you want to catch the multer error specifically here,
// check with upload(req, res, (err)=>{}); awesome !!! express documentation on multer end is nice explanation on this !!

router.route("/")
    .post(upload, (req, res) => {

        if (!req.file) {
            res.status(422).json({
                message: 'The file is required.'
            });
        }

        if (req.file.size == 0) {
            res.status(400).send("file is empty");
        }

        const results = {
            P: 0,
            QRS: 0,
            meanFrequency: 0,
            minFrequency: {
                value: 9999999,
                time: 0
            },
            maxFrequency: {
                value: 0,
                time: 0
            }
        };

        const frequencyCollector = {
            sumOfFrequency: 0,
            cycleCount: 0
        };

        let time = 0;
        let lastTimeStamp = 0;

        readLine.createInterface({
            input: fs.createReadStream(req.file.path)
        }).on("line", line => {
            const cols = line.split(",");
            const waveType = cols[0];
            const startTime = cols[1];
            const endTime = cols[2];
            const tags = cols.slice(3);
            if ((waveType === "P" || waveType === "QRS") && tags.includes("premature")) {
                results[waveType]++;
            }
            time += (cols[2] - cols[1]);
            time += (cols[1] - lastTimeStamp);
            lastTimeStamp = cols[2];
            if (waveType === "QRS") {
                let frequency = Math.floor((60 / time) * 1000);
                //check if frequency is maxValue or minValue
                if (frequency > results.maxFrequency.value) {
                    results.maxFrequency.value = frequency;
                    results.maxFrequency.time = Number(cols[2]);
                }

                if (frequency < results.minFrequency.value) {
                    results.minFrequency.value = frequency;
                    results.minFrequency.time = Number(cols[2]);
                }

                frequencyCollector.sumOfFrequency += frequency;
                frequencyCollector.cycleCount++;
                time = 0;
            }

        }).on("close", () => {
            let heartRate = Math.floor(frequencyCollector.sumOfFrequency / frequencyCollector.cycleCount);
            results.meanFrequency = heartRate;
            results.maxFrequency.time += Number(req.body.time);
            results.minFrequency.time += Number(req.body.time);
            res.status(200).json(results);
        });
    });

module.exports = router;