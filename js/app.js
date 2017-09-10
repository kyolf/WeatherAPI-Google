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
    windspd:{

    }
  }
};

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
function setMarkerLatLng(data, state) {
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

//Getting the string of the date
function getDateString(date){
  const day = (date.getDate() > 10) ? date.getDate() : `0${date.getDate()}`;
  const month = (date.getMonth()+1 > 10) ? date.getMonth()+1 : `0${date.getMonth()+1}`;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

//WeatherBit API
function fetchWeatherBitApi(state){
  const query = {
    key: 'e5763a0d45a14f7385be5287fa59bdc0',
    lat: state.markerLocation.lat || state.yourLoc.lat,
    lon: state.markerLocation.lng || state.yourLoc.lng,
  };

  $.getJSON('https://api.weatherbit.io/v2.0/current', query, (response) => {
    console.log(response);
  });
  $.getJSON('https://api.weatherbit.io/v2.0/forecast/3hourly', query, function(response){
    console.log('hi',response);
  });
}

//Make and clear markers after initial Map Load
function callbackGoogle(response) {
  if (response !== null) { 
    clearMarker(appState);
    setMarkerLatLng(response, appState);
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
      infoWindow.setContent('Location found.');
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
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}