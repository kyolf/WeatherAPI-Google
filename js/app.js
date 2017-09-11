'use strict';

const appState = {
  yourLoc:{
    lat: null,
    lng: null
  },
  markerLocation:{
    lat: null,
    lng: null
  },
  marker: [],
  map: null,
  curWeather:{
    city:{
      city_name:null,
      country:null
    },
    wind:{
      windDir:null,
      windSpd:null,
    },
    weather:{},
    temp:null,
    clouds:null,
    date:null,
    rh:null
  },
  tmrWeather:{
    city:{
      city_name:null,
      country:null
    },
    wind:{
      windDir:null,
      windSpd:null,
    },
    weather:{},
    temp:null,
    clouds:null,
    date:null,
    rh:null
  },
  dayAfterTmrWeather:{
    city:{
      city_name:null,
      country:null
    },
    wind:{
      windDir:null,
      windSpd:null,
    },
    weather:{},
    temp:null,
    clouds:null,
    date:null,
    rh:null
  }
};

//rearrange Dates to MM/DD/YYYY
function reArrangeDates(date){
  const day = date.substring(8,10);
  const month = date.substring(5,7);
  const year = date.substring(0,4);
  return `${month}/${day}/${year}`;
}

//Getting the string of the date
function getDateString(date){
  const curDay = date.getDate();
  const curMonth = date.getMonth() + 1;

  const day = (curDay > 10) ? curDay : `0${curDay}`;
  const month = (curMonth > 10) ? curMonth : `0${curMonth}`;
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

//Set map to google maps
function setMap(map, state) {
  state.map = map;
  return state.map;
}

//Set Lat and Lng
function setLatLng(pos, state) {
  const yourLoc = state.yourLoc;
  yourLoc.lat = pos.lat;
  yourLoc.lng = pos.lng;
  return state.yourLoc;
}

//Set Marker Lat and Lng
function setMarkerLatLng(state, data) {
  const markerLoc = state.markerLocation;
  markerLoc.lat = data.latLng.lat();
  markerLoc.lng = data.latLng.lng();
  return markerLoc;
}

//Make a marker every time u click
function makeMarker(state) {
  state.marker.push(new google.maps.Marker({
    position: state.markerLocation,
    map: state.map,
  }));
}

//Clear the marker from the map
function clearMarker(state) {
  state.marker.map(el => el.setMap(null));
}

//Modify the curWeather Values
function setCurWeatherValuesToState(state, data){
  const curWeather = state.curWeather;
  
  if(data){
    curWeather.city.city_name = data.city_name;
    curWeather.city.country = data.country_code;
    curWeather.wind.windDir = data.wind_cdir_full;
    curWeather.wind.windSpd = data.wind_spd;
    curWeather.weather = data.weather;
    curWeather.temp = data.temp;
    curWeather.clouds = data.clouds;
    curWeather.date = data.datetime;
    curWeather.rh = data.rh;
  }
  
  return curWeather;
}

//Modify the Forecast Values
function setForecastWeatherValuesToState(forecast, response, data){
  if(response){
    forecast.city.city_name = response.city_name;
    forecast.city.country = response.country_code;
    forecast.wind.windDir = data.wind_cdir_full;
    forecast.wind.windSpd = data.wind_spd;
    forecast.weather = data.weather;
    forecast.temp = data.temp;
    forecast.clouds = data.clouds;
    forecast.date = data.datetime;
    forecast.rh = data.rh;
  }
  
  return forecast;  
}

//render the weather values
function renderWeather(stateDate, element){
  element.html(`
    <p class="city_name">${stateDate.city.city_name}, ${stateDate.city.country}</p>
    <img class="weather_icons" src="icons/${stateDate.weather.icon}.png"/>
    <p class="weather_description">${stateDate.weather.description}</p>
    <div class="weather_details">
      <p>${stateDate.temp}&deg;F</p>
      <p>${stateDate.rh}% humidity</p>
      <p>${stateDate.clouds}% cloudy</p>
    </div>
    <p class="wind_details">Wind is blowing at ${stateDate.wind.windSpd} mph
       in the ${stateDate.wind.windDir} direction.</p>`);
}

//render the dates
function renderDates(element){
  const today = new Date();
  const tmr = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTmr = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
  element.html(`
    <article class="date_box">
      <p>${getDateString(today)}</p>
    </article>
    <article class="date_box">
      <p>${getDateString(tmr)}</p>
    </article>
    <article class="date_box">
      <p>${getDateString(dayAfterTmr)}</p>
    </article>`);
    
}

function eventListeners(state){
  renderWeather(state.curWeather, $('.weather_info'));
}

//WeatherBit API
function fetchWeatherBitApi(state){
  const query = {
    key: 'e5763a0d45a14f7385be5287fa59bdc0',
    units: 'I',
    lat: state.markerLocation.lat || state.yourLoc.lat,
    lon: state.markerLocation.lng || state.yourLoc.lng,
  };

  $.getJSON('https://api.weatherbit.io/v2.0/current', query, (response) => {
    console.log(response);
    renderDates($('.date'));
    setCurWeatherValuesToState(appState, response.data[0]);
    renderWeather(state.curWeather, $('.weather_info'));
  });
  $.getJSON('https://api.weatherbit.io/v2.0/forecast/3hourly', query, function(response){
    console.log('hi',response);
  });
}

//Make and clear markers after initial Map Load
function callbackGoogle(response) {
  if (response !== null) { 
    clearMarker(appState);
    setMarkerLatLng(appState, response);
    makeMarker(appState);
  }
  fetchWeatherBitApi(appState);
}

//Initializes the Google Map
function initMap() {
  var uluru = {
    lat: -25.363,
    lng: 131.044
  };
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru,
  });

  setMap(map, appState);
  const infoWindow = new google.maps.InfoWindow;
  getYourCoords(infoWindow, appState);

  //clicking on google maps
  google.maps.event.addDomListener(map, 'click', callbackGoogle);
  // eventListeners(appState);

}

//Get your Coordinates
function getYourCoords(infoWindow, state) {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //modification to state
      setLatLng(pos, state);

      callbackGoogle(null);
      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found. Click Anywhere On the Map or Enter ZipCode to Begin!');
      infoWindow.open(state.map);
      state.map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, state.map);
    });
  } 
  else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, state.map);
  }
}

//Handles Geolocation (Your Location) Errors
function handleLocationError(browserHasGeolocation, infoWindow, map) {
  infoWindow.setPosition(map.getCenter());
  infoWindow.setContent(browserHasGeolocation ?
    'The Geolocation service was blocked. Click Anywhere On the Map or Enter ZipCode to Begin!' :
    'Your browser doesn\'t support geolocation. Click Anywhere On the Map or Enter ZipCode to Begin!');
  infoWindow.open(map);
}