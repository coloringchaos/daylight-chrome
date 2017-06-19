var sunrise, sunset, utcsunrise, utcsunset, dawn, dusk, utcdawn, utcdusk;
var currentTime, daylength, currentdegree, daylightSec, dawnToDusk;
var loaded = false;
var gotlocation = false;

var lat, lon;

// getLat();
// getLon();

var getLat = new Promise(function(resolve,reject){
  chrome.storage.sync.get("lat", function (data) {
    lat = data.lat;
  });

  if(lat){
    console.log("i have the saved lat: " + lat);
    resolve("it worked");
  }
  else{
    reject(Error("got nothing"));
  }

});


getLat.then(function(result){
  console.log(result); // "Stuff worked!"
}, function(err) {
  console.log(err); // Error: "It broke"
});

// function getLon(){
//   chrome.storage.sync.get("lon", function (data) {
//     lon = data.lon;
//     console.log("saved lon: " + lon);
    
//   });
//   return true;
// }

// if(getLat){
//   console.log("getLat is true");
//   getTodayData(lat,lon);
// }



// on load, check if we have a location saved - if we do, save it to global lat, lon
// window.addEventListener("load", function(event) {
//   chrome.storage.sync.get("lat", function (data) {
//     lat = data.lat;
//     console.log("saved lat: " + lat);
//   });
//   chrome.storage.sync.get("lon", function (data) {
//     lon = data.lon;
//     console.log("saved lon: " + lon);
//   });
//   // console.log(lat + ", " + lon);
//   // getTodayData(lat, lon);
// });

// if(lat){
//   console.log("FUCK YES");
// }


//if we DO have a latitude and longitude...
if(lat !== undefined && lon !== undefined){
  console.log("WE HAVE A LOCATION");
  console.log("the saved lat is: " + lat + ", the saved lon is: " + lon);
  getTodayData(lat, lon);
  // loaded = true;
}

// //if we don't have a latitude and longitude, get it
// if(lat == undefined || lon == undefined){
//   console.log("WE DON'T HAVE LOCATION, GETTING IT");
//   // get user location from the browser
//   navigator.geolocation.getCurrentPosition(function(position) {
//     getLocation(position)
//   }, function(positionError) {
//     console.error(positionError);
//   });
// }

//set lat and lon based on the location we just got
function getLocation(data) {
  console.log('getLocation() happened');
  lat = data.coords.latitude;
  lon = data.coords.longitude;

  //save the lat and lon to chrome for quicker loading in the future
  chrome.storage.sync.set({'lat': lat, 'lon': lon}, function(){
    console.log("location saved");
  });
  getTodayData(lat,lon);
}


//do this on load - once we have lat lon data, show clock and hide 'loading'
function showClock(){
  console.log('showClock() happened');
  document.getElementById('hands').style.display = "block";
  document.getElementById('loading').style.display = "none";
}

//get today's data
function getTodayData(_lat, _lon){
  console.log('getTodayData() happened - ' + lat + ", " + lon);
  var times = SunCalc.getTimes(new Date(), _lat, _lon);
  parseTimes(times);
}

//deal with formatting of the json data we got from SunCalc
function parseTimes(json) {
  console.log('parseTimes() happened');
    //// DUSK / DAWN ////
    utcsunrise = json.sunrise.getTime()/1000;
    utcsunset = json.sunset.getTime()/1000;

    utcdawn = json.dawn.getTime()/1000;
    utcdusk = json.dusk.getTime()/1000;

    //// SUNRISE / SUNSET ////
    // utcsunrise = json.sunrise.getTime()/1000;
    // utcsunset = json.sunset.getTime()/1000;
    console.log("utc sunrise " + utcsunrise + ", utc sunset " + utcsunset);


    //convert to UNIX - used for rotation calculation
    sunrise = convertUNIX(utcsunrise);
    sunset = convertUNIX(utcsunset);

    dawn = convertUNIX(utcdawn);
    dusk = convertUNIX(utcdusk);
    
    getRiseSetTimes();
    getDaylength();
}

/*
convertUNIX function takes a UTC timestamp and finds 
the sunrise and sunset time in seconds for THAT particular day

there are 86400 seconds in a day - so the sunrise should be 
sometime around 2000-3000 seconds, and sunset should be 5000++
*/
var convertUNIX = function(UTC) {
  console.log('convertUNIX() happened');
  var date = new Date(UTC*1000);         
  var hours = date.getHours() * 60; 
  var minutes = "0" + date.getMinutes();
  var totalMinutes = parseInt(hours) + parseInt(minutes);
  var totalSeconds = parseInt(totalMinutes) * 60;

  return totalSeconds;
}


function getCurrentTime() {
  // console.log('getCurrentTime() happened');
  /* this is getting the number of seconds that have elapsed 
  since the beginning of TODAY - it resets to zero at midnight */
  date = new Date();
  hours = date.getHours() * 60; 
  minutes = "0" + date.getMinutes();
  seconds = date.getSeconds();
  totalMinutes = parseInt(hours) + parseInt(minutes);

  var totalSeconds = (parseInt(totalMinutes) * 60) + parseInt(seconds);
  return totalSeconds;
}

function getDaylength(){
  console.log('getDaylength() happened');
  //// SUNRISE TO SUNSET - this is sent to the DOM for info popup
  daylightSec = sunset - sunrise;
  console.log("daylightSec: " + daylightSec);

  //convert daylightSec to something human readable (hrs, min, sec)
  var h = Math.floor(daylightSec / 3600);
  var m = Math.floor(daylightSec % 3600 / 60);
  var s = Math.floor(daylightSec % 3600 % 60);
  // console.log("h: " + h + ", m: " + m + ", s: " + s);

  document.getElementById('lengthH').innerHTML = h;
  document.getElementById('lengthM').innerHTML = m;
  
  /////DAWN TO DUSK
  dawnToDusk = dusk - dawn;

  //convert daylightSec to something human readable (hrs, min, sec)
  var hh = Math.floor(dawnToDusk / 3600);
  var mm = Math.floor(dawnToDusk % 3600 / 60);
  var ss = Math.floor(dawnToDusk % 3600 % 60);
  console.log("hh: " + hh + ", mm: " + mm);

  document.getElementById('dawnToDuskH').innerHTML = hh;
  document.getElementById('dawnToDuskM').innerHTML = mm;

}

function getRiseSetTimes(){
  console.log('getRiseSetTimes() happened');
  //GET SUNRISE TIME - then send this to the DOM
  //this is for the '?' popup

  /////SUNRISE
  var rise = new Date(0); // The 0 there is the key, which sets the date to the epoch
  rise.setUTCSeconds(utcsunrise);
  var riseHrs = rise.getHours();
  var riseMin = rise.getMinutes();

  if(riseMin<10){
    document.getElementById('riseMin').innerHTML = '0' + riseMin;
  }else{
    document.getElementById('riseMin').innerHTML = riseMin;
  }
  document.getElementById('riseHrs').innerHTML = riseHrs;
  

  //////SUNSET
  var set = new Date(0);
  set.setUTCSeconds(utcsunset);
  var setHrs = set.getHours() - 12;
  var setMin = set.getMinutes();

  //add zero if it's less than 10 for formatting 
  if(setMin < 10){
    document.getElementById('setMin').innerHTML = '0' + setMin;
  }else{
    document.getElementById('setMin').innerHTML = setMin;
  }

  document.getElementById('setHrs').innerHTML = setHrs;

  /////DAWN
  var dawn = new Date(0); // The 0 there is the key, which sets the date to the epoch
  dawn.setUTCSeconds(utcdawn);
  var dawnHrs = dawn.getHours();
  var dawnMin = dawn.getMinutes();

  if(dawnMin<10){
    document.getElementById('dawnMin').innerHTML = '0' + dawnMin;
  }else{
    document.getElementById('dawnMin').innerHTML = dawnMin;
  }
  document.getElementById('dawnHrs').innerHTML = dawnHrs;

  /////DUSK
  var dusk = new Date(0); // The 0 there is the key, which sets the date to the epoch
  dusk.setUTCSeconds(utcdusk);
  var duskHrs = dusk.getHours() - 12;
  var duskMin = dusk.getMinutes();

  if(duskMin<10){
    document.getElementById('duskMin').innerHTML = '0' + duskMin;
  }else{
    document.getElementById('duskMin').innerHTML = duskMin;
  }
  document.getElementById('duskHrs').innerHTML = duskHrs;
    
}


setInterval(function() {
  console.log('loaded: ' + loaded);
  currentTime = getCurrentTime();
  daylightSec = Math.floor(sunset - sunrise); //retuns the daylength in seconds 
  
  // console.log("total daylight for current day: " + daylightSec + " seconds");

  //calculate the degree
  var elapsed = parseInt(currentTime) - parseInt(sunrise);
  currentdegree = (360*elapsed)/daylightSec; //in minutes, 1440 minutes in 24 hours
  
  //currentdegree is NaN until data has loaded, this deals with that
  if(isNaN(currentdegree)){
    currentdegree = 0;
  }

  //if we have rotated the whole way, reset angle to zero
  if (currentdegree > 360 || currentdegree < 0) {
    currentdegree = 0;
  } 

  console.log("current degrees: " + currentdegree);

  function rotate(el, degree) {
    el.setAttribute('transform', 'rotate('+ degree +' 50 50)')
  }

  rotate(hand, currentdegree);

}, 5000); //change back to 1000





/////////// INTERACTIVE STUFF FOR INDEX - background and info buttons

var bgIndex = 0;

//pop up the content box when name is clicked
document.getElementById('info').addEventListener("mousedown", function(){
  document.getElementById('content').style.display = "block";
});

//hide the content box and go back to the clock
document.getElementById('hideBtn').addEventListener("mousedown", function(){
  document.getElementById('content').style.display = "none";
});

//CHANGE BG IMAGE
var bgImgs = ["url('img/ocean.jpg')", "url('img/gradient6.svg')", "url('img/gradient5.jpg')", "url('img/mountains.jpg')"];

document.getElementById('bgBtn').addEventListener("mousedown", function(){

  if(bgIndex < bgImgs.length-1) {
    bgIndex++;
    
  }
  else {
     bgIndex = 0;   
  }

  console.log("bgIndex: " + bgIndex);

  document.getElementById('container').style.backgroundImage = bgImgs[bgIndex];
  
});


/////////////////DATE STUFF - for the clock on the '?' popup

var isTwelveHour = true;

//HTML references
var hourContainer = document.getElementById('hour');
var separatorContainer = document.getElementById('separator');
var minuteContainer = document.getElementById('minute');
var meridiemContainer = document.getElementById('meridiem');
var weekdayContainer = document.getElementById('weekday');
var monthContainer = document.getElementById('month');
var dayContainer = document.getElementById('day');

function startTime() {
    // Date components
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var day = today.getDate();
    var weekday = today.getDay();
    var hour = today.getHours();
    var minute = today.getMinutes();
    var daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var monthsOfTheYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];


    if(minute < 10){
        minute = "0" + minute;
    }

    if(hour == 0){
        hour = 12;
    };

    //12 hour specific
    if (isTwelveHour) {
        if (hour > 12) {
            hour = hour % 12;
            meridiem = 'pm';
        } else {
            meridiem = 'am';
        }
    }
    //24 hour specific
    if (!isTwelveHour) {
        meridiem = null;
        if (hour < 10) {
            hour = parseInt("0" + hour);
        }
    }

    //HTML Assignments
    hourContainer.innerHTML = hour;
    minuteContainer.innerHTML = minute;
    meridiemContainer.innerHTML = meridiem;
    weekdayContainer.innerHTML = daysOfTheWeek[weekday];
    monthContainer.innerHTML = monthsOfTheYear[month];
    dayContainer.innerHTML = day;
}


startTime();

//Run the script continually
setInterval(startTime, 500);


