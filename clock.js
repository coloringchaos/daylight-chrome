
var sunriseUTC, sunsetUTC;
var sunrise, sunset;

var currentTime;
var now;
var daylength;

var hours, minutes, seconds;
var currentdegree;

var str;
var json;

var lat;
var lon;

//toggle information
$( "#item" ).hide();
$( "#button" ).click(function() {
  $( "#item" ).toggle();
});

navigator.geolocation.getCurrentPosition(function(position) {
    console.log(position);
    parseLocation(position)
}, function(positionError) {
    console.error(positionError);
});

function parseLocation(data) {
  lat = data.coords.latitude;
  // console.log(lat);
  lon = data.coords.longitude;
  // console.log(lon);
  getWeather();
}

function getWeather() {
  $.ajax({
    url: "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon,
    dataType: 'json',
    success: function(data) {
      console.log(data);
      parseMyJson(data);
    },
    error: function() {
      alert("looks like you aren't connected to the internet");
    }
  });
}


function parseMyJson(json) {
   sunriseUTC = json.sys.sunrise;
   sunrise = convertUNIX(sunriseUTC);
   console.log("sunrise: " + sunrise);

   sunsetUTC = json.sys.sunset;
   sunset = convertUNIX(sunsetUTC);
   console.log("sunset: " + sunset);

   daylength = parseInt(sunset) - parseInt(sunrise);
   console.log("daylength:" + daylength);

   currentTime = getCurrentTime();
   now = parseInt(currentTime) - parseInt(sunrise);
   console.log('right now = ' + now);

   checkDayLight(); 
} 

var convertUNIX = function(UTC) {
   var date = new Date(UTC*1000);   // multiplied by 1000 so that the argument is in milliseconds to work with javascript
   
   var hours = date.getHours() * 60; 
   var minutes = "0" + date.getMinutes();
   var totalMinutes = parseInt(hours) + parseInt(minutes);

   var totalSeconds = parseInt(totalMinutes) * 60;
   return totalSeconds;
}

function getCurrentTime() {
   date = new Date();
   hours = date.getHours() * 60; 
   minutes = "0" + date.getMinutes();
   seconds = date.getSeconds();
   totalMinutes = parseInt(hours) + parseInt(minutes);
   
   var totalSeconds = (parseInt(totalMinutes) * 60) + parseInt(seconds);
   return totalSeconds;
}

// check to see if it's currently within daylight hours
// mostly for debugging...can delete later
function checkDayLight() {
   if (currentTime > sunset || currentTime < sunrise) {
      console.log("IT'S DARK");
      return;
   } else {
      console.log("IT'S LIGHT OUT");
   }
}

setInterval(function() {
   //update now - this happens above also, maybe move to function to avoid redundancy?
   currentTime = getCurrentTime();
   now = parseInt(currentTime) - parseInt(sunrise);
   
   //update daylight - add this in case browser is open for a long time

   currentdegree = (360*now)/daylength; //in minutes, 1440 minutes in 24 hours

   if (currentdegree > 360 || currentdegree < 0){
      currentdegree = 0;
   }

   function rotate(el, degree) {
      el.setAttribute('transform', 'rotate('+ degree +' 50 50)')
   }
   
   rotate(hand, currentdegree);

   // constantly printing degree in console
   // console.log('current degree: ' + currentdegree);

   //print the stuff to the screen
   document.getElementById('degree').innerHTML = "current degree: " + currentdegree.toFixed(1);
   document.getElementById('daylength').innerHTML = "hours of daylight " +(daylength/3600).toFixed(2);
   document.getElementById('time').innerHTML = date;

}, 1000);


