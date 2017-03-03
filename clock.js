var sunrise, sunset, utcsunrise, utcsunset;
var currentTime, daylength, currentdegree, daylightSec;
var loaded = false;

//dont show the clock face at first
// document.getElementById("hands").style.display = "none";


// get user location from the browser
navigator.geolocation.getCurrentPosition(function(position) {
  getLocation(position)
}, function(positionError) {
  console.error(positionError);
});

//set lat and lon
function getLocation(data) {
  var lat = data.coords.latitude;
  var lon = data.coords.longitude;
  console.log("lat = " + lat + ", lon = " + lon);

  getTodayData(lat, lon);
  loaded = true;
  // console.log("LOADED");
  showClock();
}

//do this on load - once we have lat lon data, show clock and hide 'loading'
function showClock(){
  console.log("showing clock");
  document.getElementById('hands').style.display = "block";
  document.getElementById('loading').style.display = "none";
}

//get today's data
function getTodayData(_lat, _lon){
  var times = SunCalc.getTimes(new Date(), _lat, _lon);

    // console.log(times);
    parseTimes(times);
}

//deal with formatting of the json data we got from SunCalc
function parseTimes(json) {
    //////////// DUSK / DAWN
    utcsunrise = json.dawn.getTime()/1000;
    utcsunset = json.dusk.getTime()/1000;


    //////////// SUNRISE / SUNSET
    // utcsunrise = json.sunrise.getTime()/1000;
    // utcsunset = json.sunset.getTime()/1000;
    // console.log("utc sunrise " + utcsunrise + ", utc sunset " + utcsunset);


    //convert to UNIX - used for rotation calculation
    sunrise = convertUNIX(utcsunrise);
    sunset = convertUNIX(utcsunset);
    // console.log("sunrise is at " + sunrise + " seconds, sunset is at " + sunset + " seconds");

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
  var date = new Date(UTC*1000);         
  var hours = date.getHours() * 60; 
  var minutes = "0" + date.getMinutes();
  var totalMinutes = parseInt(hours) + parseInt(minutes);
  var totalSeconds = parseInt(totalMinutes) * 60;

  // console.log('date' + date);
  return totalSeconds;
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

function getDaylength(){
  /////GET DAY LENGTH - this is sent to the DOM for info popup
  daylightSec = sunset - sunrise;
  console.log("daylightSec: " + daylightSec);

  //convert daylightSec to something human readable (hrs, min, sec)
  var h = Math.floor(daylightSec / 3600);
  var m = Math.floor(daylightSec % 3600 / 60);
  var s = Math.floor(daylightSec % 3600 % 60);
  console.log("h: " + h + ", m: " + m + ", s: " + s);

  document.getElementById('lengthH').innerHTML = h;
  document.getElementById('lengthM').innerHTML = m;
  // document.getElementById('lengthS').innerHTML = s;

}

function getRiseSetTimes(){
  //GET SUNRISE TIME - then send this to the DOM
  //this is for the '?' popup
  var rise = new Date(0); // The 0 there is the key, which sets the date to the epoch
  rise.setUTCSeconds(utcsunrise);
  var riseHrs = rise.getHours();
  var riseMin = rise.getMinutes();

  // console.log('sunrise: ' + rise);

  if(riseMin<10){
    document.getElementById('riseMin').innerHTML = '0' + riseMin;
  }else{
    document.getElementById('riseMin').innerHTML = riseMin;
  }
  document.getElementById('riseHrs').innerHTML = riseHrs;
  

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

  // console.log('sunset:' + set);
  document.getElementById('setHrs').innerHTML = setHrs;
    
}


setInterval(function() {
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

}, 1000);





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


