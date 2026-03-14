// ==================== DATA ====================

const NEGATIVE_FACTS = [
    "Vaping delivers nicotine, which is highly addictive and can harm the developing brain, affecting memory, concentration, and learning.",
    "E-cigarette aerosol contains harmful substances including heavy metals like lead, volatile organic compounds, and ultrafine particles that penetrate deep into the lungs.",
    "Vaping has been linked to serious lung injuries. In 2019, over 2,800 people were hospitalised with vaping-related lung disease.",
    "Nicotine from vaping raises blood pressure and spikes adrenaline, increasing heart rate and the likelihood of having a heart attack.",
    "Many vape liquids contain diacetyl, a chemical linked to 'popcorn lung' — a serious and irreversible lung disease.",
    "Vaping can weaken your immune system, making you more susceptible to infections and illnesses.",
    "Studies show that young people who vape are 3-4 times more likely to start smoking traditional cigarettes.",
    "Vaping causes chronic inflammation in the lungs, similar to the damage seen in early-stage emphysema.",
    "Nicotine constricts blood vessels, reducing blood flow to your skin, teeth, and gums — leading to premature ageing.",
    "The flavourings in vapes can produce toxic chemicals when heated, including formaldehyde and acrolein, which damage lung cells.",
    "Vaping has been shown to negatively affect dental health, causing gum disease, dry mouth, and tooth decay.",
    "Nicotine addiction from vaping can cause anxiety, irritability, and difficulty concentrating when you can't vape.",
    "E-cigarettes can explode or cause burns. There have been hundreds of reported incidents of battery explosions.",
    "Vaping during adolescence can permanently alter brain circuits that control attention and learning.",
    "Second-hand vapour isn't harmless — it contains nicotine, heavy metals, and other toxins that bystanders inhale.",
    "Chronic vaping has been associated with increased risk of chronic bronchitis symptoms like persistent cough and phlegm.",
    "Nicotine from vaping can disrupt sleep patterns, leading to insomnia and poor sleep quality.",
    "Vaping suppresses the ability of lung cells to fight off infections, making respiratory illness more severe.",
    "The cost of vaping adds up: a daily vaper can spend over $1,500 per year on pods and devices.",
    "Research suggests that vaping may damage DNA, potentially increasing the risk of cancer over time.",
    "Vaping can reduce your sense of taste and smell over time due to chemical exposure.",
    "Nicotine from vapes can increase cortisol levels, raising stress rather than relieving it despite what it feels like.",
    "Propylene glycol in vape liquid can irritate the airways and trigger asthma-like symptoms.",
    "Vaping creates a cycle of dependency — the 'relief' you feel is just satisfying the withdrawal your addiction created.",
    "Many vape products contain undisclosed chemicals. Testing has found pesticides, plasticisers, and unknown additives.",
    "Vaping affects athletic performance by reducing lung capacity and oxygen delivery to muscles.",
    "Nicotine exposure from vaping can worsen symptoms of depression and anxiety over time.",
    "The aerosol from vaping leaves a residue on surfaces that contains nicotine and other toxic compounds.",
    "Vaping can cause a condition called 'vaper's tongue' where you lose your ability to taste flavours.",
    "Studies show vaping may impair blood vessel function as much as traditional cigarette smoking."
];

const POSITIVE_FACTS = [
    "Within 20 minutes of your last vape, your heart rate and blood pressure begin to drop back to normal levels.",
    "After 24 hours without vaping, your body starts clearing carbon monoxide, allowing your blood to carry more oxygen.",
    "Within 48 hours of quitting, your sense of taste and smell begin to improve noticeably.",
    "After just 2 weeks vape-free, your lung function begins to improve and breathing becomes easier.",
    "After 1 month without vaping, your coughing and shortness of breath decrease significantly.",
    "Quitting vaping improves blood circulation within weeks, giving you more energy and warmer hands and feet.",
    "Your immune system starts recovering within days, making you less susceptible to colds and infections.",
    "After quitting, your brain's nicotine receptors begin to normalise, reducing cravings over time.",
    "Quitting vaping reduces inflammation throughout your body, lowering your risk of chronic disease.",
    "People who quit vaping report better sleep quality within the first week.",
    "After 3 months vape-free, your lung capacity can improve by up to 30%.",
    "Quitting vaping can save you over $1,500 a year — money you can spend on things that truly matter.",
    "Your skin begins to look healthier within weeks of quitting as blood flow improves.",
    "After quitting, anxiety levels typically decrease after the initial withdrawal period passes.",
    "Your teeth and gums start recovering from nicotine damage within weeks of quitting.",
    "Quitting vaping improves your concentration and mental clarity as your brain heals from nicotine dependency.",
    "Within 1-3 months of quitting, your risk of heart attack begins to decrease.",
    "People who quit vaping report higher self-esteem and a greater sense of personal accomplishment.",
    "After 6 months vape-free, your lungs have significantly recovered their ability to fight infection.",
    "Quitting vaping breaks the cycle of addiction, giving you true freedom and control over your life.",
    "Your exercise performance improves noticeably within weeks of quitting vaping.",
    "After quitting, you'll no longer expose loved ones to second-hand aerosol and its harmful chemicals.",
    "Quitting vaping reduces your risk of stroke — your body begins repairing blood vessels almost immediately.",
    "Your body's stress response normalises after quitting — you'll handle stress better without nicotine.",
    "After 1 year vape-free, your excess risk of heart disease drops significantly.",
    "Quitting vaping improves fertility and reproductive health for both men and women.",
    "You'll have fresher breath and a cleaner mouth within days of quitting.",
    "After quitting, your vocal cords recover, and your voice may become clearer and stronger.",
    "People who quit vaping often discover they have more time and mental space for things they love.",
    "Every day without vaping, your body is healing. The benefits compound over time — it only gets better."
];

const ALLAH_REMINDERS = [
    "\"Verily, with hardship comes ease.\" (Quran 94:6) — This struggle is temporary, but the strength you build is permanent.",
    "Your body is an amanah (trust) from Allah. Protecting it from harm is an act of worship.",
    "\"And whoever puts their trust in Allah, He will be enough for them.\" (Quran 65:3) — Lean on Him in this moment.",
    "Prophet Muhammad (PBUH) said: \"There should be no harm and no reciprocal harm.\" Quitting protects the body Allah gave you.",
    "Every time you resist a craving, you are choosing obedience to Allah over obedience to your nafs (desires).",
    "\"Allah does not burden a soul beyond that it can bear.\" (Quran 2:286) — You can handle this.",
    "Remember: true strength isn't in giving in to desires, but in controlling them for the sake of Allah.",
    "\"Is not Allah sufficient for His servant?\" (Quran 39:36) — Ask Him for help right now, He is listening.",
    "Making du'a during struggle is one of the most beloved acts to Allah. Turn this difficulty into worship.",
    "\"And when My servants ask you about Me, indeed I am near.\" (Quran 2:186) — He is closer than you think.",
    "Patience (sabr) is a pillar of faith. Every moment you endure builds your spiritual strength.",
    "The Prophet (PBUH) said: \"Whoever gives up something for the sake of Allah, Allah will replace it with something better.\"",
    "This craving is a test, and every test from Allah is an opportunity to grow closer to Him.",
    "Remember your wudu and salah — a clean body and mind make your worship more meaningful.",
    "\"He who fears Allah, Allah will find a way out for him.\" (Quran 65:2) — Trust the process."
];

const REINFORCEMENTS = [
    "You've already proven you're strong enough. Every second without vaping is a victory.",
    "This craving will pass in 3-5 minutes. You are stronger than a temporary urge.",
    "Think about why you started this journey. That reason hasn't changed.",
    "Your lungs are healing right now. Don't undo the progress your body has made.",
    "Future you will be so grateful you held on in this moment.",
    "You're not giving something up — you're gaining your freedom back.",
    "Thousands of people have beaten this exact feeling. You're not alone in this.",
    "The discomfort you feel right now IS your body healing. Embrace it.",
    "One vape won't satisfy you — it'll just restart the cycle of craving. Break free.",
    "Remember who you said you wanted to become. That person doesn't vape.",
    "You've made it this far. That takes incredible strength. Keep going.",
    "This urge is your addiction's last attempt to pull you back. Don't let it win.",
    "Close your eyes. Take a deep breath. You don't need it. You never did.",
    "Every craving you beat makes the next one weaker. You're winning.",
    "Your body is literally detoxing right now. This discomfort is progress.",
    "Think of someone who looks up to you. Show them what strength looks like.",
    "The version of you that's free from vaping is worth every hard moment.",
    "Nicotine tricked your brain into thinking you need it. You don't.",
    "You are rewriting your story right now. Make it one you're proud of.",
    "Hold on. Just 5 more minutes. Then 5 more. You can do this."
];

const TIMELINE_DATA = [
    {
        time: "First 24 Hours",
        title: "The Beginning",
        desc: "Withdrawal symptoms start. You may feel irritable, anxious, and have strong cravings. This is your body recognising the absence of nicotine. It's uncomfortable but it's the first step.",
        difficulty: "hard",
        difficultyLabel: "Tough Start",
        dayThreshold: 0
    },
    {
        time: "Days 2-3",
        title: "Peak Withdrawal",
        desc: "This is often the hardest point. Cravings are at their most intense, you might get headaches or feel foggy. Your body is flushing out nicotine. Push through — this is the summit.",
        difficulty: "hard",
        difficultyLabel: "Hardest Point",
        dayThreshold: 2
    },
    {
        time: "Days 4-7",
        title: "The Worst Is Behind You",
        desc: "Physical withdrawal symptoms start to ease. Cravings become less frequent. You may still feel emotional or restless, but your body is adjusting. You're over the hump.",
        difficulty: "medium",
        difficultyLabel: "Getting Easier",
        dayThreshold: 4
    },
    {
        time: "Week 2",
        title: "Building Momentum",
        desc: "You start feeling more normal. Sleep improves, breathing gets easier, and energy levels rise. Cravings still come but they're shorter and less intense. Your confidence grows.",
        difficulty: "medium",
        difficultyLabel: "Improving",
        dayThreshold: 8
    },
    {
        time: "Weeks 3-4",
        title: "Watch for Triggers",
        desc: "Physical symptoms are mostly gone, but psychological triggers can surprise you — stress, social situations, boredom. This is where many people slip. Stay vigilant and use your coping tools.",
        difficulty: "medium",
        difficultyLabel: "Stay Alert",
        dayThreshold: 15
    },
    {
        time: "Month 2",
        title: "New Normal Forming",
        desc: "Your brain is rewiring itself. The automatic reach for a vape fades. You have more energy, better taste and smell, and improved lung function. The habit loop is weakening.",
        difficulty: "easy",
        difficultyLabel: "Feels Easier",
        dayThreshold: 30
    },
    {
        time: "Month 3",
        title: "Strength & Clarity",
        desc: "Lung capacity may improve by up to 30%. Cravings are rare and manageable. You're sleeping better, thinking clearer, and feeling genuinely proud. This is what freedom feels like.",
        difficulty: "easy",
        difficultyLabel: "Smooth Sailing",
        dayThreshold: 60
    },
    {
        time: "Month 6",
        title: "Half Year Milestone",
        desc: "Your immune system is significantly stronger. Risk of respiratory illness has dropped. Most people at this stage rarely think about vaping. You've built a new identity.",
        difficulty: "victory",
        difficultyLabel: "Major Milestone",
        dayThreshold: 180
    },
    {
        time: "1 Year",
        title: "One Year Free",
        desc: "Your risk of heart disease has dropped significantly. Your body has done remarkable healing. You've saved money, gained health, and proven to yourself that you can overcome anything.",
        difficulty: "victory",
        difficultyLabel: "Victory",
        dayThreshold: 365
    }
];

// ==================== APP STATE ====================

let currentUser = null;
let breathingInterval = null;
let breathingTimeout = null;

// ==================== AUTH ====================

function getUsers() {
    return JSON.parse(localStorage.getItem('fp_users') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('fp_users', JSON.stringify(users));
}

function getCurrentSession() {
    return localStorage.getItem('fp_session');
}

function setCurrentSession(email) {
    localStorage.setItem('fp_session', email);
}

function clearSession() {
    localStorage.removeItem('fp_session');
}

// Show/Hide forms
document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('form-login').classList.add('hidden');
    document.getElementById('form-signup').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('form-signup').classList.add('hidden');
    document.getElementById('form-login').classList.remove('hidden');
});

// Signup
document.getElementById('form-signup').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errorEl = document.getElementById('signup-error');

    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match.';
        return;
    }

    const users = getUsers();
    if (users[email]) {
        errorEl.textContent = 'An account with this email already exists.';
        return;
    }

    users[email] = {
        name,
        email,
        password,
        identity: null,
        quitDate: null,
        motivations: [],
        vapingYears: null,
        createdAt: new Date().toISOString()
    };

    saveUsers(users);
    setCurrentSession(email);
    currentUser = users[email];
    errorEl.textContent = '';
    showPage('page-identity');
});

// Login
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    const users = getUsers();
    if (!users[email]) {
        errorEl.textContent = 'No account found with this email.';
        return;
    }
    if (users[email].password !== password) {
        errorEl.textContent = 'Incorrect password.';
        return;
    }

    setCurrentSession(email);
    currentUser = users[email];
    errorEl.textContent = '';

    if (!currentUser.identity) {
        showPage('page-identity');
    } else {
        showPage('page-dashboard');
        loadDashboard();
    }
});

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    clearSession();
    currentUser = null;
    showPage('page-auth');
    // Reset forms
    document.getElementById('form-login').reset();
    document.getElementById('form-signup').reset();
    document.getElementById('form-signup').classList.add('hidden');
    document.getElementById('form-login').classList.remove('hidden');
});

// ==================== IDENTITY ====================

document.getElementById('form-identity').addEventListener('submit', (e) => {
    e.preventDefault();

    const identity = document.getElementById('identity-who').value.trim();
    const motivations = [...document.querySelectorAll('input[name="motivation"]:checked')].map(cb => cb.value);
    const years = document.getElementById('identity-years').value;
    const quitDate = document.getElementById('identity-quit-date').value;

    if (!identity || !years || !quitDate) return;

    const users = getUsers();
    users[currentUser.email].identity = identity;
    users[currentUser.email].motivations = motivations;
    users[currentUser.email].vapingYears = years;
    users[currentUser.email].quitDate = quitDate;
    saveUsers(users);

    currentUser = users[currentUser.email];
    showPage('page-dashboard');
    loadDashboard();
});

// Set default quit date to today
document.getElementById('identity-quit-date').valueAsDate = new Date();

// ==================== NAVIGATION ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// ==================== DASHBOARD ====================

function loadDashboard() {
    if (!currentUser) return;

    // Set username
    document.getElementById('nav-username').textContent = currentUser.name;

    // Calculate streak
    const quitDate = new Date(currentUser.quitDate);
    const now = new Date();
    const diffMs = now - quitDate;
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const diffWeeks = Math.max(0, Math.floor(diffDays / 7));

    // Update streak display
    document.getElementById('streak-days').textContent = diffDays;
    document.getElementById('stat-hours').textContent = diffHours;
    document.getElementById('stat-days').textContent = diffDays;
    document.getElementById('stat-weeks').textContent = diffWeeks;

    // Streak detail message
    const detailEl = document.getElementById('streak-detail');
    if (diffDays === 0) {
        detailEl.textContent = "Today is day one. The most important day.";
    } else if (diffDays === 1) {
        detailEl.textContent = "You've survived the first 24 hours. That's huge.";
    } else if (diffDays < 7) {
        detailEl.textContent = "The first week is the hardest. You're doing it.";
    } else if (diffDays < 30) {
        detailEl.textContent = "Over a week strong. Your body is healing every day.";
    } else if (diffDays < 90) {
        detailEl.textContent = "Over a month! Your lungs and heart are thanking you.";
    } else if (diffDays < 365) {
        detailEl.textContent = "Months of freedom. You've built a new you.";
    } else {
        detailEl.textContent = "Over a year vape-free. You are unstoppable.";
    }

    // Animate streak ring (max at 365 days = full circle)
    const progress = Math.min(diffDays / 365, 1);
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (progress * circumference);

    // Add gradient def to SVG if not present
    const svg = document.querySelector('.streak-ring svg');
    if (!svg.querySelector('defs')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'streak-gradient');
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#3b82f6');
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#38bdf8');
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }

    setTimeout(() => {
        document.getElementById('ring-fill').style.strokeDashoffset = offset;
    }, 100);

    // Daily facts (seeded by date so they change daily)
    const dayOfYear = getDayOfYear();
    const negIdx = dayOfYear % NEGATIVE_FACTS.length;
    const posIdx = dayOfYear % POSITIVE_FACTS.length;
    document.getElementById('fact-negative-text').textContent = NEGATIVE_FACTS[negIdx];
    document.getElementById('fact-positive-text').textContent = POSITIVE_FACTS[posIdx];

    // Allah section
    const hasAllah = currentUser.motivations && currentUser.motivations.includes('allah');
    const allahSection = document.getElementById('allah-section');
    if (hasAllah) {
        allahSection.classList.remove('hidden');
        const allahIdx = dayOfYear % ALLAH_REMINDERS.length;
        document.getElementById('allah-reminder-text').textContent = ALLAH_REMINDERS[allahIdx];
    } else {
        allahSection.classList.add('hidden');
    }

    // Identity reminder
    document.getElementById('identity-reminder-text').textContent = '"' + currentUser.identity + '"';

    // Timeline
    renderTimeline(diffDays);
}

function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ==================== TIMELINE ====================

function renderTimeline(currentDays) {
    const container = document.getElementById('timeline');
    container.innerHTML = '';

    TIMELINE_DATA.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'timeline-item';

        const nextThreshold = TIMELINE_DATA[i + 1] ? TIMELINE_DATA[i + 1].dayThreshold : Infinity;
        if (currentDays >= nextThreshold) {
            div.classList.add('reached');
        } else if (currentDays >= item.dayThreshold) {
            div.classList.add('current');
        }

        div.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-desc">${item.desc}</div>
            <span class="timeline-difficulty difficulty-${item.difficulty}">${item.difficultyLabel}</span>
        `;

        container.appendChild(div);
    });
}

// ==================== EMERGENCY ====================

function openEmergency() {
    const modal = document.getElementById('emergency-modal');
    modal.classList.remove('hidden');
    showEmergencyPhase(1);

    // Pick 3 random reinforcements
    const shuffled = [...REINFORCEMENTS].sort(() => 0.5 - Math.random());
    document.getElementById('reinforcement-1').textContent = shuffled[0];
    document.getElementById('reinforcement-2').textContent = shuffled[1];
    document.getElementById('reinforcement-3').textContent = shuffled[2];

    // Allah emergency message
    const hasAllah = currentUser && currentUser.motivations && currentUser.motivations.includes('allah');
    const allahEmergency = document.getElementById('emergency-allah-msg');
    if (hasAllah) {
        allahEmergency.classList.remove('hidden');
        const randomAllah = ALLAH_REMINDERS[Math.floor(Math.random() * ALLAH_REMINDERS.length)];
        document.getElementById('emergency-allah-text').textContent = randomAllah;
        document.getElementById('complete-allah-msg').classList.remove('hidden');
        document.getElementById('complete-allah-msg').textContent = 'Allah is proud of your strength. This patience is worship.';
    } else {
        allahEmergency.classList.add('hidden');
        document.getElementById('complete-allah-msg').classList.add('hidden');
    }
}

function closeEmergency() {
    document.getElementById('emergency-modal').classList.add('hidden');
    stopBreathing();
}

function showEmergencyPhase(phase) {
    document.querySelectorAll('.emergency-phase').forEach(p => p.classList.add('hidden'));
    document.getElementById(`emergency-phase-${phase}`).classList.remove('hidden');
}

// ==================== BREATHING EXERCISE ====================

function startBreathing() {
    showEmergencyPhase(2);
    const circle = document.getElementById('breathing-circle');
    const text = document.getElementById('breathing-text');
    const timerEl = document.getElementById('breathing-timer');

    let totalSeconds = 120; // 2 minutes
    let phase = 'inhale';

    // Update timer display
    function updateTimer() {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Breathing cycle: 4s inhale, 4s exhale
    function breatheCycle() {
        if (phase === 'inhale') {
            circle.className = 'breathing-circle inhale';
            text.textContent = 'Breathe In';
            phase = 'exhale';
        } else {
            circle.className = 'breathing-circle exhale';
            text.textContent = 'Breathe Out';
            phase = 'inhale';
        }
    }

    // Start
    updateTimer();
    breatheCycle();
    breathingInterval = setInterval(() => {
        breatheCycle();
    }, 4000);

    // Countdown
    const countdown = setInterval(() => {
        totalSeconds--;
        updateTimer();
        if (totalSeconds <= 0) {
            clearInterval(countdown);
            stopBreathing();
            showEmergencyPhase(3);
        }
    }, 1000);

    // Store countdown so we can clear it
    breathingTimeout = countdown;
}

function stopBreathing() {
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    if (breathingTimeout) {
        clearInterval(breathingTimeout);
        breathingTimeout = null;
    }
    const circle = document.getElementById('breathing-circle');
    if (circle) {
        circle.className = 'breathing-circle';
        document.getElementById('breathing-text').textContent = 'Ready';
    }
}

// ==================== INIT ====================

function init() {
    const sessionEmail = getCurrentSession();
    if (sessionEmail) {
        const users = getUsers();
        if (users[sessionEmail]) {
            currentUser = users[sessionEmail];
            if (!currentUser.identity) {
                showPage('page-identity');
            } else {
                showPage('page-dashboard');
                loadDashboard();
            }
            return;
        }
    }
    showPage('page-auth');
}

init();
