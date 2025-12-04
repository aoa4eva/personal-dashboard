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

// Drag and Drop functionality
class DraggableWidget {
    constructor(element, defaultPosition = null) {
        this.element = element;
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.defaultPosition = defaultPosition;

        this.setupDraggable();
    }

    setupDraggable() {
        // Load saved position
        const savedPosition = this.loadPosition();
        if (savedPosition) {
            this.element.style.left = savedPosition.x + 'px';
            this.element.style.top = savedPosition.y + 'px';
            this.xOffset = savedPosition.x;
            this.yOffset = savedPosition.y;
        } else if (this.defaultPosition) {
            // Use provided default position
            this.setPosition(this.defaultPosition.x, this.defaultPosition.y);
        } else {
            // Fallback to center
            this.centerWidget();
        }

        // Mouse events
        this.element.addEventListener('mousedown', this.dragStart.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.dragEnd.bind(this));

        // Touch events for mobile
        this.element.addEventListener('touchstart', this.dragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
        document.addEventListener('touchend', this.dragEnd.bind(this));
    }

    setPosition(x, y) {
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.xOffset = x;
        this.yOffset = y;
    }

    centerWidget() {
        const container = document.querySelector('.main-container');
        const containerRect = container.getBoundingClientRect();
        const elementRect = this.element.getBoundingClientRect();

        const centerX = (containerRect.width - elementRect.width) / 2;
        const centerY = (containerRect.height - elementRect.height) / 2;

        this.setPosition(centerX, centerY);
    }

    dragStart(e) {
        const event = e.type === 'touchstart' ? e.touches[0] : e;

        this.initialX = event.clientX - this.xOffset;
        this.initialY = event.clientY - this.yOffset;

        if (e.target === this.element || this.element.contains(e.target)) {
            this.isDragging = true;
            this.element.classList.add('dragging');
            e.preventDefault();
        }
    }

    drag(e) {
        if (this.isDragging) {
            e.preventDefault();

            const event = e.type === 'touchmove' ? e.touches[0] : e;

            this.currentX = event.clientX - this.initialX;
            this.currentY = event.clientY - this.initialY;

            // Keep widget within viewport bounds
            const container = document.querySelector('.main-container');
            const containerRect = container.getBoundingClientRect();
            const elementRect = this.element.getBoundingClientRect();

            this.currentX = Math.max(0, Math.min(this.currentX, containerRect.width - elementRect.width));
            this.currentY = Math.max(0, Math.min(this.currentY, containerRect.height - elementRect.height));

            this.xOffset = this.currentX;
            this.yOffset = this.currentY;

            this.setTranslate(this.currentX, this.currentY);
        }
    }

    dragEnd(e) {
        if (this.isDragging) {
            this.initialX = this.currentX;
            this.initialY = this.currentY;
            this.isDragging = false;
            this.element.classList.remove('dragging');

            // Check for overlaps and adjust position
            this.resolveOverlaps();

            // Save position to localStorage
            this.savePosition();
        }
    }

    setTranslate(xPos, yPos) {
        this.element.style.left = xPos + 'px';
        this.element.style.top = yPos + 'px';
    }

    getRect() {
        return this.element.getBoundingClientRect();
    }

    checkOverlap(otherWidget) {
        const rect1 = this.getRect();
        const rect2 = otherWidget.getRect();

        return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
    }

    resolveOverlaps() {
        const allWidgets = document.querySelectorAll('.draggable');
        const container = document.querySelector('.main-container');
        const containerRect = container.getBoundingClientRect();

        let hasOverlap = true;
        let attempts = 0;
        const maxAttempts = 10;

        while (hasOverlap && attempts < maxAttempts) {
            hasOverlap = false;
            attempts++;

            allWidgets.forEach(otherElement => {
                if (otherElement !== this.element && !otherElement.classList.contains('hidden')) {
                    const rect1 = this.getRect();
                    const rect2 = otherElement.getBoundingClientRect();

                    if (this.checkOverlapRects(rect1, rect2)) {
                        hasOverlap = true;

                        // Calculate center points
                        const center1X = rect1.left + rect1.width / 2;
                        const center1Y = rect1.top + rect1.height / 2;
                        const center2X = rect2.left + rect2.width / 2;
                        const center2Y = rect2.top + rect2.height / 2;

                        // Calculate direction to move
                        const dx = center1X - center2X;
                        const dy = center1Y - center2Y;

                        // Calculate overlap amounts
                        const overlapX = (rect1.width + rect2.width) / 2 - Math.abs(dx);
                        const overlapY = (rect1.height + rect2.height) / 2 - Math.abs(dy);

                        // Move in the direction of least overlap
                        if (overlapX < overlapY) {
                            // Move horizontally
                            const moveX = dx > 0 ? overlapX + 10 : -(overlapX + 10);
                            this.currentX += moveX;
                        } else {
                            // Move vertically
                            const moveY = dy > 0 ? overlapY + 10 : -(overlapY + 10);
                            this.currentY += moveY;
                        }

                        // Keep within bounds
                        const elementRect = this.element.getBoundingClientRect();
                        this.currentX = Math.max(0, Math.min(this.currentX, containerRect.width - elementRect.width));
                        this.currentY = Math.max(0, Math.min(this.currentY, containerRect.height - elementRect.height));

                        this.xOffset = this.currentX;
                        this.yOffset = this.currentY;
                        this.setTranslate(this.currentX, this.currentY);
                    }
                }
            });
        }
    }

    checkOverlapRects(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
    }

    savePosition() {
        const id = this.element.id || this.element.className.split(' ')[0];
        const position = {
            x: this.xOffset,
            y: this.yOffset
        };
        localStorage.setItem(`widget-position-${id}`, JSON.stringify(position));
    }

    loadPosition() {
        const id = this.element.id || this.element.className.split(' ')[0];
        const saved = localStorage.getItem(`widget-position-${id}`);
        return saved ? JSON.parse(saved) : null;
    }
}

// Calculate ideal default positions for widgets
function calculateDefaultPositions() {
    const container = document.querySelector('.main-container');
    const containerRect = container.getBoundingClientRect();

    const timeSection = document.querySelector('.time-section');
    const greetingSection = document.querySelector('.greeting-section');
    const weatherWidget = document.getElementById('weather-widget');
    const quoteSection = document.querySelector('.quote-section');

    const positions = {};

    // Get widget dimensions
    const timeRect = timeSection ? timeSection.getBoundingClientRect() : { width: 0, height: 0 };
    const greetingRect = greetingSection ? greetingSection.getBoundingClientRect() : { width: 0, height: 0 };
    const weatherRect = weatherWidget && !weatherWidget.classList.contains('hidden') ?
        weatherWidget.getBoundingClientRect() : { width: 0, height: 0 };
    const quoteRect = quoteSection ? quoteSection.getBoundingClientRect() : { width: 0, height: 0 };

    // Stack widgets vertically in center, mimicking the original flexbox layout
    const spacing = 20; // Spacing between widgets

    // Calculate total height of main content (greeting, time, weather if visible)
    let mainContentHeight = greetingRect.height + timeRect.height + (2 * spacing);
    if (weatherWidget && !weatherWidget.classList.contains('hidden')) {
        mainContentHeight += weatherRect.height + spacing;
    }

    // Start Y position to center the main content block
    let currentY = (containerRect.height - mainContentHeight - quoteRect.height - 60) / 2;

    // Greeting section - first in vertical stack, horizontally centered
    if (greetingSection) {
        positions.greeting = {
            x: (containerRect.width - greetingRect.width) / 2,
            y: currentY
        };
        currentY += greetingRect.height + spacing;
    }

    // Time section - second, horizontally centered
    if (timeSection) {
        positions.time = {
            x: (containerRect.width - timeRect.width) / 2,
            y: currentY
        };
        currentY += timeRect.height + spacing;
    }

    // Weather widget - third, horizontally centered (keeping with natural flow)
    if (weatherWidget && !weatherWidget.classList.contains('hidden')) {
        positions.weather = {
            x: (containerRect.width - weatherRect.width) / 2,
            y: currentY
        };
    }

    // Quote section - at bottom, horizontally centered
    if (quoteSection) {
        positions.quote = {
            x: (containerRect.width - quoteRect.width) / 2,
            y: containerRect.height - quoteRect.height - 60
        };
    }

    return positions;
}

// Initialize draggable widgets
function initDraggableWidgets() {
    const positions = calculateDefaultPositions();

    const widgets = [
        { element: document.querySelector('.time-section'), key: 'time' },
        { element: document.querySelector('.greeting-section'), key: 'greeting' },
        { element: document.getElementById('weather-widget'), key: 'weather' },
        { element: document.querySelector('.quote-section'), key: 'quote' }
    ];

    widgets.forEach(({ element, key }) => {
        if (element) {
            element.classList.add('draggable');
            new DraggableWidget(element, positions[key]);
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

    // Initialize draggable widgets after a short delay to ensure all elements are rendered
    setTimeout(initDraggableWidgets, 100);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
