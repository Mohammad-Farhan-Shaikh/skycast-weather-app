const header = document.getElementById("main-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    header.classList.add("header-glass", "py-4");
    header.classList.remove("py-6");
  } else {
    header.classList.remove("header-glass", "py-4");
    header.classList.add("py-6");
  }
});

const cityInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const weatherContainer = document.querySelector("#weather-container");
const cityChips = document.querySelectorAll(".flex.gap-4.mt-8 button");
const clearSearches = document.querySelector("#clear-chips");

const currentLocationChip = document.querySelector("#current-location-chips");
currentLocationChip.addEventListener("click", getCurrentLocationWeather);

function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeather(`${lat},${lon}`);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

searchButton.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getWeather();
  }
});

cityChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    getWeather(chip.dataset.city);
  });
});

async function getWeather(cityName = null) {
  weatherContainer.innerHTML = "";

  const actualCityName = typeof cityName === "string" ? cityName : null;
  const city = actualCityName ? actualCityName : cityInput.value.trim();
  const isFromSearchButton = actualCityName === null;

  if (city === "") {
    if (!actualCityName) alert("Please enter a city name");
    return;
  }

  if (isFromSearchButton) {
    searchButton.disabled = true;
    searchButton.textContent = "Loading...";
  }

  try {
    const apiKey = "add-your-api-key-here";
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=yes`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    saveToRecentSearches(data.location.name);

    localStorage.setItem("city", data.location.name);

    const weatherCard = document.createElement("div");
    weatherCard.className = "fade-in w-full max-w-2xl mx-auto";

    weatherCard.innerHTML = `
      <div class="glass-card rounded-2xl p-6 shadow-lg border border-white/20 overflow-hidden relative mb-6">
        <div class="flex justify-between items-center mb-6">
          <div class="text-left">
            <h3 class="text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-tight">${data.location.name}</h3>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">location_on</span>
              ${data.location.region}, ${data.location.country}
            </p>
          </div>
          <div class="text-right">
            <div class="text-4xl md:text-5xl font-black text-primary tracking-tighter">
              ${Math.round(data.current.temp_c)}<span class="text-2xl font-light">°C</span>
            </div>
            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Feels ${Math.round(data.current.feelslike_c)}°C</p>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center gap-2 py-6 bg-white/10 rounded-xl mb-6 backdrop-blur-sm border border-white/5">
          <img src="https:${data.current.condition.icon}" alt="weather icon" class="w-20 h-20 md:w-24 md:h-24 weather-icon-shadow animate-bounce-slow">
          <p class="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200">${data.current.condition.text}</p>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <span class="material-symbols-outlined text-amber-600" style="font-variation-settings: 'FILL' 0">wb_twilight</span>
                <div>
                    <p class="text-[9px] text-amber-600 uppercase font-black">Sunrise</p>
                    <p class="text-xs font-bold dark:text-white">${data.forecast.forecastday[0].astro.sunrise}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <span class="material-symbols-outlined text-indigo-600" style="font-variation-settings: 'FILL' 0">nights_stay</span>
                <div>
                    <p class="text-[9px] text-indigo-600 uppercase font-black">Sunset</p>
                    <p class="text-xs font-bold dark:text-white">${data.forecast.forecastday[0].astro.sunset}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="flex flex-col items-center p-3 rounded-xl bg-white/20 dark:bg-slate-800/40">
            <span class="material-symbols-outlined text-blue-500 mb-1 text-2xl">humidity_mid</span>
            <p class="text-[10px] text-slate-500 uppercase font-bold">Humidity</p>
            <p class="text-base font-bold dark:text-white">${data.current.humidity}%</p>
          </div>
          <div class="flex flex-col items-center p-3 rounded-xl bg-white/20 dark:bg-slate-800/40">
            <span class="material-symbols-outlined text-amber-500 mb-1 text-2xl">air</span>
            <p class="text-[10px] text-slate-500 uppercase font-bold">Wind</p>
            <p class="text-base font-bold dark:text-white">${Math.round(data.current.wind_kph)}km/h</p>
          </div>
          <div class="flex flex-col items-center p-3 rounded-xl bg-white/20 dark:bg-slate-800/40">
            <span class="material-symbols-outlined text-emerald-500 mb-1 text-2xl">visibility</span>
            <p class="text-[10px] text-slate-500 uppercase font-bold">Visibility</p>
            <p class="text-base font-bold dark:text-white">${Math.round(data.current.vis_km)}km</p>
          </div>
          <div class="flex flex-col items-center p-3 rounded-xl bg-white/20 dark:bg-slate-800/40">
            <span class="material-symbols-outlined text-purple-500 mb-1 text-2xl">compress</span>
            <p class="text-[10px] text-slate-500 uppercase font-bold">Pressure</p>
            <p class="text-base font-bold dark:text-white">${data.current.pressure_mb}hPa</p>
          </div>
        </div>
      </div>

      <div class="flex justify-between gap-3 overflow-x-auto pb-4 no-scrollbar">
        ${data.forecast.forecastday
          .map((day) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            return `
            <div class="glass-card flex-shrink-0 w-24 p-4 rounded-xl flex flex-col items-center border border-white/10 shadow-md">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">${dayName}</p>
              <img src="https:${day.day.condition.icon}" class="w-12 h-12 mb-1 weather-icon-shadow" alt="icon">
              <p class="text-lg font-black text-slate-900 dark:text-white mt-1">${Math.round(day.day.avgtemp_c)}°C</p>
            </div>
          `;
          })
          .join("")}
      </div>
    `;

    weatherContainer.appendChild(weatherCard);
    cityInput.value = "";
  } catch (error) {
    console.error("Error Occured :", error.stack);
    weatherContainer.innerHTML = `<div class="glass-card p-4 text-red-500 font-bold">City not found. Try again!</div>`;
  } finally {
    if (isFromSearchButton) {
      searchButton.disabled = false;
      searchButton.textContent = "Search";
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderRecentSearches();
  const savedCity = localStorage.getItem("city");
  if (savedCity) {
    getWeather(savedCity);
  }
});

// recent searches
function saveToRecentSearches(city) {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

  searches = searches.filter(
    (item) => item.toLowerCase() !== city.toLowerCase(),
  );

  searches.unshift(city);

  if (searches.length > 5) searches.pop();

  localStorage.setItem("recentSearches", JSON.stringify(searches));

  renderRecentSearches();
}

function renderRecentSearches() {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  let container = document.querySelector("#city-chips");

  container.innerHTML = searches
    .map(
      (city) => `
      <button class="flex h-10 items-center justify-center gap-2 rounded-full bg-white dark:bg-slate-800 px-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-all fade-in" 
                onclick="getWeather('${city}')">
            <span class="material-symbols-outlined text-sm">history</span>
            <span class="text-sm font-medium">${city}</span>
      </button>
    `,
    )
    .join("");
}

function clearRecentSearches() {
  localStorage.removeItem("recentSearches");
  renderRecentSearches();
}

clearSearches.addEventListener("click", clearRecentSearches);