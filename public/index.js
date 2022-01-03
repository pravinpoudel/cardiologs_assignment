document.getElementById("reset-btn").onclick = function(e) {
    document.getElementById("form").reset();
    const statusRecord = document.getElementById("statusRecord");
    const statusTime = document.getElementById("statusTime");
    statusRecord.textContent = "";
    statusTime.textContent = "";
}

const validDate = (files, date)=>{
            if (files.length > 0 && dateMS > 0 ) {
                if(files[0].name.match(/.(csv)$/i)){
                    return true;
                }
            }
            if (files.length == 0) {
                statusRecord.style.display = "block";
                statusRecord.textContent = "Please select the record file that you want to process";
                console.error("Please select the record file that you want to process");
            }

            if (dateMS === 0) {
                statusTime.textContent = "please select a time when you started recording";
                console.error("please select a time when you started recording");
            }
            return false;
        }

document.getElementById('csv-upload-btn').onclick = function(e) {
        e.preventDefault();
        const _acceptedFileExtensions = ".csv";
        const statusRecord = document.getElementById("statusRecord");
        const statusTime = document.getElementById("statusTime");
        const holter_summary = document.getElementsByClassName("holter_summary")[0];
        const responseStatus =  document.getElementById("response-status");
        holter_summary.style.display = "none";
        responseStatus.style.display = "none";
        let files = document.getElementById("recordFile").files;
        if(validDate(files, dateMS)){
            let formData = new FormData();
            let file = files[0];
            // document.getElementById('csv-upload-btn').style.display = "none";
                formData.append("record", file);
                formData.append("time", dateMS);
               axios({
                method: 'post',
                url: '/POST/delineation',
               data: formData,
               config: { headers: {'Content-Type': 'multipart/form-data' }}
                }).then(function (response){
                            response = response.data;
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
                )
                .catch( function (err){
                    responseStatus.style.display = "block";
                    document.getElementById("response-status").textContent = err.response.data;
                    console.error(`catched server error that ${err.response.data}`);
                })  
            } 
            
       
      
    }