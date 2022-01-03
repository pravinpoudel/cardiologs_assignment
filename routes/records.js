"use strict";

const express = require("express");
const multer = require("multer");
const path = require("path");
let router = express.Router();

const RecordController = require("../controller/recordController")
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
    .post(upload, RecordController.post_record);

module.exports = router;