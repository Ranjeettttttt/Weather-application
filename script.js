// Weather Forecast Application
class WeatherApp {
    constructor() {
        this.apiKey = 'efec63400067919846d9e8b8513e3b81'; // Replace with your actual API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.isCelsius = true;
        this.recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

        this.initializeElements();
        this.bindEvents();
        this.displayRecentCities();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.currentLocationBtn = document.getElementById('currentLocationBtn');
        this.unitToggle = document.getElementById('unitToggle');

        this.currentWeatherSection = document.getElementById('currentWeather');
        this.forecastSection = document.getElementById('forecastSection');
        this.alertSection = document.getElementById('alertSection');
        this.errorSection = document.getElementById('errorSection');

        this.cityName = document.getElementById('cityName');
        this.currentDate = document.getElementById('currentDate');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.temperature = document.getElementById('temperature');
        this.windSpeed = document.getElementById('windSpeed');
        this.humidity = document.getElementById('humidity');
        this.feelsLike = document.getElementById('feelsLike');

        this.forecastContainer = document.getElementById('forecastContainer');
        this.recentCitiesDropdown = document.getElementById('recentCities');

        this.alertMessage = document.getElementById('alertMessage');
        this.errorMessage = document.getElementById('errorMessage');

        this.appContainer = document.getElementById('app');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.currentLocationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        this.unitToggle.addEventListener('click', () => this.toggleTemperatureUnit());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });

        document.addEventListener('click', (e) => {
            if (!this.cityInput.contains(e.target) && !this.recentCitiesDropdown.contains(e.target)) {
                this.recentCitiesDropdown.classList.add('hidden');
            }
        });

        this.cityInput.addEventListener('focus', () => {
            if (this.recentCities.length > 0) {
                this.recentCitiesDropdown.classList.remove('hidden');
            }
        });
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();

        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        this.hideError();
        this.showLoading();

        try {
            const currentWeather = await this.fetchCurrentWeather(city);
            const forecast = await this.fetchForecast(city);

            this.displayCurrentWeather(currentWeather);
            this.displayForecast(forecast);
            this.updateRecentCities(city);
            this.checkForAlerts(currentWeather);
            this.changeBackground(currentWeather.weather[0].main);

            this.currentWeatherSection.classList.remove('hidden');
            this.forecastSection.classList.remove('hidden');
        } catch (error) {
            this.showError('City not found. Please check the spelling and try again.');
            console.error('Error fetching weather data:', error);
        }

        this.hideLoading();
    }

    async getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.hideError();
        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const currentWeather = await this.fetchWeatherByCoords(latitude, longitude);
                    const forecast = await this.fetchForecastByCoords(latitude, longitude);

                    this.displayCurrentWeather(currentWeather);
                    this.displayForecast(forecast);
                    this.updateRecentCities(currentWeather.name);
                    this.checkForAlerts(currentWeather);
                    this.changeBackground(currentWeather.weather[0].main);

                    this.currentWeatherSection.classList.remove('hidden');
                    this.forecastSection.classList.remove('hidden');
                } catch (error) {
                    this.showError('Unable to fetch weather data for your location');
                    console.error('Error fetching weather data:', error);
                }

                this.hideLoading();
            },
            (error) => {
                this.showError('Unable to retrieve your location. Please check location permissions.');
                this.hideLoading();
                console.error('Geolocation error:', error);
            }
        );
    }

    async fetchCurrentWeather(city) {
        const response = await fetch(
            `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('City not found');
        return await response.json();
    }

    async fetchForecast(city) {
        const response = await fetch(
            `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('Forecast not available');
        return await response.json();
    }

    async fetchWeatherByCoords(lat, lon) {
        const response = await fetch(
            `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('Weather data not available');
        return await response.json();
    }

    async fetchForecastByCoords(lat, lon) {
        const response = await fetch(
            `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('Forecast not available');
        return await response.json();
    }

    displayCurrentWeather(data) {
        this.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.currentDate.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const weather = data.weather[0];
        this.weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        this.weatherIcon.alt = weather.description;
        this.weatherDescription.textContent = this.capitalizeFirstLetter(weather.description);

        this.updateTemperatureDisplay(data.main.temp, data.main.feels_like);
        this.windSpeed.textContent = `${data.wind.speed} m/s`;
        this.humidity.textContent = `${data.main.humidity}%`;
    }

    displayForecast(data) {
        this.forecastContainer.innerHTML = '';
        const dailyForecasts = {};

        data.list.forEach((item) => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toDateString();

            if (!dailyForecasts[dateString] || date.getHours() === 12) {
                dailyForecasts[dateString] = item;
            }
        });

        const forecastDates = Object.keys(dailyForecasts).slice(1, 6);

        forecastDates.forEach((dateString) => {
            const forecast = dailyForecasts[dateString];
            const date = new Date(dateString);

            const forecastCard = document.createElement('div');
            forecastCard.className = 'bg-white rounded-lg shadow-md p-4 text-center';

            forecastCard.innerHTML = `
                <p class="font-semibold">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}" class="mx-auto my-2">
                <p class="text-gray-600 text-sm mb-2">${this.capitalizeFirstLetter(forecast.weather[0].description)}</p>
                <div class="flex justify-center space-x-4 text-sm text-gray-700">
                    <div><i class="fas fa-temperature-low mr-1"></i> ${this.isCelsius ? Math.round(forecast.main.temp) + '°C' : Math.round((forecast.main.temp * 9/5) + 32) + '°F'}</div>
                    <div><i class="fas fa-wind mr-1"></i> ${forecast.wind.speed} m/s</div>
                    <div><i class="fas fa-tint mr-1"></i> ${forecast.main.humidity}%</div>
                </div>
            `;

            this.forecastContainer.appendChild(forecastCard);
        });
    }

    updateTemperatureDisplay(temp, feelsLike) {
        if (this.isCelsius) {
            this.temperature.textContent = `${Math.round(temp)}°C`;
            this.feelsLike.textContent = `Feels like ${Math.round(feelsLike)}°C`;
        } else {
            this.temperature.textContent = `${Math.round((temp * 9 / 5) + 32)}°F`;
            this.feelsLike.textContent = `Feels like ${Math.round((feelsLike * 9 / 5) + 32)}°F`;
        }
    }

    toggleTemperatureUnit() {
        this.isCelsius = !this.isCelsius;
        this.unitToggle.textContent = this.isCelsius ? '°C / °F' : '°F / °C';

        if (this.currentWeatherSection.classList.contains('hidden')) return;

        const currentCity = this.cityName.textContent.split(',')[0];
        if (currentCity) {
            this.cityInput.value = currentCity;
            this.searchWeather();
        }
    }

    updateRecentCities(city) {
        this.recentCities = this.recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
        this.recentCities.unshift(city);
        if (this.recentCities.length > 5) this.recentCities.pop();

        localStorage.setItem('recentCities', JSON.stringify(this.recentCities));
        this.displayRecentCities();
    }

    displayRecentCities() {
        if (this.recentCities.length === 0) {
            this.recentCitiesDropdown.classList.add('hidden');
            return;
        }

        this.recentCitiesDropdown.innerHTML = '';
        this.recentCities.forEach((city) => {
            const cityItem = document.createElement('div');
            cityItem.className = 'p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0';
            cityItem.textContent = city;
            cityItem.addEventListener('click', () => {
                this.cityInput.value = city;
                this.searchWeather();
                this.recentCitiesDropdown.classList.add('hidden');
            });
            this.recentCitiesDropdown.appendChild(cityItem);
        });

        this.recentCitiesDropdown.classList.remove('hidden');
    }

    checkForAlerts(weatherData) {
        const temp = weatherData.main.temp;
        this.alertSection.classList.add('hidden');

        if (temp > 40) {
            this.alertMessage.textContent = 'Extreme heat warning! Stay hydrated.';
            this.alertSection.classList.remove('hidden');
        } else if (temp < 0) {
            this.alertMessage.textContent = 'Freezing temperatures! Dress warmly.';
            this.alertSection.classList.remove('hidden');
        }
    }

    changeBackground(weatherCondition) {
        this.appContainer.classList.remove('sunny-bg', 'cloudy-bg', 'rainy-bg', 'snowy-bg', 'stormy-bg', 'night-bg');

        const condition = weatherCondition.toLowerCase();
        const hour = new Date().getHours();

        if (condition.includes('clear')) {
            this.appContainer.classList.add(hour >= 6 && hour < 18 ? 'sunny-bg' : 'night-bg');
        } else if (condition.includes('cloud')) {
            this.appContainer.classList.add('cloudy-bg');
        } else if (condition.includes('rain') || condition.includes('drizzle')) {
            this.appContainer.classList.add('rainy-bg');
        } else if (condition.includes('snow')) {
            this.appContainer.classList.add('snowy-bg');
        } else if (condition.includes('thunderstorm')) {
            this.appContainer.classList.add('stormy-bg');
        } else {
            this.appContainer.classList.add('cloudy-bg');
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.classList.remove('hidden');
        this.currentWeatherSection.classList.add('hidden');
        this.forecastSection.classList.add('hidden');
        this.alertSection.classList.add('hidden');
    }

    hideError() {
        this.errorSection.classList.add('hidden');
    }

    showLoading() {
        this.searchBtn.disabled = true;
        this.currentLocationBtn.disabled = true;
        this.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Searching...';
    }

    hideLoading() {
        this.searchBtn.disabled = false;
        this.currentLocationBtn.disabled = false;
        this.searchBtn.innerHTML = '<i class="fas fa-search mr-2"></i> Search';
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
