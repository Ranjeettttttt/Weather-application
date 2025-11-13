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


 }}