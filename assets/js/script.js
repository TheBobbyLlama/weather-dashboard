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

	var buildKey = "";

	for (var i = 0; i < myKey.length; i++) {
		buildKey += myKey[(5 * i) % myKey.length];
	}

	fetch("https://api.openweathermap.org/data/2.5/weather?q=" + myCity + "&appid=" + buildKey)
		.then(function(response) {
			if (response.ok) {
				response.json().then(function(data) {
					resultEl.innerHTML = "";
					myCity = showCurrentWeather(data);
					showForecast(myCity);
				});
			} else {
				resultEl.innerHTML = "<h3 class='error'>Error: " + response.statusText + "</h3>";
				return;
			}
		})
		.catch(function(error) {
			// Notice this `.catch()` getting chained onto the end of the `.then()` method
			alert("Unable to connect to GitHub");
		});
}

var showCurrentWeather = function(data) {
	var cityName = data.name;

	console.log(data);

	var tmpVal
	var tmpClass
	var buildEl
	var containerEl = document.createElement("div");

	// ----- Header - City/Date/Icon -----
	buildEl = document.createElement("h3");
	buildEl.textContent = cityName + " (" + moment().format("MM/DD/YYYY") + ")";
	// TODO- Icon!
	containerEl.appendChild(buildEl);

	// ----- Temperature -----
	buildEl = document.createElement("p");
	buildEl.textContent = "Temperature: " + convertTempKtoF(data.main.temp)
	containerEl.appendChild(buildEl);

	// ----- Humidity -----
	buildEl = document.createElement("p");
	buildEl.textContent = "Humidity: " + data.main.humidity + "%";
	containerEl.appendChild(buildEl);

	// ----- Wind Speed -----
	buildEl = document.createElement("p");
	buildEl.textContent = "Wind Speed: " + data.wind.speed + " MPH";
	containerEl.appendChild(buildEl);

	// ----- UV Index -----
	tmpVal = "TODO!"
	buildEl = document.createElement("p");
	buildEl.textContent = "UV Index: " + tmpVal;
	containerEl.appendChild(buildEl);

	resultEl.appendChild(containerEl);

	return cityName;
}

var showForecast = function(cityName) {
	console.log("Show that forecast!");
}

var displaySavedCities = function() {
	console.log("Displaying saved cities!")
};

var saveCity = function(cityName) {
	if (savedCities.indexOf(cityName) < 0) {
		savedCities.push(cityName);
		savedCities.sort();

		localStorage.setItem("dashboardCities", JSON.stringify(savedCities));

		displaySavedCities();
	}
};

var convertTempKtoF = function(temp) {
	return (1.8 * temp - 459.67).toFixed(1) + "°F";
}

searchButton.addEventListener("click", searchCity);

displaySavedCities();