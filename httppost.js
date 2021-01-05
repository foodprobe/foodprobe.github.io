function sendData(authKey, temperature, probeId) {


//Setup
var url = "https://integration.koolzone.com:80/api/live-probe-reading";
var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    
xmlhttp.open("POST", url, true);
xmlhttp.setRequestHeader("Content-Type", "application/json");
xmlhttp.setRequestHeader("Authorization", "Basic " + authKey); 

//Add Handler
xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
    if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      //TODO: Should provide some feedback when probe fails to tx data
        //alert(xmlhttp.responseText);
    }
}

//Send
xmlhttp.send(JSON.stringify({ "temperature": temperature, "probeId" : probeId, "timeStamp" : Date.now()}));

}
