var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');
var serialPrefix = "00000000";
var measurementCount = 0; //used to count how many measurements are taken
var maxMeasurements = 60; //adjusts how many measurements are taken before a reset (prevents unit left on)
var apiKey;

statusText.addEventListener('click', onClick);
                            
                            
  function onClick() {
  //statusText.textContent = '...';
  temperatures = [];
    
  //Prompt for API key
  //TODO - proper authentication
  //apiKey = prompt("Please enter the API password");
    apiKey = "kz-staging-2021";


  //Connect to probe
  console.log("V0.1. Connecting to probe...");
  ETISensor.connect()
  //Setup Temperature measurements
  .then(() => ETISensor.startNotificationsTempMeasurement().then(handleTempMeasurement))
  .catch(error => {
    //statusText.textContent = error;
    //statusText.textContent = "Click to connect probe: " + error;
    console.log("Error connecting to probe: " + error)
    statusText.textContent = "Click to connect probe";
  });
}

function tempEvent() {
  
    var tempMeasurement = ETISensor.parseTemperature(event.target.value);
    statusText.innerHTML = tempMeasurement.temperature.toFixed(2) + ' &deg;C';
    temperatures.push(tempMeasurement.temperature);

    //Send tempMeasurement.temperature via Http
    sendData(apiKey, tempMeasurement.temperature, serialPrefix + ETISensor.getDevice().name.substring(0, 8));
    
    
    if (measurementCount >= maxMeasurements) {
      statusText.textContent = 'Please reconnect.';
      ETISensor.stopNotificationsTempMeasurement();
      measurementCount = 0;
    } else {
    measurementCount = measurementCount + 1;
    }
    console.log("Measurement count: " + measurementCount);
    
    //Graph
    drawWaves();
  }


//Handler for new temperature measurement.
function handleTempMeasurement(tempMeasurement) {
  tempMeasurement.addEventListener('characteristicvaluechanged', tempEvent);
}

var temperatures = [];
var mode = 'bar';

canvas.addEventListener('click', event => {
  mode = mode === 'bar' ? 'line' : 'bar';
  drawWaves();
});

function drawWaves() {
  requestAnimationFrame(() => {
    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

    var context = canvas.getContext('2d');
    var margin = 2;
    var max = Math.max(0, Math.round(canvas.width / 11));
    var offset = Math.max(0, temperatures.length - max);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#00796B';
    if (mode === 'bar') {
      for (var i = 0; i < Math.max(temperatures.length, max); i++) {
        var barHeight = Math.round(temperatures[i + offset ] * canvas.height / 100);
        context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }
    } else if (mode === 'line') {
      context.beginPath();
      context.lineWidth = 6;
      context.lineJoin = 'round';
      context.shadowBlur = '1';
      context.shadowColor = '#333';
      context.shadowOffsetY = '1';
      for (var i = 0; i < Math.max(temperatures.length, max); i++) {
        var lineHeight = Math.round(temperatures[i + offset ] * canvas.height / 100);
        if (i === 0) {
          context.moveTo(11 * i, canvas.height - lineHeight);
        } else {
          context.lineTo(11 * i, canvas.height - lineHeight);
        }
        context.stroke();
      }
    }
  });
}

window.onresize = drawWaves;

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawWaves();
  }
});
