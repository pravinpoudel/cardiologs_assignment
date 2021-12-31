"use strict";

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-stream");
const through2 = require("through2");
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
        let file = req.file;
        let peCount = 0;
        let qrsCount = 0;
        fs.createReadStream(file.path).pipe(
                csv.createStream({
                    delimiter: ',',
                    columns: ['wave', 'onstart', 'onend', 'tag1', "tag2", "tag3", "tag4"],
                    escapeChar: '"',
                    enclosedChar: '"'
                })).pipe(through2({
                objectMode: true
            })).on('data', data => {
                console.log(data);
            }).on('end', () => {
                console.log('end')
            })
            .on('error', err => {
                console.error(err)
            }); 
    });

module.exports = router;