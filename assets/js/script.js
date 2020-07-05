// Simple obfuscation scheme to prevent the key from getting scraped.
// Key is split and stored out of order, then rebuilt when needed.
var myKey = [
	"faca",
	"46ea",
	"2d2c",
	"3b88",
	"042b",
	"a521",
	"9344",
	"1008",
];

var uvLevels = [ "uvNone", "uvWarning", "uvDanger" ];

var curCity;
var savedCities = JSON.parse(localStorage.getItem("dashboardCities")) || [];

var cityEl = document.querySelector("#city");
var searchButton = document.querySelector("#searchBtn");
var resultEl = document.querySelector("#result");
var cityListEl = document.querySelector("#cityList");

var searchCity = function(event) {
	var myCity = cityEl.value;

	event.preventDefault();

	if (!myCity) {
		resultEl.innerHTML = "<h3 class='error'>Please enter a valid city name.</h3>";
		return;
	}

	getCityInfo(myCity);
};

var showSavedCity = function(event) {
	var cityId = event.target.getAttribute("data-city-id");

	if ((cityId) && (savedCities[cityId]))
		getCityInfo(savedCities[cityId]);
};

var getCityInfo = function(cityName) {
	var buildKey = "";

	for (var i = 0; i < myKey.length; i++) {
		buildKey += myKey[(5 * i) % myKey.length];
	}

	fetch("https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + buildKey)
		.then(function(response) {
			if (response.ok) {
				response.json().then(function(data) {
					curCity = data.name;

					fetch("http://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&exclude=minutely,hourly&units=imperial&cnt=5&appid=" + buildKey)
					.then(function(response) {
						if (response.ok) {
							response.json().then(showWeatherInfo);
						} else {
							var errorEl = document.createElement("div");
							errorEl.innerHTML = "<h3 class='error'>Forecast Error: " + response.statusText + "</h3>";
							resultEl.appendChild(errorEl);
							return;
						}
					})
					.catch(function(error) {
						var errorEl = document.createElement("div");
						errorEl.innerHTML = "<h3 class='error'>Forecast Error: Unable to connect to OpenWeather API.</h3>";
						resultEl.appendChild(errorEl);
					});
				});
			} else {
				resultEl.innerHTML = "<h3 class='error'>Error: " + response.statusText + "</h3>";
				return;
			}
		})
		.catch(function(error) {
			resultEl.innerHTML = "<h3 class='error'>Error: Unable to connect to OpenWeather API.</h3>";
		});
};

var showWeatherInfo = function(data) {
	resultEl.innerHTML = "";
	showCurrentWeather(data);
	showForecast(data);
	saveCity(curCity);
};

var showCurrentWeather = function(data) {
	var tmpVal;
	var buildEl;
	var containerEl = document.createElement("div");

	// ----- Header - City/Date/Icon -----
	buildEl = document.createElement("h3");
	buildEl.innerHTML = curCity + " (" + moment().format("MM/DD/YYYY") + ") <img src='http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png' />";
	containerEl.appendChild(buildEl);

	// ----- Temperature -----
	buildEl = document.createElement("p");
	buildEl.textContent = "Temperature: " + data.current.temp.toFixed(1) + "°F";
	containerEl.appendChild(buildEl);

	// ----- Humidity -----
	buildEl = document.createElement("p");
	buildEl.textContent = "Humidity: " + data.current.humidity + "%";
	containerEl.appendChild(buildEl);

	// ----- Wind Speed -----
	buildEl = document.createElement("p");
	buildEl.textContent = "Wind Speed: " + data.current.wind_speed + " MPH";
	containerEl.appendChild(buildEl);

	// ----- UV Index -----
	tmpVal = data.current.uvi;
	buildEl = document.createElement("p");
	buildEl.innerHTML = "UV Index: " + "<span class='" + uvLevels[Math.min(tmpVal / 4, 2)] + "'>" + tmpVal + "</span>";
	containerEl.appendChild(buildEl);

	resultEl.appendChild(containerEl);
}

var showForecast = function(data) {
	console.log(data);

	var buildEl
	var containerEl = document.createElement("div");

	// ----- 5-Day Forecast header -----
	buildEl = document.createElement("h3");
	buildEl.textContent = "5-Day Forecast";
	containerEl.appendChild(buildEl);

	// ----- Forecast container -----
	buildEl = document.createElement("div");
	buildEl.className = "forecast";

	for (var i = 1; i < 6; i++) {
		var curBuild;
		var curDiv = document.createElement("div");

		// ----- Date -----
		curBuild = document.createElement("h4");
		curBuild.textContent = moment.unix(data.daily[i].dt).utc().format("MM/DD/YYYY");
		curDiv.appendChild(curBuild);

		// ----- Icon ----
		curBuild = document.createElement("img");
		curBuild.setAttribute("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
		curDiv.appendChild(curBuild);

		// ----- Temperature -----
		curBuild = document.createElement("p");
		curBuild.textContent = "Temperature: " + data.daily[i].temp.max.toFixed(1) + "°F";
		curDiv.appendChild(curBuild);

		// ----- Humidity -----
		curBuild = document.createElement("p");
		curBuild.textContent = "Humidity: " + data.daily[i].humidity + "%";
		curDiv.appendChild(curBuild);

		buildEl.appendChild(curDiv);
	}

	containerEl.appendChild(buildEl);
	resultEl.appendChild(containerEl);
}

var displaySavedCities = function() {
	cityListEl.textContent = "";

	for (var i = 0; i < savedCities.length; i++) {
		var listEl = document.createElement("li");
		listEl.setAttribute("data-city-id", i);
		listEl.textContent = savedCities[i];
		cityListEl.appendChild(listEl);
	}
};

var saveCity = function(cityName) {
	if (savedCities.indexOf(cityName) < 0) {
		savedCities.push(cityName);
		savedCities.sort();

		localStorage.setItem("dashboardCities", JSON.stringify(savedCities));

		displaySavedCities();
	}
};

searchButton.addEventListener("click", searchCity);
cityListEl.addEventListener("click", showSavedCity);

displaySavedCities();