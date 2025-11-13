// Weather Forecast Application
class WeatherApp {
    constructor() {
        // API configuration - replace with your actual OpenWeatherMap API key
        this.apiKey = 'efec63400067919846d9e8b8513e3b81';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        
        // Temperature unit preference (default to Celsius)
        this.isCelsius = true;
        
        // Load recent cities from localStorage or initialize empty array
        this.recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

        // Initialize DOM elements and event listeners
        this.initializeElements();
        this.bindEvents();
        this.displayRecentCities();
    }

    // Cache all DOM elements for easy access
    initializeElements() {
        // Input elements
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.currentLocationBtn = document.getElementById('currentLocationBtn');
        this.unitToggle = document.getElementById('unitToggle');

        // Section containers
        this.currentWeatherSection = document.getElementById('currentWeather');
        this.forecastSection = document.getElementById('forecastSection');
        this.alertSection = document.getElementById('alertSection');
        this.errorSection = document.getElementById('errorSection');

        // Current weather display elements
        this.cityName = document.getElementById('cityName');
        this.currentDate = document.getElementById('currentDate');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.temperature = document.getElementById('temperature');
        this.windSpeed = document.getElementById('windSpeed');
        this.humidity = document.getElementById('humidity');
        this.feelsLike = document.getElementById('feelsLike');

        // Forecast and history elements
        this.forecastContainer = document.getElementById('forecastContainer');
        this.recentCitiesDropdown = document.getElementById('recentCities');

        // Message display elements
        this.alertMessage = document.getElementById('alertMessage');
        this.errorMessage = document.getElementById('errorMessage');

        // Main app container for background changes
        this.appContainer = document.getElementById('app');
    }

    // Set up all event listeners
    bindEvents() {
        // Search button click handler
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        
        // Current location button click handler
        this.currentLocationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        
        // Temperature unit toggle handler
        this.unitToggle.addEventListener('click', () => this.toggleTemperatureUnit());
        
        // Enter key handler for city input
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });

        // Close recent cities dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.cityInput.contains(e.target) && !this.recentCitiesDropdown.contains(e.target)) {
                this.recentCitiesDropdown.classList.add('hidden');
            }
        });

        // Show recent cities dropdown when input is focused
        this.cityInput.addEventListener('focus', () => {
            if (this.recentCities.length > 0) {
                this.recentCitiesDropdown.classList.remove('hidden');
            }
        });
    }

    // Main weather search function
    async searchWeather() {
        const city = this.cityInput.value.trim();

        // Validate input
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        // Reset UI state and show loading
        this.hideError();
        this.showLoading();

        try {
            // Fetch both current weather and forecast data
            const currentWeather = await this.fetchCurrentWeather(city);
            const forecast = await this.fetchForecast(city);

            // Update UI with fetched data
            this.displayCurrentWeather(currentWeather);
            this.displayForecast(forecast);
            this.updateRecentCities(city);
            this.checkForAlerts(currentWeather);
            this.changeBackground(currentWeather.weather[0].main);

            // Show weather sections
            this.currentWeatherSection.classList.remove('hidden');
            this.forecastSection.classList.remove('hidden');
        } catch (error) {
            // Handle errors gracefully
            this.showError('City not found. Please check the spelling and try again.');
            console.error('Error fetching weather data:', error);
        }

        // Restore UI state
        this.hideLoading();
    }

    // Get weather for user's current location using geolocation API
    async getCurrentLocationWeather() {
        // Check if browser supports geolocation
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.hideError();
        this.showLoading();

        // Request user's current position
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Fetch weather data using coordinates
                    const currentWeather = await this.fetchWeatherByCoords(latitude, longitude);
                    const forecast = await this.fetchForecastByCoords(latitude, longitude);

                    // Update UI with fetched data
                    this.displayCurrentWeather(currentWeather);
                    this.displayForecast(forecast);
                    this.updateRecentCities(currentWeather.name);
                    this.checkForAlerts(currentWeather);
                    this.changeBackground(currentWeather.weather[0].main);

                    // Show weather sections
                    this.currentWeatherSection.classList.remove('hidden');
                    this.forecastSection.classList.remove('hidden');
                } catch (error) {
                    this.showError('Unable to fetch weather data for your location');
                    console.error('Error fetching weather data:', error);
                }

                this.hideLoading();
            },
            (error) => {
                // Handle geolocation errors
                this.showError('Unable to retrieve your location. Please check location permissions.');
                this.hideLoading();
                console.error('Geolocation error:', error);
            }
        );
    }

    // Fetch current weather data for a city
    async fetchCurrentWeather(city) {
        const response = await fetch(
            `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('City not found');
        return await response.json();
    }

    // Fetch 5-day forecast data for a city
    async fetchForecast(city) {
        const response = await fetch(
            `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('Forecast not available');
        return await response.json();
    }

    // Fetch current weather data using coordinates
    async fetchWeatherByCoords(lat, lon) {
        const response = await fetch(
            `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('Weather data not available');
        return await response.json();
    }

    // Fetch 5-day forecast data using coordinates
    async fetchForecastByCoords(lat, lon) {
        const response = await fetch(
            `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) throw new Error('Forecast not available');
        return await response.json();
    }

    // Display current weather data in the UI
    displayCurrentWeather(data) {
        // Update location and date
        this.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.currentDate.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Update weather icon and description
        const weather = data.weather[0];
        this.weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        this.weatherIcon.alt = weather.description;
        this.weatherDescription.textContent = this.capitalizeFirstLetter(weather.description);

        // Update temperature and weather details
        this.updateTemperatureDisplay(data.main.temp, data.main.feels_like);
        this.windSpeed.textContent = `${data.wind.speed} m/s`;
        this.humidity.textContent = `${data.main.humidity}%`;
    }

    // Display 5-day forecast in the UI
    displayForecast(data) {
        this.forecastContainer.innerHTML = '';
        const dailyForecasts = {};

        // Process forecast data to get one reading per day (preferably midday)
        data.list.forEach((item) => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toDateString();

            if (!dailyForecasts[dateString] || date.getHours() === 12) {
                dailyForecasts[dateString] = item;
            }
        });

        // Get next 5 days of forecast (excluding today)
        const forecastDates = Object.keys(dailyForecasts).slice(1, 6);

        // Create forecast cards for each day
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

    // Update temperature display based on current unit preference
    updateTemperatureDisplay(temp, feelsLike) {
        if (this.isCelsius) {
            this.temperature.textContent = `${Math.round(temp)}°C`;
            this.feelsLike.textContent = `Feels like ${Math.round(feelsLike)}°C`;
        } else {
            this.temperature.textContent = `${Math.round((temp * 9 / 5) + 32)}°F`;
            this.feelsLike.textContent = `Feels like ${Math.round((feelsLike * 9 / 5) + 32)}°F`;
        }
    }

    // Toggle between Celsius and Fahrenheit
    toggleTemperatureUnit() {
        this.isCelsius = !this.isCelsius;
        this.unitToggle.textContent = this.isCelsius ? '°C / °F' : '°F / °C';

        // Refresh display if weather data is already loaded
        if (this.currentWeatherSection.classList.contains('hidden')) return;

        const currentCity = this.cityName.textContent.split(',')[0];
        if (currentCity) {
            this.cityInput.value = currentCity;
            this.searchWeather();
        }
    }

    // Update recent cities list and persist to localStorage
    updateRecentCities(city) {
        // Remove duplicate and add to beginning of array
        this.recentCities = this.recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
        this.recentCities.unshift(city);
        
        // Keep only last 5 cities
        if (this.recentCities.length > 5) this.recentCities.pop();

        // Save to localStorage and update UI
        localStorage.setItem('recentCities', JSON.stringify(this.recentCities));
        this.displayRecentCities();
    }

    // Display recent cities in dropdown
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

    // Check for extreme weather conditions and show alerts
    checkForAlerts(weatherData) {
        const temp = weatherData.main.temp;
        this.alertSection.classList.add('hidden');

        // Show appropriate alert based on temperature
        if (temp > 40) {
            this.alertMessage.textContent = 'Extreme heat warning! Stay hydrated.';
            this.alertSection.classList.remove('hidden');
        } else if (temp < 0) {
            this.alertMessage.textContent = 'Freezing temperatures! Dress warmly.';
            this.alertSection.classList.remove('hidden');
        }
    }

    // Change background based on weather condition and time of day
    changeBackground(weatherCondition) {
        // Remove all weather background classes
        this.appContainer.classList.remove('sunny-bg', 'cloudy-bg', 'rainy-bg', 'snowy-bg', 'stormy-bg', 'night-bg');

        const condition = weatherCondition.toLowerCase();
        const hour = new Date().getHours();

        // Determine appropriate background based on condition and time
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

    // Show error message to user
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.classList.remove('hidden');
        this.currentWeatherSection.classList.add('hidden');
        this.forecastSection.classList.add('hidden');
        this.alertSection.classList.add('hidden');
    }

    // Hide error message
    hideError() {
        this.errorSection.classList.add('hidden');
    }

    // Show loading state on buttons
    showLoading() {
        this.searchBtn.disabled = true;
        this.currentLocationBtn.disabled = true;
        this.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Searching...';
    }

    // Hide loading state and restore button text
    hideLoading() {
        this.searchBtn.disabled = false;
        this.currentLocationBtn.disabled = false;
        this.searchBtn.innerHTML = '<i class="fas fa-search mr-2"></i> Search';
    }

    // Utility function to capitalize first letter of string
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Initialize the weather app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});