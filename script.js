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
        // Input and buttons
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.currentLocationBtn = document.getElementById('currentLocationBtn');
        this.unitToggle = document.getElementById('unitToggle');

          
        // Display sections
        this.currentWeatherSection = document.getElementById('currentWeather');
        this.forecastSection = document.getElementById('forecastSection');
        this.alertSection = document.getElementById('alertSection');
        this.errorSection = document.getElementById('errorSection');

         // Current weather elements
        this.cityName = document.getElementById('cityName');
        this.currentDate = document.getElementById('currentDate');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.temperature = document.getElementById('temperature');
        this.windSpeed = document.getElementById('windSpeed');
        this.humidity = document.getElementById('humidity');
        this.feelsLike = document.getElementById('feelsLike');


         // Forecast container
        this.forecastContainer = document.getElementById('forecastContainer');
        
        // Recent cities dropdown
        this.recentCitiesDropdown = document.getElementById('recentCities');
        
        // Alert and error messages
        this.alertMessage = document.getElementById('alertMessage');
        this.errorMessage = document.getElementById('errorMessage');
        
        // App container for background changes
        this.appContainer = document.getElementById('app');

         bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.currentLocationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        this.unitToggle.addEventListener('click', () => this.toggleTemperatureUnit());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.cityInput.contains(e.target) && !this.recentCitiesDropdown.contains(e.target)) {
                this.recentCitiesDropdown.classList.add('hidden');
            }
        });

 }}
}