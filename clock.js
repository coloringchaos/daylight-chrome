var sunrise, sunset, utcsunrise, utcsunset, dawn, dusk, utcdawn, utcdusk;
var currentTime, daylength, currentdegree, daylightSec, dawnToDusk, elapsed;

var lat, lon;

//get lat saved to chrome
var promiseLat = new Promise(function(resolve, reject) {
  //retrieve stored lat from chrome
  chrome.storage.sync.get("lat", function (data){

    //set saved lat to our variable
    lat = data.lat;
    lon = data.lon;

    //if we have a value, resolve. if not, reject
    if (lat) {
      resolve("got latitude saved in chrome mem: " + lat);
    }
    else {
      reject(Error("can't get lat"));
    }
  })
});

promiseLat.then(function(result) {
  console.log(result);
}, function(err) {
  console.log(err);
});

var promiseLon = new Promise(function(resolve, reject) {
  //retrieve stored lat from chrome
  chrome.storage.sync.get("lon", function (data){

    //set saved lat to our variable
    lon = data.lon;

    //if we have a value, resolve. if not, reject
    if (lon) {
      resolve("got longitude saved in chrome mem: " + lon);
    }
    else {
      reject(Error("can't get lon"));
    }
  })
});

promiseLon.then(function(result) {
  console.log(result);
}, function(err) {
  console.log(err);
});

//if both promises are resolved, then getTodayData
Promise.all([promiseLat, promiseLon]).then(function(){
  // console.log('resolved all! we have coordinates!');
  getTodayData(lat, lon);
});


//get the user's location, do this everytime even if we have something saved
navigator.geolocation.getCurrentPosition(function(position) {
  setLocation(position);
  // console.log("got location");
}, function(positionError) {
  console.error(positionError);
});

// set lat and lon based on the location we just got
function setLocation(data) {
  lat = data.coords.latitude;
  lon = data.coords.longitude;

  //save the lat and lon to chrome for quicker loading in the future
  chrome.storage.sync.set({'lat': lat, 'lon': lon}, function(){
    console.log("location saved");
  });
  getTodayData(lat,lon);
}

//get today's data based on the lat and lon 
//the promises AND getting geoLocation both trigger this
function getTodayData(_lat, _lon){
  // console.log('getTodayData() happened - ' + lat + ", " + lon);
  var times = SunCalc.getTimes(new Date(), _lat, _lon);
  parseTimes(times);
}

//deal with formatting of the json data we got from SunCalc
function parseTimes(json) {
  // console.log('parseTimes() happened');
    //// DUSK / DAWN ////
    utcsunrise = json.sunrise.getTime()/1000;
    utcsunset = json.sunset.getTime()/1000;

    utcdawn = json.dawn.getTime()/1000;
    utcdusk = json.dusk.getTime()/1000;

    // console.log("utc sunrise " + utcsunrise + ", utc sunset " + utcsunset);

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
  // console.log('convertUNIX() happened');
  var date = new Date(UTC*1000);         
  var hours = date.getHours() * 60; 
  var minutes = "0" + date.getMinutes();
  var totalMinutes = parseInt(hours) + parseInt(minutes);
  var totalSeconds = parseInt(totalMinutes) * 60;

  return totalSeconds;
}


function getCurrentTime() {
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
  // console.log('getDaylength() happened');
  //// SUNRISE TO SUNSET - this is sent to the DOM for info popup
  daylightSec = sunset - sunrise;
  console.log("total daylightSec for today: " + daylightSec);

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
  // console.log("hh: " + hh + ", mm: " + mm);

  // document.getElementById('dawnToDuskH').innerHTML = hh;
  // document.getElementById('dawnToDuskM').innerHTML = mm;

  //this will actuall rotate the hand!
  getDegree();
}

function getRiseSetTimes(){
  // console.log('getRiseSetTimes() happened');
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

function getDegree(){
  //get rid of "loading"
  document.getElementById('loading').style.display = "none";

  currentTime = getCurrentTime();
  daylightSec = Math.floor(sunset - sunrise); //retuns the daylength in seconds 
  
  // console.log("total daylight for current day: " + daylightSec + " seconds");

  //calculate the degree
  elapsed = parseInt(currentTime) - parseInt(sunrise);
  currentdegree = (360*elapsed)/daylightSec; //in minutes, 1440 minutes in 24 hours
  // console.log("elapsed seconds: " + elapsed);

  ////////////get remaining time also - for info popup
  var remainingSec = daylightSec - elapsed;
  // console.log("remainingSec: " + remainingSec);

  //convert remainingSec to something human readable (hrs, min, sec)
  var remH = Math.floor(remainingSec / 3600);
  var remM = Math.floor(remainingSec % 3600 / 60);
  // console.log("h: " + h + ", m: " + m + ", s: " + s);

  document.getElementById('remainingH').innerHTML = remH;
  document.getElementById('remainingM').innerHTML = remM;


  
  //currentdegree is NaN until data has loaded, this deals with that
  if(isNaN(currentdegree)){
    currentdegree = 0;
  }

  //if we have rotated the whole way, reset angle to zero
  if (currentdegree > 360 || currentdegree < 0) {
    currentdegree = 0;
  } 

  // console.log("degrees: " + currentdegree);

  function rotate(el, degree) {
    el.setAttribute('transform', 'rotate('+ degree +' 50 50)')
  }

  //rotate the hand
  rotate(hand, currentdegree);
}

//check the degree every second
setInterval(function() {
  getDegree();
}, 1000); //change back to 1000




////////////////////////////////////////
/////////// BACKGROUND STUFF ///////////
////////////////////////////////////////

var bgIndex;

var promiseBg = new Promise(function(resolve, reject) {
  //retrieve stored background index from chrome
  chrome.storage.sync.get("bgIndex", function (data){
    bgIndex = data.bgIndex;
    //if we have a value, resolve. if not, reject
    if (bgIndex) {
      resolve("got bgIndex: " + bgIndex);
    }
    else {
      reject(Error("can't get background"));
    }
  })
});


///THIS ALWAYS FAILS WHEN IT'S GETTING INDEX 0
promiseBg.then(function(result) {
  console.log(result);
  document.getElementById('container').style.backgroundImage = bgImgs[bgIndex];
}, function(err) {
  console.log(err);
});

//pop up the content box when name is clicked
document.getElementById('info').addEventListener("mousedown", function(){
  document.getElementById('content').style.display = "block";
});

//hide the content box and go back to the clock
document.getElementById('hideBtn').addEventListener("mousedown", function(){
  document.getElementById('content').style.display = "none";
});

//CHANGE BG IMAGE
<<<<<<< HEAD
var bgImgs = ["url('img/gradient6.svg')", "url('img/ocean.jpg')", "url('img/gradient5.jpg')", "url('img/mountains.jpg')"];
=======
var bgImgs = ["url('img/gradient5.jpg')", "url('img/gradient6.svg')", "url('img/ocean.jpg')", "url('img/mountains.jpg')"];
>>>>>>> 5a908f719fa505745834f3bcc253a380cb810eca

document.getElementById('bgBtn').addEventListener("mousedown", changebackground);

function changebackground(){
  if(bgIndex < bgImgs.length-1) {
    bgIndex++; 
  }
  else {
     bgIndex = 0;   
  }

  chrome.storage.sync.set({'bgIndex': bgIndex}, function(){
    console.log("bgIndex saved: " + bgIndex);
  });

  document.getElementById('container').style.backgroundImage = bgImgs[bgIndex];
}




////////////////////////////////////////
/////////////  DATE STUFF  /////////////
////////////////////////////////////////

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


//figure out remaining daylight




