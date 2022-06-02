// selector helpers 
const d=document;
const q=(e,n=d)=>n.querySelector(e);
const qa=(e,n=d)=>n.querySelectorAll(e);

// html elements
const cityFormEl = q("#city-form")
const cityInputEl = q("#cityname");
const cityContainerEl = q("#city-container")
const daysContainerEl = q("#days-container");
const citySearchTerm = q("#city-search-term");
const pastCitiesButtonsEl = q("#past-cities-buttons");
const searchBtn=q("#getCords");

// get current date 
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const date = new Date();
let month = months[date.getMonth()];
let day = date.getDate()
let currentDate = `${month}, ${day}`

var getWeather = function(lat,lon,city) {
    cityInputEl.value = "";
    daysContainerEl.innerHTML = "";
    //format the OpenWeather api url 
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={237b3e186fa93bd19aee42f4745714e5}`

    var currentCity = city
    //make a request to the url 
    fetch(apiUrl)
    .then(function(response) {
         // request was successful 
        if (response.ok) {
            response.json().then(function(data) {
            console.log(data)
            displayWeather(data, currentCity)
        });
    } else {
        alert("Error: location not found!");
    }
})
.catch(function(error) {
    alert("Unable to connect to weather app");
    });
};
var initialize = function(event) {
    event.preventDefault();
    var address = cityInputEl
    var autocomplete = new google.maps.places.Autocomplete(address);
    autocomplete.setTypes(['geocode']);
    google.maps.event.addListener(autocomplete, "place_changed", function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
        return;
    }
    var address = "";
    if (place.address_components) {
        address = [
            (place.address_components[0] && place.address_components[0].short_name || ""),
            (place.address_components[1] && place.address_components[1].short_name || ""),
            (place.address_components[2] && place.address_components[2].short_name || "")
        ].join(" ");
    }
});
}
var codeAddress = function() {
    geocoder = new google.maps.Geocoder();
    var city = cityInputEl.value;
    // check if location button already exists 
    let alreadySearched = false;
    let pastSearches = loadPastSearches()
    if (pastSearches) {
        pastSearches.forEach (c => {
            if (c.cityname === city) {
                alreadySearched = true;
            }
        })
    }
    // if new query 
    if (!alreadySearched) {
        geocoder.geocode({
            'address': city
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat();
                var lon = results[0].geometry.location.lng();
                getWeather(lat,lon,city);
                var cityObj = {
                    cityname: city
                }
                saveSearch(cityObj)
            } else {
                console.log("Geocode was not successful for the following reason: " + status);
            }
        });
    }
}
var displayWeather = function (data, currentCity) {
    // current forecast element 
    cityContainerEl.className = "card"
    citySearchTerm.textContent = `${currentCity}, ${currentDate}`
    q("#current-icon").innerHTML = `<img src='http://openweathermap.org/img/wn/${data.current.weather[0].icon}@4x.png' >`
    q("#current-temp").textContent = `Temp: ${data.current.temp}°F`
    q("#current-wind").textContent = `Wind: ${data.current.wind_speed} MPH`
    q("#current-humidity").textContent = `Humidity: ${data.current.humidity}%`
    let uviEl = q("#current-uvi")
    let uvi = Math.round(data.current.uvi)
    uviEl.textContent = `UVI: ${data.current.uvi}`
    if (uvi <= 2){
        uviEl.style.backgroundColor = "green"
    } else if (uvi >= 3 && uvi <= 5){
        uviEl.style.backgroundColor = "yellow"
    } else if (uvi >= 6 && uvi <= 7) {
        uviEl.style.backgroundColor = "orange"
    } else if (uvi >= 8 && uvi <= 10) {
        uviEl.style.backgroundColor = "red"
    } else if (uvi >= 11) {
        uviEl.style.backgroundColor = "magenta"
    }
    // 5 day forecast subtitle 
    var fiveDaysubtitle = document.createElement("h2")
    fiveDaysubtitle.textContent = "5-Day Forecast"
    fiveDaysubtitle.className = "subtitle"
    fiveDaysubtitle.id = "5-day-forcast"
    daysContainerEl.appendChild(fiveDaysubtitle);
    // day cards wrapper div 
    var dayCardWrapper = document.createElement("div")
    dayCardWrapper.className = "day-card-wrapper"
    daysContainerEl.appendChild(dayCardWrapper);
    // day card loop
    for (var i=1; i<=5; i++) {
        var dayHeader = document.createElement("h3")
        dayHeader.textContent = `${month}, ${day + i}`
        dayHeader.className = "card-header text-uppercase day-card-header"
        dayCardWrapper.appendChild(dayHeader);
        var dayCard = document.createElement("div")
        dayCard.className = "day-card-body"
        dayHeader.appendChild(dayCard)
        // weather icon image 
        var weatherIcon = document.createElement("p")
        weatherIcon.innerHTML = `<img src='http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png' >`
        dayCard.appendChild(weatherIcon)
        // temp
        var dayTemp = document.createElement("p")
        dayTemp.textContent = `Temp: ${data.daily[i].temp.day}°F`
        dayCard.appendChild(dayTemp)
        // wind 
        var dayWind = document.createElement("p")
        dayWind.textContent = `Wind: ${data.daily[i].wind_speed} MPH` 
        dayCard.appendChild(dayWind)
        // humidity 
        var dayHumidity = document.createElement("p")
        dayHumidity.textContent = `Humidity: ${data.daily[i].humidity}%`
        dayCard.appendChild(dayHumidity)
    }
}
function saveSearch(cityObj) {
    var pastSearchBtn = document.createElement("button")
    pastSearchBtn.className = "btn past-search-btn"
    pastSearchBtn.textContent = cityObj.cityname
    pastCitiesButtonsEl.appendChild(pastSearchBtn);
    pastSearchBtn.addEventListener ("click", function() {
        geocoder = new google.maps.Geocoder();
        var city = cityObj.cityname
        geocoder.geocode({
            'address': city
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat();
                var lon = results[0].geometry.location.lng();
                getWeather(lat,lon,city);
            } else {
                console.log("Geocode was not successful for the following reason: " + status);
            }
        })
    });
    var pastSearches = loadPastSearches()
    pastSearches.push(cityObj);
    localStorage.setItem("cityObjects", JSON.stringify(pastSearches))
}
function loadPastSearches() {
    var pastSearchArr = JSON.parse(localStorage.getItem("cityObjects"));
    if (!pastSearchArr || !Array.isArray(pastSearchArr)) return []
    else return pastSearchArr
}
var loadPastBtns = function() {
    var pastSearches = loadPastSearches()
    for (var city of pastSearches) {
            var pastSearchBtn = document.createElement("button")
            pastSearchBtn.className = "btn past-search-btn"
            pastSearchBtn.value = city.cityname
            pastSearchBtn.textContent = city.cityname
            pastCitiesButtonsEl.appendChild(pastSearchBtn);
            pastSearchBtn.addEventListener ("click", function() {
                geocoder = new google.maps.Geocoder();
                pastCity = this.value
                geocoder.geocode({
                    'address': pastCity
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var lat = results[0].geometry.location.lat();
                        var lon = results[0].geometry.location.lng();
                        console.log(pastCity)
                        getWeather(lat,lon,pastCity);
                    } else {
                        console.log("Geocode was not successful for the following reason: " + status);
                    }
                })
            });
    }
}
// event listeners 
google.maps.event.addDomListener(window, "load", initialize);
searchBtn.addEventListener("click", codeAddress)
q("#clear-btn").addEventListener("click", function() {
    [ ... qa(".past-search-btn") ].map( 
        thisButton => thisButton.remove());
    localStorage.clear();
    window.location.reload();
})
loadPastBtns();