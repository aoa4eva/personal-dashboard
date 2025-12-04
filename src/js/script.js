// Inspirational quotes
const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" }
];

// Update time and date
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Get greeting based on time of day
function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good morning";
    } else if (hour >= 12 && hour < 18) {
        return "Good afternoon";
    } else if (hour >= 18 && hour < 22) {
        return "Good evening";
    } else {
        return "Good night";
    }
}

// Update greeting display
function updateGreeting() {
    const greeting = document.getElementById('greeting');
    const savedName = localStorage.getItem('userName');

    if (savedName) {
        greeting.textContent = `${getGreeting()}, ${savedName}.`;
    } else {
        greeting.textContent = `${getGreeting()}.`;
    }
}

// Initialize greeting
function initGreeting() {
    updateGreeting();
    // Update greeting every minute in case time period changes
    setInterval(updateGreeting, 60000);
}

// Display random quote
function displayQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quote').textContent = `"${randomQuote.text}"`;
    document.getElementById('quote-author').textContent = `- ${randomQuote.author}`;
}

// Weather widget functions
async function fetchWeather() {
    const apiToken = localStorage.getItem('weatherApiToken');
    const location = localStorage.getItem('weatherLocation');
    const unit = localStorage.getItem('weatherUnit') || 'metric'; // Default to Celsius

    console.log('Weather widget: Checking settings...', { apiToken: apiToken ? 'SET' : 'NOT SET', location, unit });

    const weatherWidget = document.getElementById('weather-widget');
    const weatherContent = weatherWidget.querySelector('.weather-content');
    const weatherError = document.getElementById('weather-error');

    // Hide widget if no API token
    if (!apiToken || apiToken.trim() === '') {
        console.log('Weather widget: No API token, hiding widget');
        weatherWidget.classList.add('hidden');
        return;
    }

    // Hide widget if no location
    if (!location || location.trim() === '') {
        console.log('Weather widget: No location, hiding widget');
        weatherWidget.classList.add('hidden');
        return;
    }

    // Show widget
    console.log('Weather widget: Showing widget and fetching weather...');
    weatherWidget.classList.remove('hidden');

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiToken}&units=${unit}`
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API token. Please check your API key.');
            } else if (response.status === 404) {
                throw new Error('City not found. Please check the city name.');
            } else {
                throw new Error(`Weather API error: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Weather widget: API response received', data);

        // Determine unit symbol
        const unitSymbol = unit === 'imperial' ? '°F' : '°C';

        // Update weather display
        document.getElementById('weather-temp').textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
        document.getElementById('weather-description').textContent = data.weather[0].description;
        document.getElementById('weather-location').textContent = data.name;

        // Set weather icon (using emoji for simplicity)
        const iconCode = data.weather[0].main.toLowerCase();
        const weatherIcon = document.getElementById('weather-icon');
        const iconMap = {
            'clear': '☀️',
            'clouds': '☁️',
            'rain': '🌧️',
            'drizzle': '🌦️',
            'thunderstorm': '⛈️',
            'snow': '❄️',
            'mist': '🌫️',
            'fog': '🌫️',
            'haze': '🌫️'
        };
        weatherIcon.textContent = iconMap[iconCode] || '🌤️';

        // Show content, hide error
        weatherContent.classList.remove('hidden');
        weatherError.classList.add('hidden');
        console.log('Weather widget: Display updated successfully');

    } catch (error) {
        // Show error message
        weatherError.textContent = `⚠️ ${error.message}`;
        weatherError.classList.remove('hidden');
        weatherContent.classList.add('hidden');
        console.error('Weather fetch error:', error);
    }
}

// Initialize weather widget
function initWeather() {
    fetchWeather();
    // Refresh weather every 10 minutes
    setInterval(fetchWeather, 600000);
}

// Initialize settings modal
function initSettings() {
    const settingsModal = document.getElementById('settingsModal');
    const userNameInput = document.getElementById('user-name-input');
    const weatherApiTokenInput = document.getElementById('weather-api-token');
    const weatherLocationInput = document.getElementById('weather-location-input');
    const saveButton = document.getElementById('save-settings');

    // Load current settings when modal opens
    settingsModal.addEventListener('show.bs.modal', () => {
        const savedName = localStorage.getItem('userName');
        const savedApiToken = localStorage.getItem('weatherApiToken');
        const savedLocation = localStorage.getItem('weatherLocation');
        const savedUnit = localStorage.getItem('weatherUnit') || 'metric';

        userNameInput.value = savedName || '';
        weatherApiTokenInput.value = savedApiToken || '';
        weatherLocationInput.value = savedLocation || '';

        // Set temperature unit radio button
        if (savedUnit === 'imperial') {
            document.getElementById('unit-fahrenheit').checked = true;
        } else {
            document.getElementById('unit-celsius').checked = true;
        }
    });

    // Save settings
    saveButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission

        const name = userNameInput.value.trim();
        const apiToken = weatherApiTokenInput.value.trim();
        const location = weatherLocationInput.value.trim();
        const unit = document.querySelector('input[name="temperature-unit"]:checked').value;

        console.log('Save button clicked. Values:', { name, apiToken: apiToken ? 'SET' : 'EMPTY', location, unit });

        // Save or remove user name
        if (name !== '') {
            localStorage.setItem('userName', name);
        } else {
            localStorage.removeItem('userName');
        }
        updateGreeting();

        // Save or remove weather API token
        if (apiToken !== '') {
            localStorage.setItem('weatherApiToken', apiToken);
        } else {
            localStorage.removeItem('weatherApiToken');
        }

        // Save or remove weather location
        if (location !== '') {
            localStorage.setItem('weatherLocation', location);
            console.log('Settings saved: Location set to', location);
        } else {
            localStorage.removeItem('weatherLocation');
            console.log('Settings saved: Location removed');
        }

        // Save temperature unit
        localStorage.setItem('weatherUnit', unit);
        console.log('Settings saved: Temperature unit set to', unit);

        // Refresh weather widget
        console.log('Refreshing weather widget after settings save...');
        fetchWeather();

        // Close modal
        const modal = bootstrap.Modal.getInstance(settingsModal);
        modal.hide();
    });

    // Save on Enter key
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveButton.click();
        }
    };

    userNameInput.addEventListener('keypress', handleEnter);
    weatherApiTokenInput.addEventListener('keypress', handleEnter);
    weatherLocationInput.addEventListener('keypress', handleEnter);
}

// Initialize navbar
function initNavbar() {
    const navbar = document.getElementById('main-navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.getElementById('navbarNav');

    // Handle navbar toggler for mobile
    if (navbarToggler) {
        navbarToggler.addEventListener('click', () => {
            // Toggle the navbar-expanded class when hamburger is clicked
            if (navbarCollapse.classList.contains('show') || navbarCollapse.classList.contains('collapsing')) {
                navbar.classList.remove('navbar-expanded');
            } else {
                navbar.classList.add('navbar-expanded');
            }
        });
    }

    // Listen to Bootstrap collapse events
    if (navbarCollapse) {
        navbarCollapse.addEventListener('shown.bs.collapse', () => {
            navbar.classList.add('navbar-expanded');
        });

        navbarCollapse.addEventListener('hidden.bs.collapse', () => {
            navbar.classList.remove('navbar-expanded');
        });
    }

    // Close navbar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const isClickInsideNavbar = navbar.contains(e.target);
        const isNavbarExpanded = navbarCollapse.classList.contains('show');

        if (!isClickInsideNavbar && isNavbarExpanded && window.innerWidth < 992) {
            navbarToggler.click();
        }
    });
}

// Initialize everything
function init() {
    updateTime();
    setInterval(updateTime, 1000); // Update time every second
    initGreeting();
    displayQuote();
    initSettings();
    initNavbar();
    initWeather();
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
