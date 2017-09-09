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
  map: null
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

//make a marker every time u click
function makeMarker(state) {
  state.marker.push(new google.maps.Marker({
    position: state.markerLocation,
    map: state.map,
  }));
}

//clear the marker from the map
function clearMarker(state) {
  state.marker.map(el => el.setMap(null));
}

function changeToMaps() {
  $('.home_page').on('click', 'button', function(event){
    console.log('hi');
    $('.map_weather').removeClass('hidden');
    $('.home_page_background').addClass('hidden');
  });
}

// function eventListeners(state){
//   changeToMaps();
// }

$(changeToMaps());

function callbackGoogle(response) {
  if (response !== null) { // if not initial query
    clearMarker(appState);
    setMarkerLatLng(response, appState);
    makeMarker(appState);
  }
  // queryOpenWeather(appState);
}
// var map;
// function initMap() {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: -34.397, lng: 150.644},
//     zoom: 8
//   });
// }

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

function handleLocationError(browserHasGeolocation, infoWindow, map) {
  infoWindow.setPosition(map.getCenter());
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}