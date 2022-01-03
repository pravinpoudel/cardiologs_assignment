document.getElementById("reset-btn").onclick = function(e) {
    document.getElementById("form").reset();
    const statusRecord = document.getElementById("statusRecord");
    const statusTime = document.getElementById("statusTime");
    statusRecord.textContent = "";
    statusTime.textContent = "";
}

document.getElementById('csv-upload-btn').onclick = function(e) {
    e.preventDefault();
    try {
        const _acceptedFileExtensions = ".csv";
        const statusRecord = document.getElementById("statusRecord");
        const statusTime = document.getElementById("statusTime");
        const holter_summary = document.getElementsByClassName("holter_summary")[0];
        holter_summary.style.display = "none";
        let files = document.getElementById("recordFile").files;
        if (files.length > 0 && dateMS > 0) {
            let formData = new FormData();
            let file = files[0];
            if (file.name.match(/.(csv)$/i)) {
                // document.getElementById('csv-upload-btn').style.display = "none";
                formData.append("record", file);
                formData.append("time", dateMS);
                let xhr = new XMLHttpRequest();
                xhr.onprogress = function(e) {};
                xhr.onreadystatechange = function() {
                    try{
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            const response = JSON.parse(xhr.responseText);
                            console.log(response);
                            holter_summary.style.display = "block";
                            document.getElementById("pCount").textContent = response.P;
                            document.getElementById("qrsCount").textContent = response.QRS;
                            document.getElementById("meanFrequency").textContent = response.meanFrequency;
                            document.getElementById("minFrequency").textContent = response.minFrequency.value;
                            document.getElementById("minFrequencyTime").textContent = new Date(Number(response.minFrequency.time)).toLocaleString();
                            document.getElementById("maxFrequency").textContent = response.maxFrequency.value;
                            document.getElementById("maxFrequencyTime").textContent = new Date(Number(response.maxFrequency.time)).toLocaleString();
                            document.getElementsByClassName("holter_summary")[0].scrollIntoView({
                                behavior: "smooth"
                            });
                        }

                    }

                      catch (err) {
                        console.error(err);
                    }



                };
                xhr.open("POST", "/POST/delineation", true);
                xhr.send(formData);
            } else {
                console.warn("format is not supported");
                statusRecord.style.display = "block";
                statusRecord.textContent = `file  is not a valid file type, please select again`;
            }
        } else {
            if (files.length == 0) {
                statusRecord.textContent = "Please select the record file that you want to process";
                console.error("Please select the record file that you want to process");
            }
            if (dateMS === 0) {
                statusTime.textContent = "please select a time when you started recording";
                console.error("please select a time when you started recording");
            }
        }
        }
      
    }