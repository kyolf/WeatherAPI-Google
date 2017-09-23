'use strict';

const appState = {
  yourLoc:{
    lat: null,
    lng: null
  },
  markerLocation:{
    lat: null,
    lng: null,
  },
  invalidZipcode: false,
  zipCodeSearch: false,
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
    rh:null,
    showing: true
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
    rh:null,
    showing: false
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
    rh:null,
    showing: false
  }
};

//checks if you enter valid country code and zipcode inputs
function checkValidZipCodeCountry(zipCode, country) {
  if(isNaN(country) && !isNaN(zipCode)) {
    return true;
  }
  else if(!isNaN(country) || isNaN(zipCode)) {
    return false;
  }
}

//change to correct Tabs
function tabChange(curWeatherState, curElement, changedWeatherState, changedElement) {
  if(curWeatherState.showing){
    curWeatherState.showing = false;
    changedWeatherState.showing = true;
    changeDateTabsCss(curElement, changedElement);
  }
}

//Getting the string of the date
function getDateString(date) {
  const curDay = date.getDate();
  const curMonth = date.getMonth() + 1;

  const day = (curDay >= 10) ? curDay : `0${curDay}`;
  const month = (curMonth >= 10) ? curMonth : `0${curMonth}`;
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

//Set Marker Lat and Lng from Google Point
function setMarkerLatLngGoogle(state, data) {
  const markerLoc = state.markerLocation;
  markerLoc.lat = data.latLng.lat();
  markerLoc.lng = data.latLng.lng();
  return markerLoc;
}

//Set Marker Lat and Lng from Zipcode
function setMarkerLatLngZipcode(state, data) {
  const markerLoc = state.markerLocation;
  if(state.zipCodeSearch) {
    markerLoc.lat = Number(data.lat);
    markerLoc.lng = Number(data.lon);
    state.zipCodeSearch = false;
  }
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
function setCurWeatherValuesToState(state, data) {
  const curWeather = state.curWeather;
  const tmrWeather = state.tmrWeather;
  const dayAfter = state.dayAfterTmrWeather;
  
  if(data){
    curWeather.city.city_name = data.city_name;
    curWeather.city.country = data.country_code;

    //In order to make city consistent 
    //(weather api rounds lat and lng)
    tmrWeather.city.city_name = data.city_name;
    tmrWeather.city.country = data.country_code;
    
    dayAfter.city.city_name = data.city_name;
    dayAfter.city.country = data.country_code;

    curWeather.wind.windDir = data.wind_cdir_full;
    curWeather.wind.windSpd = data.wind_spd;
    curWeather.weather = data.weather;
    curWeather.temp = data.temp;
    curWeather.clouds = data.clouds;
    curWeather.rh = data.rh;

    setMarkerLatLngZipcode(state, data);
  }
  
  return curWeather;
}

//Modify the Forecast Values
function setForecastWeatherValuesToState(forecast, data) {
  if(data){
    forecast.wind.windDir = data.wind_cdir_full;
    forecast.wind.windSpd = data.wind_spd;
    forecast.weather = data.weather;
    forecast.temp = data.temp;
    forecast.clouds = data.clouds;
    forecast.rh = data.rh;
  }
  
  return forecast;  
}

//render the weather values
function renderWeather(stateDate, element) {
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
       in the ${stateDate.wind.windDir} direction.
    </p>`);
}

//render the dates
function renderDates(element) {
  const today = new Date();
  const tmr = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTmr = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
  element.html(`
    <article class="date_box today_js">
      <p>${getDateString(today)}</p>
    </article>
    <article class="date_box gray date_border tmr_js">
      <p>${getDateString(tmr)}</p>
    </article>
    <article class="date_box gray date_border dayAfterTmr_js">
      <p>${getDateString(dayAfterTmr)}</p>
    </article>`);
}

//render the zipcode stuff
function renderZipCode(element){
  element.html(` 
    <h1 class="app_title">Weather Mapper</h1>         
    <p class="welcome">
      Click on any location or enter the global postal code below to lookup the weather! 
    </p>
    <form class="zipcode_form" action="maps.html" method="post">
      <p class="country_info">Click <a href="http://www.nationsonline.org/oneworld/country_code_list.htm" target="_blank">HERE</a> 
      for a list of country codes!</p>
      <input type="text" name="zipcode_input" placeholder="Zipcode/Postal Code" class="zipcode_input" required/>
      <input type="text" name="country_input" placeholder="Country Code Ex: US" class="country_input" required/>
      <p class="fields_info">Both fields must be filled</p>
      <button type="button" class="zipcode_submit css_button">Submit</button>
    </form>`);
}

//Changing the colors and borders of the tabs
function changeDateTabsCss(curElement, changedElement) {
  curElement.addClass('gray');
  curElement.addClass('date_border');

  changedElement.removeClass('gray');
  changedElement.removeClass('date_border');
}

//Hide Outer Zipcode class
function hideOuterZipcode(zipCode, weather) {
  if(!zipCode.hasClass('hidden')) {
    zipCode.addClass('hidden');
    weather.removeClass('hidden');
  }
}

//all Event Listeners
function eventListeners(state) {
  const curWeather = state.curWeather;
  const tmrWeather = state.tmrWeather;
  const dayAfter = state.dayAfterTmrWeather;

  //Todays Tab
  $('.date').on('click', '.today_js', (event) => {
    renderWeather(curWeather, $('.weather_info'));
    tabChange(tmrWeather, $('.tmr_js'), curWeather, $('.today_js'));
    tabChange(dayAfter, $('.dayAfterTmr_js'), curWeather, $('.today_js'));    
  });

  //Tmr Tab
  $('.date').on('click', '.tmr_js', (event) => {
    renderWeather(tmrWeather, $('.weather_info'));
    tabChange(curWeather, $('.today_js'), tmrWeather, $('.tmr_js'));
    tabChange(dayAfter, $('.dayAfterTmr_js'), tmrWeather, $('.tmr_js'));
  });

  //dayAfter Tmr Tab
  $('.date').on('click', '.dayAfterTmr_js', (event) => {
    renderWeather(dayAfter, $('.weather_info'));
    tabChange(curWeather, $('.today_js'), dayAfter, $('.dayAfterTmr_js'));
    tabChange(tmrWeather, $('.tmr_js'), dayAfter, $('.dayAfterTmr_js'));
  });

  //ZipCode Button
  $('.outer_zipcode, .zipcode').on('click', '.zipcode_submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const country = $('.country_input').val();
    const zipCode = $('.zipcode_input').val();

    hideOuterZipcode($('.outer_zipcode'), $('.weather'));

    if(checkValidZipCodeCountry(zipCode, country)) {
      fetchWeatherBitApiZip(state, zipCode, country);
      $('.zipcode_input').val('');
      $('.country_input').val('');      
    }
    else {
      renderZipCode($('.zipcode'));
      alert('Enter Valid Country or Valid Zipcode');
    }
  });

  //ZipCode Enter Key Zipcode
  $('.outer_zipcode, .zipcode').on('keypress', '.zipcode_input', (event) => {
    event.stopPropagation();
    
    const key = event.which;
    const country = $('.country_input').val();
    const zipCode = $('.zipcode_input').val();

    if(key === 13){
      event.preventDefault();
      
      if(checkValidZipCodeCountry(zipCode, country)) {
        hideOuterZipcode($('.outer_zipcode'), $('.weather'));

        fetchWeatherBitApiZip(state, zipCode, country);
        $('.zipcode_input').val('');
        $('.country_input').val('');      
      }
      else {
        renderZipCode($('.zipcode'));
        alert('Enter Valid Country or Valid Zipcode');
      }
    }
  });

  //ZipCode Enter Key Country
  $('.outer_zipcode, .zipcode').on('keypress', '.country_input', (event) => {
    event.stopPropagation();
    
    const key = event.which;
    const country = $('.country_input').val();
    const zipCode = $('.zipcode_input').val();

    if(key === 13){
      event.preventDefault();
      
      if(checkValidZipCodeCountry(zipCode, country)) {
        hideOuterZipcode($('.outer_zipcode'), $('.weather'));

        fetchWeatherBitApiZip(state, zipCode, country);
        $('.zipcode_input').val('');
        $('.country_input').val('');      
      }
      else {
        alert('Enter Valid Country or Valid Zipcode');
      }
    }
  });

}

//WeatherBit API
//fetches for the JSON values by Lat and Lng
function fetchWeatherBitApiLatLng(state) {
  const query = {
    key: 'e5763a0d45a14f7385be5287fa59bdc0',
    units: 'I',
    lat: state.markerLocation.lat || state.yourLoc.lat,
    lon: state.markerLocation.lng || state.yourLoc.lng,
  };

  $.getJSON('https://api.weatherbit.io/v2.0/current', query, (response) => {
    hideOuterZipcode($('.outer_zipcode'), $('.weather'));
    renderDates($('.date'));
    renderZipCode($('.zipcode'));
    setCurWeatherValuesToState(state, response.data[0]);
    renderWeather(state.curWeather, $('.weather_info'));
  })
  .fail((response) => {
    if(response.status === 429){
      const str = response.responseText.split(',')[2];
      const mins = str.substring(16, str.length -3);
      alert(`Weatherbit.io limits 75 requests per hour! \nPlease Try Again in ${mins}!!`);
    }
  });

  $.getJSON('https://api.weatherbit.io/v2.0/forecast/3hourly', query, (response) => {
    setForecastWeatherValuesToState(state.tmrWeather, response.data[0]);
    setForecastWeatherValuesToState(state.dayAfterTmrWeather, response.data[8]);
  });
}

//fetches for the JSON values by Zipcode
function fetchWeatherBitApiZip(state, zipCode, country) {
  const query = {
    key: 'e5763a0d45a14f7385be5287fa59bdc0',
    units: 'I',
    postal_code: zipCode,
    country: country
  };

  $.getJSON('https://api.weatherbit.io/v2.0/current', query, (response) => {
    if(response){
      renderDates($('.date'));
      renderZipCode($('.zipcode'));
      clearMarker(state);
      state.zipCodeSearch = true;
      setCurWeatherValuesToState(state, response.data[0]);
      renderWeather(state.curWeather, $('.weather_info'));

      makeMarker(state);
      state.map.setCenter(state.markerLocation);
    }    
    else{
      renderZipCode($('.zipcode'));
      alert('Invalid: Global Postal Code is not in the country that you typed in');
      state.invalidZipcode = true;
    }
  })
  .done(() => {
    if(!state.invalidZipcode){
      $.getJSON('https://api.weatherbit.io/v2.0/forecast/3hourly', query, (response) => {
        setForecastWeatherValuesToState(state.tmrWeather, response.data[0]);
        setForecastWeatherValuesToState(state.dayAfterTmrWeather, response.data[8]);
      });
    }
    state.invalidZipcode = false;
  })
  .fail((response) => {
    if(response.status === 429){
      const str = response.responseText.split(',')[2];
      const mins = str.substring(16, str.length -3);
      alert(`Weatherbit.io limits 75 requests per hour! \nPlease Try Again in ${mins}!!`);
    }
    else{
      alert('Invalid: Global Postal Code in the country you typed in');
    }
  });

}

//Make and clear markers after initial Map Load
function callbackGoogle(response) {
  if (response !== null) { 
    clearMarker(appState);
    setMarkerLatLngGoogle(appState, response);
    makeMarker(appState);
    appState.map.setCenter(appState.markerLocation);
  }
  fetchWeatherBitApiLatLng(appState);
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
  eventListeners(appState);
}

//Get your Coordinates
function getYourCoords(infoWindow, state) {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

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
    handleLocationError(false, infoWindow, state.map);
  }
}

//Handles Geolocation (Your Location) Errors
function handleLocationError(browserHasGeolocation, infoWindow, map) {
  infoWindow.setPosition(map.getCenter());
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service was blocked.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}