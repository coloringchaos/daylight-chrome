var sunrise, sunset, utcsunrise, utcsunset;
var currentTime, currentdegree, daylength;

var myArray = [];
// get user location from the browser
navigator.geolocation.getCurrentPosition(function(position) {
  getLocation(position)
}, function(positionError) {
  console.error(positionError);
});

function getLocation(data) {
  var lat = data.coords.latitude;
  var lon = data.coords.longitude;
  console.log("lat = " + lat + ", lon = " + lon);

  getTodayData(lat, lon);
}

function parseTimes(json) {
  utcsunrise = json.sunrise.getTime()/1000;
  utcsunset = json.sunset.getTime()/1000;
  console.log("utc sunrise " + utcsunrise + ", utc sunset " + utcsunset);

  sunrise = convertUNIX(utcsunrise);
  sunset = convertUNIX(utcsunset);
  console.log("sunrise is at " + sunrise + " seconds, sunset is at " + sunset + " seconds");
}

function getTodayData(_lat, _lon){
  var times = SunCalc.getTimes(new Date(), _lat, _lon);

  parseTimes(times);
  // console.log(times);
}

/*
the function convertUNIX takes a UTC timestamp and finds the seconds in THAT particular day
there are 86400 seconds in a day - so the sunrise should be sometime around 2000-3000 seconds, and sunset should be 5000++
*/
var convertUNIX = function(UTC) {
  var date = new Date(UTC*1000);         
  var hours = date.getHours() * 60; 
  var minutes = "0" + date.getMinutes();
  var totalMinutes = parseInt(hours) + parseInt(minutes);
  var totalSeconds = parseInt(totalMinutes) * 60;

  return totalSeconds;

  alert();
}

function getCurrentTime() {
  //this is getting the number of seconds that have elapsed since the beginning of TODAY - it resets to zero at midnight
  date = new Date();
  hours = date.getHours() * 60; 
  minutes = "0" + date.getMinutes();
  seconds = date.getSeconds();
  totalMinutes = parseInt(hours) + parseInt(minutes);

  var totalSeconds = (parseInt(totalMinutes) * 60) + parseInt(seconds);
  return totalSeconds;
}

//for debugging
function checkDaylight() {
  if (utcCurrentTime > utcsunrise && utcCurrentTime < utcsunset){
    console.log("it is currently light out");
  } else {
    console.log("it is currently dark out");
  }
}

setInterval(function() {
  currentTime = getCurrentTime();
  var daylightSec = Math.floor(sunset - sunrise); //retuns the daylength in seconds 
  // console.log("total daylight for current day: " + daylightSec + " seconds");

  //calculate the degree
  var elapsed = parseInt(currentTime) - parseInt(sunrise);
  currentdegree = (360*elapsed)/daylightSec; //in minutes, 1440 minutes in 24 hours
  if (currentdegree > 360 || currentdegree < 0) {
    currentdegree = 0;
  } 

  // console.log(currentdegree);
  function rotate(el, degree) {
    el.setAttribute('transform', 'rotate('+ degree +' 50 50)')
  }

  rotate(hand, currentdegree);

}, 1000);




