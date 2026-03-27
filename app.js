let currentLang = 'en';

const langElements = document.querySelectorAll('.lang');
const langToggle = document.getElementById('lang-toggle');

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    document.getElementById('chat-lang-indicator').innerText = currentLang === 'en' ? 'EN' : 'TA';
    updateLanguage();
});

function updateLanguage() {
    langElements.forEach(el => {
        el.innerText = el.getAttribute(`data-${currentLang}`);
    });
}

const navLinks = document.querySelectorAll('.nav-links li');
const pages = document.querySelectorAll('.page-section');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(nav => nav.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        link.classList.add('active');
        const target = link.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
    });
});

async function fetchWeather() {
    try {
        const res = await fetch('/api/weather');
        const data = await res.json();
        document.getElementById('weather-temp').innerText = `${data.temp}°C`;
        document.getElementById('weather-desc').innerText = data.description;
        
        const alertsList = document.getElementById('weather-alerts-list');
        alertsList.innerHTML = '';
        data.alerts.forEach(alert => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-info-circle"></i> ${alert}`;
            alertsList.appendChild(li);
        });
    } catch (e) {
        console.error("Weather fetch failed", e);
    }
}

document.getElementById('crop-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        soil_ph: parseFloat(document.getElementById('soil_ph').value),
        temperature: parseFloat(document.getElementById('temp').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        rainfall: parseFloat(document.getElementById('rainfall').value),
        soil_type: document.getElementById('soil_type').value
    };

    const res = await fetch('/api/crop-recommend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    const resultBox = document.getElementById('crop-result');
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
        <h3>Recommended Crop: ${data.crop}</h3>
        <p><strong>Confidence:</strong> ${data.confidence}%</p>
        <p><strong>Reasoning:</strong> ${data.explanation}</p>
    `;
});

document.getElementById('fert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        crop: document.getElementById('fert-crop').value,
        soil_ph: parseFloat(document.getElementById('fert-ph').value)
    };

    const res = await fetch('/api/fertilizer-recommend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    const resultBox = document.getElementById('fert-result');
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
        <h3>Use: ${data.fertilizer}</h3>
        <p><strong>Amount:</strong> ${data.amount}</p>
        <p><strong>Advice:</strong> ${data.advice}</p>
    `;
});

document.getElementById('leaf-img').addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        const file = e.target.files[0];
        const preview = document.getElementById('preview-container');
        preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:10px;">`;
    }
});

document.getElementById('disease-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('leaf-img');
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const res = await fetch('/api/disease-detect', {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    
    const resultBox = document.getElementById('disease-result');
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
        <h3>Detected: ${data.disease}</h3>
        <p><strong>Confidence:</strong> ${data.confidence}%</p>
        <p><strong>Treatment:</strong> ${data.treatment}</p>
    `;
});

const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

let recognizing = false;
let recognition = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error", event.error);
        micBtn.classList.remove('recording');
        recognizing = false;
    };

    recognition.onend = function() {
        micBtn.classList.remove('recording');
        recognizing = false;
    };
}

micBtn.addEventListener('click', () => {
    if(!recognition) {
        alert("Speech recognition not supported in this browser.");
        return;
    }
    if (recognizing) {
        recognition.stop();
        return;
    }
    recognition.lang = currentLang === 'en' ? 'en-US' : 'ta-IN';
    recognition.start();
    recognizing = true;
    micBtn.classList.add('recording');
});

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendMessage();
});

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('msg', sender);
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'en' ? 'en-US' : 'ta-IN';
    window.speechSynthesis.speak(utterance);
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if(!text) return;
    
    appendMessage(text, 'user');
    chatInput.value = '';

    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: text, language: currentLang === 'ta' ? 'tamil' : 'english' })
    });
    const data = await res.json();
    
    appendMessage(data.reply, 'bot');
    speakText(data.reply);
}

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

async function loadTasks() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    taskList.innerHTML = '';
    
    let pending = 0;
    let completed = 0;

    tasks.forEach(task => {
        if(task.completed) completed++;
        else pending++;

        const li = document.createElement('li');
        if(task.completed) li.classList.add('completed');
        li.innerHTML = `
            <span class="task-title">${task.title}</span>
            <div class="task-actions">
                <button class="btn-complete" onclick="toggleTask(${task.id})"><i class="fas fa-check-circle"></i></button>
                <button class="btn-delete" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });

    document.getElementById('pending-count').innerText = pending;
    document.getElementById('completed-count').innerText = completed;
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const crop_name = taskInput.value.trim();
    if(!crop_name) return;

    const btn = taskForm.querySelector('button');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Generating...';

    await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({crop_name})
    });
    
    taskInput.value = '';
    btn.disabled = false;
    btn.innerText = originalText;
    loadTasks();
});

async function toggleTask(id) {
    await fetch(`/api/tasks/${id}`, { method: 'PUT' });
    loadTasks();
}

async function deleteTask(id) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// --- Auth Logic ---
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const authError = document.getElementById('auth-error');

document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
    authError.style.display = 'none';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! Please login.');
            document.getElementById('show-login').click();
        } else {
            alert(data.detail || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            authContainer.style.display = 'none';
            mainApp.style.display = 'flex';
            fetchWeather();
            loadTasks();
        } else {
            authError.innerText = data.detail || 'Login failed';
            authError.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
    }
});

// Logout feature (Optional but good to have, we can bind it to a new button later, for now just expose it)
window.logout = function() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('loggedIn') === 'true') {
        authContainer.style.display = 'none';
        mainApp.style.display = 'flex';
        fetchWeather();
        loadTasks();
    } else {
        authContainer.style.display = 'flex';
        mainApp.style.display = 'none';
    }
});
