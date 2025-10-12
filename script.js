const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spin-button');
const chainedModeCheckbox = document.getElementById('chained-mode-checkbox');
const currentTimeSpan = document.getElementById('current-time');
const nextActionSpan = document.getElementById('next-action');
const scheduleDisplayDiv = document.getElementById('schedule-display');

const dailySchedule = {
    '09:00': 'start',
    '12:00': 'leisure',
    '18:00': 'start'
};

const chainedRoulettes = {
    'start': {
        options: ["Go to Work", "Go to Gym", { label: "Leisure", next: "leisure" }]
    },
    'leisure': {
        options: ["Read", "Watch TV", "Play Game", { label: "Go Back", next: "start" }]
    }
};

let currentRoulette = 'start';
let options = chainedRoulettes[currentRoulette].options;
let numOptions = options.length;
let arcSize = 2 * Math.PI / numOptions;
const radius = canvas.width / 2 - 10;

function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.font = '16px Arial';

    for (let i = 0; i < numOptions; i++) {
        const angle = i * arcSize;
        ctx.fillStyle = i % 2 === 0 ? '#ffdddd' : '#ffffff';

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, angle, angle + arcSize);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "black";
        ctx.translate(
            canvas.width / 2 + Math.cos(angle + arcSize / 2) * radius * 0.7,
            canvas.height / 2 + Math.sin(angle + arcSize / 2) * radius * 0.7
        );
        ctx.rotate(angle + arcSize / 2 + Math.PI / 2);
        const option = options[i];
        const text = typeof option === 'object' ? option.label : option;
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }
}

let currentAngle = 0;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let isSpinning = false;

function spin() {
    if (isSpinning) return;

    isSpinning = true;
    spinAngleStart = Math.random() * 10 + 10; // Random rotation
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000; // Random spin time
    rotate();
}

function rotate() {
    spinTime += 30;
    if(spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    currentAngle += (spinAngle * Math.PI / 180);
    drawRouletteWithRotation();
    requestAnimationFrame(rotate);
}

function stopRotateWheel() {
    isSpinning = false;
    const degrees = currentAngle * 180 / Math.PI + 90;
    const arcd = arcSize * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const selectedOption = options[index];

    if (chainedModeCheckbox.checked && typeof selectedOption === 'object' && selectedOption.next) {
        currentRoulette = selectedOption.next;
        options = chainedRoulettes[currentRoulette].options;
        numOptions = options.length;
        arcSize = 2 * Math.PI / numOptions;
        drawRoulette();
    } else {
        ctx.save();
        ctx.font = 'bold 30px Arial';
        const text = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
        ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height / 2 + 10);
        ctx.restore();
    }
}

function drawRouletteWithRotation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(currentAngle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawRoulette();
    ctx.restore();

    // Draw the pointer
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 4, 0);
    ctx.lineTo(canvas.width / 2 + 4, 0);
    ctx.lineTo(canvas.width / 2, 20);
    ctx.fill();
}

function easeOut(t, b, c, d) {
    const ts = (t/=d)*t;
    const tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
}

spinButton.addEventListener('click', spin);
drawRoulette();

// --- Daily Schedule Logic ---

let lastTriggeredTime = null;

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function updateScheduleDisplay() {
    scheduleDisplayDiv.innerHTML = '<ul>' +
        Object.entries(dailySchedule).map(([time, roulette]) => `<li>${time}: ${roulette}</li>`).join('') +
        '</ul>';
}

function checkSchedule() {
    const now = new Date();
    const currentTime = formatTime(now);
    currentTimeSpan.textContent = `${currentTime}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Find next action
    const scheduleTimes = Object.keys(dailySchedule).sort();
    let nextActionTime = null;
    for (const time of scheduleTimes) {
        if (time > currentTime) {
            nextActionTime = time;
            break;
        }
    }
    nextActionSpan.textContent = nextActionTime ? `${nextActionTime} - ${dailySchedule[nextActionTime]}` : "None for today";


    // Check if it's time to trigger a roulette
    if (dailySchedule[currentTime] && lastTriggeredTime !== currentTime) {
        if (isSpinning) return; // Don't trigger if another spin is in progress
        lastTriggeredTime = currentTime;
        currentRoulette = dailySchedule[currentTime];
        options = chainedRoulettes[currentRoulette].options;
        numOptions = options.length;
        arcSize = 2 * Math.PI / numOptions;
        drawRouletteWithRotation(); // Redraw before spinning
        spin();
    }
}

updateScheduleDisplay();
setInterval(checkSchedule, 1000);
