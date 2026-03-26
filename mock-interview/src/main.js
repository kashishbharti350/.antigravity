import { questions } from './data.js';

// --- Application State ---
const state = {
    currentView: 'home',
    role: null,
    currentQuestionIndex: 0,
    answers: [],
    timerInterval: null,
    timeRemaining: 120, // 2 minutes in seconds
    isShyMode: false,
    pastSessions: [],
    buddyInterval: null,
    isRecording: false,
    finalTranscript: '',
    cameraStream: null
};

// --- DOM Elements ---
const body = document.getElementById('app-body');
const views = {
    home: document.getElementById('view-home'),
    setup: document.getElementById('view-setup'),
    interview: document.getElementById('view-interview'),
    result: document.getElementById('view-result'),
    dashboard: document.getElementById('view-dashboard')
};

// Buttons
const btnStartPractice = document.getElementById('btn-start-practice');
const btnViewDashboard = document.getElementById('btn-view-dashboard');
const navBtnDashboard = document.getElementById('nav-btn-dashboard');
const btnBackHome = document.getElementById('btn-back-home');
const btnDashHome = document.getElementById('btn-dash-home');
const btnResultDashboard = document.getElementById('btn-result-dashboard');
const roleBtns = document.querySelectorAll('.role-btn');
const btnNext = document.getElementById('btn-next');
const btnSubmit = document.getElementById('btn-submit');
const btnQuit = document.getElementById('btn-quit');
const btnRestart = document.getElementById('btn-restart');
const btnClearHistory = document.getElementById('btn-clear-history');
const btnRetryCamera = document.getElementById('btn-retry-camera');

// Setup UI
const toggleShyMode = document.getElementById('toggle-shy-mode');
const shyToggleContainer = document.getElementById('shy-toggle-container');
const aiBuddy = document.getElementById('ai-buddy');
const aiBuddyText = document.getElementById('ai-buddy-text');

// Interview UI Elements
const questionText = document.getElementById('question-text');
const interviewProgress = document.getElementById('interview-progress');
const timerDisplay = document.getElementById('timer-display');
const answerInput = document.getElementById('answer-input');

// Recording UI
const btnRecord = document.getElementById('btn-record');
const recordPing = document.getElementById('record-ping');
const recordDot = document.getElementById('record-dot');
const recordText = document.getElementById('record-text');
const recordStatus = document.getElementById('record-status');

// Camera UI
const cameraFeed = document.getElementById('camera-feed');
const cameraPlaceholder = document.getElementById('camera-placeholder');
const cameraLiveIndicator = document.getElementById('camera-live-indicator');
const cameraStatusText = document.getElementById('camera-status-text');

// Result / Dashboard UI
const overallScoreEl = document.getElementById('overall-score');
const resultsContainer = document.getElementById('results-container');
const dashTotalSessions = document.getElementById('dash-total-sessions');
const dashAvgScore = document.getElementById('dash-avg-score');
const sessionHistoryList = document.getElementById('session-history-list');
const dashEmptyState = document.getElementById('dash-empty-state');

// Body Language UI
const eyeContactScore = document.getElementById('eye-contact-score');
const eyeContactBar = document.getElementById('eye-contact-bar');
const postureScore = document.getElementById('posture-score');
const postureBar = document.getElementById('posture-bar');

// --- AI Buddy Tips ---
const shyTips = [
    "You got this, breathe! 🌟",
    "Great structure! Keep going.",
    "Take your time to think.",
    "You're doing fantastic! 🌻",
    "Don't worry about being perfect.",
    "Speak from your experience.",
    "Remember to smile! 😊"
];

// --- Web Camera API Setup ---
async function startCamera() {
    cameraStatusText.textContent = "Requesting Camera...";
    btnRetryCamera.classList.add('hidden');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraStatusText.textContent = "Camera API not supported in this browser.";
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        state.cameraStream = stream;
        cameraFeed.srcObject = stream;
        cameraPlaceholder.classList.add('hidden');
        cameraFeed.classList.remove('hidden');
        cameraLiveIndicator.classList.remove('hidden');
    } catch (err) {
        console.error("Camera access error:", err);
        cameraStatusText.textContent = "Camera Access Denied. Text-Only Mode.";
        btnRetryCamera.classList.remove('hidden');
    }
}

function stopCamera() {
    if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(track => track.stop());
        state.cameraStream = null;
    }
    cameraFeed.srcObject = null;
    cameraFeed.classList.add('hidden');
    cameraLiveIndicator.classList.add('hidden');
    cameraPlaceholder.classList.remove('hidden');
    cameraStatusText.textContent = "Camera off.";
    btnRetryCamera.classList.add('hidden');
}

btnRetryCamera?.addEventListener('click', startCamera);

// --- Web Speech API Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                state.finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        answerInput.value = state.finalTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
            stopRecording();
        }
    };

    recognition.onend = () => {
        if (state.isRecording) {
            try {
                recognition.start();
            } catch(e) {
                stopRecording();
            }
        }
    };
} else {
    btnRecord.classList.add('hidden');
}

function toggleRecording() {
    if (!recognition) return;
    
    if (state.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    state.isRecording = true;
    state.finalTranscript = answerInput.value ? answerInput.value + ' ' : '';
    
    try {
        recognition.start();
    } catch (e) {
        console.log("Already started");
    }

    recordText.textContent = "Stop Recording";
    recordPing.classList.remove('hidden');
    recordDot.classList.replace('bg-gray-400', 'bg-red-500');
    btnRecord.classList.add('border-red-300', 'bg-red-50', 'text-red-700');
    recordStatus.classList.remove('hidden');
}

function stopRecording() {
    state.isRecording = false;
    try {
        recognition.stop();
    } catch(e) {}

    recordText.textContent = "Start Recording";
    recordPing.classList.add('hidden');
    recordDot.classList.replace('bg-red-500', 'bg-gray-400');
    btnRecord.classList.remove('border-red-300', 'bg-red-50', 'text-red-700');
    recordStatus.classList.add('hidden');
}

// --- LocalStorage & Dashboard Logic ---
function initStorage() {
    try {
        const saved = localStorage.getItem('mockProSessions');
        if (saved) {
            state.pastSessions = JSON.parse(saved);
        }
    } catch (e) {
        state.pastSessions = [];
    }
}

function saveSession(score, role) {
    const session = {
        id: Date.now(),
        date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        role: role === 'hr' ? 'HR & Behavioral' : 'Technical',
        score: score
    };
    state.pastSessions.unshift(session);
    localStorage.setItem('mockProSessions', JSON.stringify(state.pastSessions));
}

function clearHistory() {
    if (confirm("Are you sure you want to clear your interview history?")) {
        state.pastSessions = [];
        localStorage.removeItem('mockProSessions');
        renderDashboard();
    }
}

function renderDashboard() {
    dashTotalSessions.textContent = state.pastSessions.length;
    
    if (state.pastSessions.length === 0) {
        dashAvgScore.textContent = "0%";
        dashEmptyState.style.display = 'block';
        Array.from(sessionHistoryList.children).forEach(child => {
            if (child.id !== 'dash-empty-state') child.remove();
        });
        return;
    }

    dashEmptyState.style.display = 'none';
    const totalScore = state.pastSessions.reduce((sum, s) => sum + s.score, 0);
    const avgScore = Math.round(totalScore / state.pastSessions.length);
    dashAvgScore.textContent = \`\${avgScore}%\`;

    Array.from(sessionHistoryList.children).forEach(child => {
        if (child.id !== 'dash-empty-state') child.remove();
    });

    state.pastSessions.forEach(session => {
        let scoreColor = 'text-green-500';
        if (session.score < 50) scoreColor = 'text-red-500';
        else if (session.score < 80) scoreColor = 'text-yellow-500';

        const item = document.createElement('div');
        item.className = 'w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow var-card-bg var-card-border';
        item.innerHTML = \`
            <div>
                <span class="block font-bold text-gray-900 var-title-text text-lg">\${session.role}</span>
                <span class="text-gray-400 font-normal text-sm var-subtitle-text">\${session.date}</span>
            </div>
            <div class="font-black text-3xl \${scoreColor}">\${session.score}%</div>
        \`;
        sessionHistoryList.appendChild(item);
    });
}


// --- View Switching Logic ---
function switchView(viewName) {
    Object.values(views).forEach(view => {
        if (view) view.classList.add('hidden');
    });
    if (views[viewName]) {
        views[viewName].classList.remove('hidden');
        views[viewName].style.animation = 'none';
        views[viewName].offsetHeight; 
        views[viewName].style.animation = null; 
    }
    state.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'dashboard') {
        renderDashboard();
    }
}

// --- Shy Student Mode Logic ---
function toggleShyModeHandler(e) {
    if (e.target.id !== 'toggle-shy-mode' && e.type === 'click') {
        toggleShyMode.checked = !toggleShyMode.checked;
    }
    
    state.isShyMode = toggleShyMode.checked;
    if (state.isShyMode) {
        body.classList.add('shy-mode');
    } else {
        body.classList.remove('shy-mode');
        hideAiBuddy();
    }
}

function startAiBuddy() {
    if (!state.isShyMode) return;
    
    aiBuddy.classList.remove('hidden');
    setTimeout(() => aiBuddy.classList.remove('opacity-0'), 100);

    clearInterval(state.buddyInterval);
    state.buddyInterval = setInterval(() => {
        const randomTip = shyTips[Math.floor(Math.random() * shyTips.length)];
        aiBuddyText.textContent = randomTip;
        
        aiBuddy.style.transform = 'scale(1.05)';
        setTimeout(() => aiBuddy.style.transform = 'scale(1)', 200);
        
    }, 8000); // Change tip every 8 seconds
}

function hideAiBuddy() {
    clearInterval(state.buddyInterval);
    aiBuddy.classList.add('opacity-0');
    setTimeout(() => aiBuddy.classList.add('hidden'), 300);
}

// --- Timer Logic ---
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
}

function startTimer() {
    clearInterval(state.timerInterval);
    state.timeRemaining = 120;
    timerDisplay.textContent = formatTime(state.timeRemaining);
    timerDisplay.classList.remove('text-red-500', 'animate-pulse');

    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        timerDisplay.textContent = formatTime(state.timeRemaining);

        if (state.timeRemaining === 30) timerDisplay.classList.add('text-red-500');
        if (state.timeRemaining === 10) timerDisplay.classList.add('animate-pulse');

        if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            handleNextOrSubmit();
        }
    }, 1000);
}

// --- Interview Flow Logic ---
function loadQuestion(index) {
    const qList = questions[state.role];
    if (!qList || index >= qList.length) return;

    const currentQ = qList[index];
    questionText.textContent = currentQ.text;
    interviewProgress.textContent = \`Question \${index + 1} of \${qList.length}\`;
    answerInput.value = '';
    state.finalTranscript = '';
    
    if (index === qList.length - 1) {
        btnNext.classList.add('hidden');
        btnSubmit.classList.remove('hidden');
    } else {
        btnNext.classList.remove('hidden');
        btnSubmit.classList.add('hidden');
    }

    startTimer();
    startAiBuddy();
}

function saveCurrentAnswer() {
    state.answers[state.currentQuestionIndex] = answerInput.value.trim();
}

function handleNextOrSubmit() {
    if (state.isRecording) stopRecording();
    saveCurrentAnswer();
    const qList = questions[state.role];
    
    if (state.currentQuestionIndex < qList.length - 1) {
        state.currentQuestionIndex++;
        loadQuestion(state.currentQuestionIndex);
    } else {
        finishInterview();
    }
}

function finishInterview() {
    clearInterval(state.timerInterval);
    hideAiBuddy();
    stopCamera(); // Ensure camera stops safely
    generateResults();
    switchView('result');
}

// --- Scoring & Body Language Simulations ---
function calculateTextScore(userAnswer, idealAnswer) {
    if (!userAnswer || userAnswer.length < 10) return 0;
    
    let score = 50; 
    if (userAnswer.length > 50) score += 10;
    if (userAnswer.length > 150) score += 10;
    
    const idealWords = idealAnswer.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const userWords = userAnswer.toLowerCase().split(/\W+/);
    
    let matchCount = 0;
    idealWords.forEach(word => {
        if (userWords.includes(word)) matchCount++;
    });
    
    const matchRatio = matchCount / idealWords.length;
    score += Math.min(30, Math.floor(matchRatio * 50));
    
    return Math.min(100, score);
}

function simulateBodyLanguagePercentage() {
    // Generate a random convincing percentage between 65 and 98
    return Math.floor(Math.random() * (98 - 65 + 1)) + 65;
}

function generateResults() {
    const qList = questions[state.role];
    resultsContainer.innerHTML = '';
    
    let totalTextScore = 0;

    qList.forEach((q, index) => {
        const userAnswer = state.answers[index] || "No answer provided.";
        const score = userAnswer !== "No answer provided." ? calculateTextScore(userAnswer, q.idealAnswer) : 0;
        totalTextScore += score;
        
        let scoreColor = 'text-green-500';
        let barColor = 'bg-green-500';
        if (score < 50) { scoreColor = 'text-red-500'; barColor = 'bg-red-500'; } 
        else if (score < 80) { scoreColor = 'text-yellow-500'; barColor = 'bg-yellow-500'; }

        const resultHTML = \`
            <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden var-card-bg var-card-border mb-6 fade-in-up" style="animation-delay: \${index * 0.1}s">
                <div class="absolute top-0 left-0 w-1.5 h-full \${barColor}"></div>
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h4 class="text-lg font-bold text-gray-900 w-full md:w-3/4 leading-tight var-title-text"><span class="text-gray-400 mr-2 var-subtitle-text">Q\${index + 1}.</span> \${q.text}</h4>
                    <div class="flex items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 var-card-bg">
                        <span class="text-xs uppercase font-bold text-gray-400 mr-3 tracking-widest var-subtitle-text">Score</span>
                        <span class="text-3xl font-black \${scoreColor} tabular-nums">\${score}%</span>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div class="bg-gray-50 rounded-xl p-5 border border-gray-100/80 var-card-bg">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block var-subtitle-text">Your Answer</span>
                        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed var-title-text \${userAnswer === "No answer provided." ? 'italic text-red-400 var-subtitle-text' : ''}">\${userAnswer}</p>
                    </div>
                    <div class="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                        <span class="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">Ideal Strategy</span>
                        <p class="text-gray-800 leading-relaxed">\${q.idealAnswer}</p>
                    </div>
                </div>
            </div>
        \`;
        resultsContainer.insertAdjacentHTML('beforeend', resultHTML);
    });

    const averageContentScore = Math.round(totalTextScore / qList.length);
    overallScoreEl.textContent = \`\${averageContentScore}%\`;
    
    // Simulate Body Language & Confidence Metrics
    const simulatedEyeContact = simulateBodyLanguagePercentage();
    const simulatedPosture = simulateBodyLanguagePercentage();

    // Reset visually prior to animation
    eyeContactBar.style.width = '0%';
    postureBar.style.width = '0%';
    eyeContactScore.textContent = '--%';
    postureScore.textContent = '--%';

    // Trigger progressive animation
    setTimeout(() => {
        eyeContactBar.style.width = \`\${simulatedEyeContact}%\`;
        eyeContactScore.textContent = \`\${simulatedEyeContact}%\`;
        
        postureBar.style.width = \`\${simulatedPosture}%\`;
        postureScore.textContent = \`\${simulatedPosture}%\`;
    }, 500);

    // Calculate a mathematically weighted global representation for Dashboard tracking
    // 70% content + 15% eye contact + 15% posture
    let globalWeightedScore = Math.round((averageContentScore * 0.7) + (simulatedEyeContact * 0.15) + (simulatedPosture * 0.15));
    
    // Edge case if user provides zero answer
    if (averageContentScore === 0) globalWeightedScore = 0; 
    
    saveSession(globalWeightedScore, state.role);
}


// --- Event Listeners ---
btnStartPractice?.addEventListener('click', () => switchView('setup'));
btnViewDashboard?.addEventListener('click', () => switchView('dashboard'));
navBtnDashboard?.addEventListener('click', () => switchView('dashboard'));
btnBackHome?.addEventListener('click', () => switchView('home'));
btnDashHome?.addEventListener('click', () => switchView('home'));
btnResultDashboard?.addEventListener('click', () => switchView('dashboard'));

toggleShyMode?.addEventListener('change', toggleShyModeHandler);
shyToggleContainer?.addEventListener('click', toggleShyModeHandler);

roleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const roleBtn = e.target.closest('.role-btn');
        if (roleBtn) {
            state.role = roleBtn.dataset.role;
            state.currentQuestionIndex = 0;
            state.answers = [];
            switchView('interview');
            startCamera(); // Initiate the explicit camera prompt
            loadQuestion(0);
        }
    });
});

btnRecord?.addEventListener('click', toggleRecording);
btnNext?.addEventListener('click', handleNextOrSubmit);
btnSubmit?.addEventListener('click', handleNextOrSubmit);

btnQuit?.addEventListener('click', () => {
    if (confirm("Are you sure you want to quit the interview? Your progress will be lost.")) {
        clearInterval(state.timerInterval);
        hideAiBuddy();
        stopCamera();
        if (state.isRecording) stopRecording();
        switchView('home');
    }
});

btnRestart?.addEventListener('click', () => {
    state.currentQuestionIndex = 0;
    state.answers = [];
    state.role = null;
    switchView('setup');
});

btnClearHistory?.addEventListener('click', clearHistory);

// --- Boot ---
initStorage();
switchView('home');
