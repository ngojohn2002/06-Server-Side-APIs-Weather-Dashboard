const searchFormEl = document.querySelector("#search-form");
const searchHistoryEl = document.querySelector("#search-history");
const resultContentEl = document.querySelector("#one-day-forcast");
const APIKey = "3a47b3ada81a07cb230d7b854880f60d";

// Retrieve storedResponses from local storage, if null create an empty array
let storedCities = JSON.parse(localStorage.getItem("storedCities")) || [];

function getParams() {
  // Get the search params out of the URL (i.e. `?q=irvine`)
  const searchParams = document.location.search;

  // Get the query value from URL, after the "="
  const query = searchParams.split("=").pop();

  if (query === "") {
    console.log("Enter a city to search.");
    return;
  }

  searchApi(query);
}

function displaySearchedCities() {
  for (let i = storedCities.length - 1; i >= 0; i--) {
    const city = document.createElement("button");
    city.classList.add("btn", "btn-block", "btn-warning");
    city.style.marginBottom = "0.75rem";
    city.textContent = storedCities[i].name;
    searchHistoryEl.append(city);
  }
}

function getTodayDate() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  let yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;

  return today;
}

function createWeatherIconURL() {
  // Obtain iconCode
  let iconCode = storedCities[storedCities.length - 1].weather[0].icon;
  // Construct the URL for the weather icon using the base URL and icon code
  let iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";

  return iconUrl;
}

function displayCityTemperature() {
  const temp = document.createElement("p");
  temp.textContent =
    "Temp: " + storedCities[storedCities.length - 1].main.temp + "°F";
  resultContentEl.append(temp);
}

function displayCityWind() {
  const wind = document.createElement("p");
  wind.textContent =
    "Wind: " + storedCities[storedCities.length - 1].wind.speed + " MPH";
  resultContentEl.append(wind);
}

function displayCityHumidity() {
  const humidity = document.createElement("p");
  humidity.textContent =
    "Humidity: " + storedCities[storedCities.length - 1].main.humidity + "%";
  resultContentEl.append(humidity);
}

function displayFiveDayForecast(apiUrl) {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const fiveDayForecastContainer =
        document.getElementById("five-day-forecast");

      for (let i = 0; i < data.list.length; i += 8) {
        // Each item in the list represents 3-hour intervals, so we pick one per day (every 8th item)
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US"); // Convert UNIX timestamp to milliseconds
        //const day = date.toLocaleDateString("en-US");

        const card = document.createElement("div");
        card.classList.add(
          "my-card",
          "p-3",
          "m-2",
          "col-2_5",
          "bg-primary",
          "text-light"
        );
        card.innerHTML = `
        <h4>${date}</h4>
        <p>Temp: ${forecast.main.temp}°F</p>
        <p>Wind: ${forecast.wind.speed} MPH</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      `;
        fiveDayForecastContainer.appendChild(card);
      }
    })
    .catch((error) => {
      console.log("Error fetching data:", error);
    });
}

function displayWeather(storedCities) {
  // Display list of searched cities in aside section most recent first
  displaySearchedCities();

  // Get today's date
  let today = getTodayDate();

  // Create weather icon's url
  let iconUrl = createWeatherIconURL();

  // Display city's name, today's date and weather icon
  const weatherInfoDiv = document.getElementById("weatherInfo");
  weatherInfoDiv.innerHTML = `
            <h2>${
              storedCities[storedCities.length - 1].name
            } (${today})</h2> <img src="${iconUrl}" alt="Weather Icon">
        `;

  // Display city's temperature
  displayCityTemperature();

  // Display city's wind
  displayCityWind();

  // Display city's humidity
  displayCityHumidity();

  // Display 5-day forecast
  let city = storedCities[storedCities.length - 1].name;
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=imperial`;
  displayFiveDayForecast(apiUrl);
}

function searchApi(city) {
  // Assign query's URL
  let weatherQueryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}&units=imperial`;

  fetch(weatherQueryUrl)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }

      return response.json();
    })
    .then(function (weatherRes) {
      if (!weatherRes) {
        console.log("No results found!");
        resultContentEl.innerHTML = "<h3>No results found, search again!</h3>";
      } else {
        // Store weatherRes to local storage
        storedCities.push(weatherRes);
        localStorage.setItem("storedCities", JSON.stringify(storedCities));

        displayWeather(storedCities);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
}

function handleSearchFormSubmit(event) {
  event.preventDefault();

  // Get search input value from search form
  const searchInputVal = document.querySelector("#search-input").value;

  // If empty input, log error to console
  if (!searchInputVal || searchInputVal === "") {
    console.error("You need a search input value!");
    return;
  }

  // Add searchInputVal as query value to the query url
  const queryString = `./index.html?q=${searchInputVal}`;

  // Assign the queryString to browser's address bar
  location.assign(queryString);

  getParams();
}

searchFormEl.addEventListener("submit", handleSearchFormSubmit);

getParams();
