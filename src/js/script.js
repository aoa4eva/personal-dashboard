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

// Alarm functionality
// Global alarm check interval
let alarmCheckInterval = null;
let alarmSoundInterval = null;
let currentAlarmAudio = null;

// Generate default beep sound using Web Audio API (persistent version)
function generateDefaultBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';

    // Create a beep pattern: 0.5s on, 0.3s off, repeat
    const beepDuration = 0.5;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + beepDuration);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + beepDuration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + beepDuration);

    return audioContext;
}

//Play preview sound (sample)
function playPreviewSound(){
    const customSound = localStorage.getItem('alarmSoundData');
    if (!customSound) {
       generateDefaultBeep();
    }
    else {
      currentAlarmAudio = new Audio(customSound);
       currentAlarmAudio.loop = true;
       currentAlarmAudio.play().catch(error => {
    })
    }
}

// Play alarm sound (persistent, repeating)
function playAlarmSound() {
    const customSound = localStorage.getItem('alarmSoundData');
    const alarmEnabled = localStorage.getItem('alarmSystemEnabled') !== 'false';

    if (!alarmEnabled) {
        console.log('Alarm system is disabled');
        return;
    }

    // Stop any existing alarm sound
    stopAlarmSound();

    if (customSound) {
        // Play custom sound on loop
        currentAlarmAudio = new Audio(customSound);
        currentAlarmAudio.loop = true;
        currentAlarmAudio.play().catch(error => {
            console.error('Error playing custom alarm sound:', error);
            // Fallback to default beep
            playDefaultBeepLoop();
        });
    } else {
        // Play default beep on repeat
        playDefaultBeepLoop();
    }
}

// Play default beep in a loop
function playDefaultBeepLoop() {
    // Play first beep immediately
    generateDefaultBeep();

    // Continue playing every 800ms (0.5s beep + 0.3s silence)
    alarmSoundInterval = setInterval(() => {
        generateDefaultBeep();
    }, 800);
}

// Stop alarm sound
function stopAlarmSound() {
    // Stop custom audio if playing
    if (currentAlarmAudio) {
        currentAlarmAudio.pause();
        currentAlarmAudio.currentTime = 0;
        currentAlarmAudio = null;
    }

    // Stop default beep interval
    if (alarmSoundInterval) {
        clearInterval(alarmSoundInterval);
        alarmSoundInterval = null;
    }
}

// Get all alarms from localStorage
function getAlarms() {
    const alarmsData = localStorage.getItem('alarms');
    return alarmsData ? JSON.parse(alarmsData) : [];
}

// Save alarms to localStorage
function saveAlarms(alarms) {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// Add a new alarm
function addAlarm(date, time, label = '') {
    const alarms = getAlarms();
    const newAlarm = {
        id: Date.now(),
        date: date, // Format: "YYYY-MM-DD"
        time: time, // Format: "HH:MM"
        label: label,
        enabled: true,
        triggered: false
    };
    alarms.push(newAlarm);
    saveAlarms(alarms);
    renderAlarms();
    console.log('Alarm added:', newAlarm);
    return newAlarm;
}

// Delete an alarm
function deleteAlarm(id) {
    let alarms = getAlarms();
    alarms = alarms.filter(alarm => alarm.id !== id);
    saveAlarms(alarms);
    renderAlarms();
    console.log('Alarm deleted:', id);
}

// Toggle alarm enabled state
function toggleAlarm(id) {
    const alarms = getAlarms();
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        alarm.enabled = !alarm.enabled;
        saveAlarms(alarms);
        renderAlarms();
        console.log('Alarm toggled:', alarm);
    }
}

// Render all alarms in the widget
function renderAlarms() {
    const alarmsList = document.getElementById('alarms-list');
    const alarms = getAlarms();

    if (alarms.length === 0) {
        alarmsList.innerHTML = '<p class="no-alarms-text">No reminders set</p>';
        return;
    }

    // Sort alarms by date and time
    alarms.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });

    alarmsList.innerHTML = alarms.map(alarm => `
        <div class="alarm-item ${!alarm.enabled ? 'alarm-disabled' : ''}">
            <div class="alarm-info">
                <div class="alarm-date">${formatAlarmDate(alarm.date)}</div>
                <div class="alarm-time">${formatAlarmTime(alarm.time)}</div>
                ${alarm.label ? `<div class="alarm-label">${alarm.label}</div>` : ''}
            </div>
            <div class="alarm-actions">
                <label class="alarm-toggle">
                    <input type="checkbox" ${alarm.enabled ? 'checked' : ''} onchange="toggleAlarm(${alarm.id})">
                    <span class="toggle-slider"></span>
                </label>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAlarm(${alarm.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Format alarm time for display
function formatAlarmTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return `${displayHour}:${minutes} ${ampm}`;
}

// Parse voice command for alarm date and time
function parseVoiceCommand(transcript) {
    console.log('Parsing voice command:', transcript);
    const text = transcript.toLowerCase().trim();

    // Try to parse date and time
    let parsedDate = null;
    let parsedTime = null;
    let meridiem = null;
    let label = '';

    // Extract label/description from "for..." or "to..." patterns
    // Examples: "for meeting with John", "to call mom", "for dentist appointment"
    const labelPatterns = [
        /(?:for|about)\s+(.+?)(?:\s+at\s+\d|\s+on\s+|\s+tomorrow|\s+today|$)/i,
        /(?:to)\s+(.+?)(?:\s+at\s+\d|\s+on\s+|\s+tomorrow|\s+today|$)/i,
        /(?:reminder|alarm)\s+(?:for|to)\s+(.+?)(?:\s+(?:at|on|tomorrow|today))/i
    ];

    for (const pattern of labelPatterns) {
        const labelMatch = text.match(pattern);
        if (labelMatch && labelMatch[1]) {
            label = labelMatch[1].trim();
            // Clean up common artifacts
            label = label.replace(/\s+(at|on|for|to)\s*$/, '');
            break;
        }
    }

    // Extract AM/PM
    const ampmMatch = text.match(/\b(am|pm|a\.m\.|p\.m\.)\b/i);
    if (ampmMatch) {
        meridiem = ampmMatch[1].toLowerCase().replace(/\./g, '');
    }

    // Pattern 1: Specific time with optional minutes "3:30 pm", "3 pm", "3:30"
    const timePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?(?=[\s\.,!?]|$)/i;

//    const timePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\b/i;
    const timeMatch = text.match(timePattern);

    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const timeMeridiem = timeMatch[3] ? timeMatch[3].toLowerCase().replace(/\./g, '') : meridiem;

        // Validate hours and minutes
        if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes < 60) {
            // Convert to 24-hour format
            if (timeMeridiem === 'pm' && hours < 12) {
                hours += 12;
            } else if (timeMeridiem === 'am' && hours === 12) {
                hours = 0;
            } else if (!timeMeridiem && hours >= 1 && hours <= 12) {
                // No AM/PM specified, assume based on context or current time
                const now = new Date();
                const currentHour = now.getHours();
                // If it's past noon, assume PM for times 1-11, otherwise assume next occurrence
                if (currentHour >= 12 && hours < 12) {
                    hours += 12;
                }
            }

            parsedTime = { hours, minutes, meridiem: timeMeridiem };
        }
    }

    // Pattern 2: Relative time "5 minutes from now", "2 hours from now"
    const relativePattern = /(\d+)\s+(minute|minutes|hour|hours)\s+from\s+now/i;
    const relativeMatch = text.match(relativePattern);

    if (relativeMatch) {
        const amount = parseInt(relativeMatch[1]);
        const unit = relativeMatch[2].toLowerCase();

        const targetDate = new Date();
        if (unit.startsWith('minute')) {
            targetDate.setMinutes(targetDate.getMinutes() + amount);
        } else if (unit.startsWith('hour')) {
            targetDate.setHours(targetDate.getHours() + amount);
        }

        const hours = targetDate.getHours();
        const minutes = targetDate.getMinutes();
        const displayMeridiem = hours >= 12 ? 'pm' : 'am';

        return {
            date: targetDate.toISOString().split('T')[0],
            time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
            label: label || `In ${amount} ${unit}`,
            displayTime: formatAlarmTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`),
            displayDate: formatAlarmDate(targetDate.toISOString().split('T')[0])
        };
    }

    // Parse date
    const now = new Date();
    let targetDate = new Date();

    // Check for "today"
    if (text.includes('today')) {
        parsedDate = now;
    }
    // Check for "tomorrow"
    else if (text.includes('tomorrow')) {
        targetDate.setDate(now.getDate() + 1);
        parsedDate = targetDate;
    }
    // Check for day of week (monday, tuesday, etc.)
    else {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayMatch = days.find(day => text.includes(day));
        if (dayMatch) {
            const targetDay = days.indexOf(dayMatch);
            const currentDay = now.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7; // Next week if day has passed
            targetDate.setDate(now.getDate() + daysToAdd);
            parsedDate = targetDate;
        }
    }

    // Check for specific date formats "december 5", "dec 5th", "12/5"
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthPattern = new RegExp(`(${monthNames.join('|')}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\s+(\\d{1,2})(?:st|nd|rd|th)?`, 'i');
    const monthMatch = text.match(monthPattern);

    if (monthMatch) {
        const monthStr = monthMatch[1].toLowerCase();
        const day = parseInt(monthMatch[2]);
        let month = monthNames.findIndex(m => m.startsWith(monthStr));

        targetDate = new Date(now.getFullYear(), month, day);
        if (targetDate < now) {
            targetDate.setFullYear(now.getFullYear() + 1);
        }
        parsedDate = targetDate;
    }

    // If no date specified, default to today
    if (!parsedDate) {
        parsedDate = now;
    }

    // If we have a time, create the alarm
    if (parsedTime) {
        const alarmDate = new Date(parsedDate);
        alarmDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

        // If the alarm time is in the past today, set it for tomorrow
        if (alarmDate < now && parsedDate.toDateString() === now.toDateString()) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }

        const dateStr = alarmDate.toISOString().split('T')[0];
        const timeStr = `${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}`;

        return {
            date: dateStr,
            time: timeStr,
            label: label,
            displayTime: formatAlarmTime(timeStr),
            displayDate: formatAlarmDate(dateStr)
        };
    }

    return null;
}

// Format date for display
function formatAlarmDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
        return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}

// Show voice confirmation modal
let pendingVoiceAlarm = null;

function showVoiceConfirmation(transcript, alarmData) {
    pendingVoiceAlarm = alarmData;

    // Populate modal with data
    document.getElementById('voice-transcript').textContent = transcript;

    const labelEl = document.getElementById('voice-parsed-label');
    if (alarmData.label) {
        labelEl.textContent = alarmData.label;
        labelEl.classList.remove('hidden');
    } else {
        labelEl.textContent = 'No event description';
        labelEl.style.opacity = '0.5';
        labelEl.classList.remove('hidden');
    }

    document.getElementById('voice-parsed-date').textContent = alarmData.displayDate;
    document.getElementById('voice-parsed-time').textContent = alarmData.displayTime;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('voiceConfirmModal'));
    modal.show();
}

// Record voice and transcribe with Web Speech API
function recordAndTranscribeVoice() {
    const voiceBtn = document.getElementById('voice-alarm-btn');
    const voiceStatus = document.getElementById('voice-status');

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceStatus.textContent = 'Speech recognition not supported in this browser. Try Chrome or Edge.';
        voiceStatus.classList.remove('hidden');
        setTimeout(() => voiceStatus.classList.add('hidden'), 4000);
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceStatus.textContent = 'Listening... Speak your alarm command';
    voiceStatus.classList.remove('hidden');
    voiceBtn.classList.add('recording');

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);

        voiceStatus.textContent = 'Processing...';

        // Parse the voice command
        const alarmData = parseVoiceCommand(transcript);

        if (alarmData) {
            // Show confirmation modal
            showVoiceConfirmation(transcript, alarmData);
            voiceStatus.classList.add('hidden');
            voiceBtn.classList.remove('recording');
        } else {
            voiceStatus.textContent = 'Could not understand. Try: "Set a reminder for meeting tomorrow at 3:30 PM"';
            setTimeout(() => {
                voiceStatus.classList.add('hidden');
                voiceBtn.classList.remove('recording');
            }, 4000);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        let errorMessage = 'Error: ';
        switch(event.error) {
            case 'no-speech':
                errorMessage += 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage += 'Microphone not found or not accessible.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone access denied.';
                break;
            case 'network':
                errorMessage += 'Network error. Check your connection.';
                break;
            default:
                errorMessage += event.error;
        }

        voiceStatus.textContent = errorMessage;
        voiceBtn.classList.remove('recording');

        setTimeout(() => voiceStatus.classList.add('hidden'), 4000);
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('recording');
    };

    // Start recognition
    try {
        recognition.start();
    } catch (error) {
        console.error('Failed to start recognition:', error);
        voiceStatus.textContent = 'Failed to start speech recognition';
        voiceBtn.classList.remove('recording');
        setTimeout(() => voiceStatus.classList.add('hidden'), 3000);
    }
}

// Show alarm notification overlay
function showAlarmNotification(alarm) {
    const notification = document.getElementById('alarm-notification');
    const timeEl = document.getElementById('alarm-notification-time');
    const dateEl = document.getElementById('alarm-notification-date');
    const labelEl = document.getElementById('alarm-notification-label');

    timeEl.textContent = formatAlarmTime(alarm.time);
    dateEl.textContent = formatAlarmDate(alarm.date);

    if (alarm.label && alarm.label.trim() !== '') {
        labelEl.textContent = alarm.label;
        labelEl.style.opacity = '1';
    } else {
        labelEl.textContent = 'Reminder';
        labelEl.style.opacity = '0.7';
    }

    notification.classList.remove('hidden');
}

// Hide alarm notification overlay
function dismissAlarmNotification() {
    const notification = document.getElementById('alarm-notification');
    notification.classList.add('hidden');
    stopAlarmSound();
}

// Check alarms every second
function checkAlarms() {
    const alarmEnabled = localStorage.getItem('alarmSystemEnabled') !== 'false';
    if (!alarmEnabled) return;

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const alarms = getAlarms();
    let triggered = false;

    alarms.forEach(alarm => {
        if (alarm.enabled && alarm.date === currentDate && alarm.time === currentTime && !alarm.triggered) {
            console.log('Alarm triggered:', alarm);
            playAlarmSound();
            showAlarmNotification(alarm);
            alarm.triggered = true;
            triggered = true;

            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification('Alarm!', {
                    body: alarm.label || `Alarm for ${formatAlarmDate(alarm.date)} at ${formatAlarmTime(alarm.time)}`,
                    icon: '⏰'
                });
            }
        }

        // Reset triggered flag after the minute passes or if it's a different date
        if (alarm.date !== currentDate || alarm.time !== currentTime) {
            alarm.triggered = false;
        }
    });

    if (triggered) {
        saveAlarms(alarms);
    }

    // Clean up old alarms (past alarms from previous days)
    const filteredAlarms = alarms.filter(alarm => {
        const alarmDateTime = new Date(alarm.date + 'T' + alarm.time);
        return alarmDateTime >= now || alarm.date === currentDate;
    });

    if (filteredAlarms.length !== alarms.length) {
        saveAlarms(filteredAlarms);
        renderAlarms();
    }
}

// Update alarms widget visibility
function updateAlarmsWidgetVisibility() {
    const alarmsWidget = document.getElementById('alarms-widget');
    const showWidget = localStorage.getItem('alarmsWidgetVisible') !== 'false';

    if (showWidget) {
        alarmsWidget.classList.remove('hidden');
    } else {
        alarmsWidget.classList.add('hidden');
    }
}

// Handle alarm sound file upload
function handleAlarmSoundUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = e.target.result;
        const fileName = file.name;

        // Save to localStorage
        localStorage.setItem('alarmSoundData', audioData);
        localStorage.setItem('alarmSoundName', fileName);

        // Update display
        document.getElementById('current-sound-name').textContent = fileName;
        console.log('Custom alarm sound uploaded:', fileName);
    };
    reader.readAsDataURL(file);
}

// Reset alarm sound to default
function resetAlarmSound() {
    localStorage.removeItem('alarmSoundData');
    localStorage.removeItem('alarmSoundName');
    document.getElementById('current-sound-name').textContent = 'Default Beep';
    console.log('Alarm sound reset to default');
}

// Initialize alarms widget
function initAlarms() {
    updateAlarmsWidgetVisibility();
    renderAlarms();

    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Dismiss alarm button
    const dismissAlarmBtn = document.getElementById('dismiss-alarm');
    if (dismissAlarmBtn) {
        dismissAlarmBtn.addEventListener('click', dismissAlarmNotification);
    }

    // Voice alarm button
    const voiceAlarmBtn = document.getElementById('voice-alarm-btn');
    if (voiceAlarmBtn) {
        voiceAlarmBtn.addEventListener('click', recordAndTranscribeVoice);
    }

    // Add alarm button (manual)
    const addAlarmBtn = document.getElementById('add-alarm-btn');
    if (addAlarmBtn) {
        addAlarmBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('addAlarmModal'));
            modal.show();
        });
    }

    // Close widget button
    const closeWidgetBtn = document.getElementById('close-alarms-widget');
    if (closeWidgetBtn) {
        closeWidgetBtn.addEventListener('click', () => {
            localStorage.setItem('alarmsWidgetVisible', 'false');
            updateAlarmsWidgetVisibility();
        });
    }

    // Save alarm from manual modal
    const saveAlarmBtn = document.getElementById('save-alarm');
    if (saveAlarmBtn) {
        saveAlarmBtn.addEventListener('click', () => {
            const dateInput = document.getElementById('alarm-date-input');
            const timeInput = document.getElementById('alarm-time-input');
            const labelInput = document.getElementById('alarm-label-input');

            if (dateInput.value && timeInput.value) {
                addAlarm(dateInput.value, timeInput.value, labelInput.value);

                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('addAlarmModal'));
                modal.hide();
                dateInput.value = '';
                timeInput.value = '';
                labelInput.value = '';
            }
        });
    }

    // Voice confirmation modal handlers
    const voiceConfirmBtn = document.getElementById('voice-confirm-alarm');
    if (voiceConfirmBtn) {
        voiceConfirmBtn.addEventListener('click', () => {
            if (pendingVoiceAlarm) {
                addAlarm(pendingVoiceAlarm.date, pendingVoiceAlarm.time, pendingVoiceAlarm.label);

                // Show success message
                const voiceStatus = document.getElementById('voice-status');
                voiceStatus.textContent = `✓ Alarm set for ${pendingVoiceAlarm.displayDate} at ${pendingVoiceAlarm.displayTime}`;
                voiceStatus.classList.remove('hidden');
                setTimeout(() => voiceStatus.classList.add('hidden'), 3000);

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('voiceConfirmModal'));
                modal.hide();
                pendingVoiceAlarm = null;
            }
        });
    }

    const voiceTryAgainBtn = document.getElementById('voice-try-again');
    if (voiceTryAgainBtn) {
        voiceTryAgainBtn.addEventListener('click', () => {
            pendingVoiceAlarm = null;
            // Automatically start recording again
            setTimeout(() => recordAndTranscribeVoice(), 500);
        });
    }

    // Set default date to today when opening manual alarm modal
    const addAlarmModal = document.getElementById('addAlarmModal');
    if (addAlarmModal) {
        addAlarmModal.addEventListener('show.bs.modal', () => {
            const dateInput = document.getElementById('alarm-date-input');
            if (!dateInput.value) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }
        });
    }

    // Start alarm checking interval
    if (alarmCheckInterval) {
        clearInterval(alarmCheckInterval);
    }
    alarmCheckInterval = setInterval(checkAlarms, 1000);
}

// Initialize settings modal
function initSettings() {
    const settingsModal = document.getElementById('settingsModal');
    const userNameInput = document.getElementById('user-name-input');
    const weatherApiTokenInput = document.getElementById('weather-api-token');
    const weatherLocationInput = document.getElementById('weather-location-input');
    const saveButton = document.getElementById('save-settings');

    // Alarm configuration elements
    const alarmSystemEnabledInput = document.getElementById('alarm-system-enabled');
    const alarmsWidgetVisibleInput = document.getElementById('alarms-widget-visible');
    const alarmSoundUploadInput = document.getElementById('alarm-sound-upload');
    const resetAlarmSoundBtn = document.getElementById('reset-alarm-sound');
    const previewAlarmSoundBtn = document.getElementById('preview-alarm-sound');
    const currentSoundNameDisplay = document.getElementById('current-sound-name');

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

        // Load alarm settings
        const alarmSystemEnabled = localStorage.getItem('alarmSystemEnabled') !== 'false';
        const alarmsWidgetVisible = localStorage.getItem('alarmsWidgetVisible') !== 'false';
        const customSoundName = localStorage.getItem('alarmSoundName');

        alarmSystemEnabledInput.checked = alarmSystemEnabled;
        alarmsWidgetVisibleInput.checked = alarmsWidgetVisible;
        currentSoundNameDisplay.textContent = customSoundName || 'Default Beep';
    });

    // Handle alarm sound upload
    alarmSoundUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleAlarmSoundUpload(file);
        }
    });

    // Handle reset alarm sound
    resetAlarmSoundBtn.addEventListener('click', () => {
        resetAlarmSound();
    });

    // Handle preview alarm sound
    previewAlarmSoundBtn.addEventListener('click', () => {
        playPreviewSound();
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

        // Save alarm settings
        const alarmSystemEnabled = alarmSystemEnabledInput.checked;
        const alarmsWidgetVisible = alarmsWidgetVisibleInput.checked;

        localStorage.setItem('alarmSystemEnabled', alarmSystemEnabled);
        localStorage.setItem('alarmsWidgetVisible', alarmsWidgetVisible);
        console.log('Settings saved: Alarm system enabled:', alarmSystemEnabled);
        console.log('Settings saved: Alarms widget visible:', alarmsWidgetVisible);

        // Update alarms widget visibility
        updateAlarmsWidgetVisibility();

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
        if (!saved) return null;

        const position = JSON.parse(saved);

        // For quote section, always recalculate X to keep it centered
        if (this.element.classList.contains('quote-section')) {
            const container = document.querySelector('.main-container');
            const containerRect = container.getBoundingClientRect();
            const elementRect = this.element.getBoundingClientRect();
            position.x = (containerRect.width - elementRect.width) / 2;
        }

        return position;
    }
}

// Calculate ideal default positions for widgets
function calculateDefaultPositions() {
    const container = document.querySelector('.main-container');
    const containerRect = container.getBoundingClientRect();

    const timeSection = document.querySelector('.time-section');
    const greetingSection = document.querySelector('.greeting-section');
    const weatherWidget = document.getElementById('weather-widget');
    const alarmsWidget = document.getElementById('alarms-widget');
    const quoteSection = document.querySelector('.quote-section');

    const positions = {};

    // Get widget dimensions
    const timeRect = timeSection ? timeSection.getBoundingClientRect() : { width: 0, height: 0 };
    const greetingRect = greetingSection ? greetingSection.getBoundingClientRect() : { width: 0, height: 0 };
    const weatherRect = weatherWidget && !weatherWidget.classList.contains('hidden') ?
        weatherWidget.getBoundingClientRect() : { width: 0, height: 0 };
    const alarmsRect = alarmsWidget && !alarmsWidget.classList.contains('hidden') ?
        alarmsWidget.getBoundingClientRect() : { width: 0, height: 0 };
    const quoteRect = quoteSection ? quoteSection.getBoundingClientRect() : { width: 0, height: 0 };

    // Stack widgets vertically in center, mimicking the original flexbox layout
    const spacing = 20; // Spacing between widgets

    // Calculate total height of main content (greeting, time, weather if visible, alarms if visible)
    let mainContentHeight = greetingRect.height + timeRect.height + (2 * spacing);
    if (weatherWidget && !weatherWidget.classList.contains('hidden')) {
        mainContentHeight += weatherRect.height + spacing;
    }
    if (alarmsWidget && !alarmsWidget.classList.contains('hidden')) {
        mainContentHeight += alarmsRect.height + spacing;
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
        currentY += weatherRect.height + spacing;
    }

    // Alarms widget - fourth, horizontally centered
    if (alarmsWidget && !alarmsWidget.classList.contains('hidden')) {
        positions.alarms = {
            x: (containerRect.width - alarmsRect.width) / 2,
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
        { element: document.getElementById('alarms-widget'), key: 'alarms' },
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
    initAlarms();

    // Initialize draggable widgets after a short delay to ensure all elements are rendered
    setTimeout(initDraggableWidgets, 100);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
