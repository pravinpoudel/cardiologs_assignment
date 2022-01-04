const fs = require("fs");
const readLine = require("readline");


exports.post_record = (req, res) => {

    //it's not actually needed but i am doing this just for sake of checking
    if (!req.file) {
        return res.status(422).json({
            message: 'The file is required.'
        });
    }

    //checking if file is empty
    if (req.file.size == 0) {
        return res.status(400).send("file is empty");
    }

    try {
        // result storing object
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

        //for mean frequency calculation
        const frequencyCollector = {
            sumOfFrequency: 0,
            cycleCount: 0
        };

        //entries of valid wave type object to check if the wave type in our csv are valid data-sets
        const expectedWave = {
            P: true,
            QRS: true,
            T: true,
            INV: true
        };

        let time = 0;
        let lastTimeStamp = 0;
        let notSupportedFlag= false;

        const rl = readLine.createInterface({
            input: fs.createReadStream(req.file.path)
        });

        rl.on("line", line => {
            const cols = line.split(",");
            const waveType = cols[0];
            const startTime = cols[1];
            const endTime = cols[2];
            const tags = cols.slice(3);

            //just to make sure csv has valid data list
            if (!(waveType in expectedWave && Number(startTime) >= 0 && Number(endTime) > 0)) {
                notSupportedFlag = true;

                rl.close();
                rl.removeAllListeners();
            } 
            
            else {
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
            }


        });

        rl.on("error", (err) => {
            return res.status(500).send(`error is: ${err}`);
        });

        rl.on("close", () => {

            if (notSupportedFlag) {
                notSupportedFlag = false
                return res.status(500).send("File data is not supported format");
            } else {
                let heartRate = Math.floor(frequencyCollector.sumOfFrequency / frequencyCollector.cycleCount);
                results.meanFrequency = heartRate;
                results.maxFrequency.time += Number(req.body.time);
                results.minFrequency.time += Number(req.body.time);
                res.status(200).json(results);
                return;
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(`there is an error with message: ${err.message}`);
        return;
    }
}