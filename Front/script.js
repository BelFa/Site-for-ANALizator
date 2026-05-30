// 1. CALCULATOR LOGIC
const slider = document.getElementById('rps-slider');
const rpsVal = document.getElementById('rps-val');
const cpuVal = document.getElementById('cpu-save');
const moneyVal = document.getElementById('money-save');

slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    rpsVal.textContent = val;
    
    let cpuSavings = 78 + (val / 1200);
    if(cpuSavings > 99) cpuSavings = 99.9;
    const moneySavings = Math.floor(val * 248);
    
    cpuVal.textContent = `-${cpuSavings.toFixed(1)}%`;
    moneyVal.textContent = `${moneySavings.toLocaleString('ru-RU')} ₽`;
});

// 2. INTERACTIVE PARTICLE BACKGROUND
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const numberOfParticles = 80;

let mouse = {
    x: null,
    y: null,
    radius: 150 
};

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = 'rgba(227, 30, 36, 0.4)'; 
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distanceBetweenParticles = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                                            ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            if (distanceBetweenParticles < (canvas.width / 12) * (canvas.height / 12)) {
                ctx.strokeStyle = 'rgba(227, 30, 36, 0.05)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }

        // Интерактивные линии при наведении мыши теперь КРАСНЫЕ (под цвет точек)
        if (mouse.x != null) {
            let distanceToMouse = ((particlesArray[a].x - mouse.x) * (particlesArray[a].x - mouse.x)) +
                                  ((particlesArray[a].y - mouse.y) * (particlesArray[a].y - mouse.y));
            
            if (distanceToMouse < mouse.radius * mouse.radius) {
                ctx.strokeStyle = 'rgba(227, 30, 36, 0.25)'; 
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connect();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
});

init();
animate();

// 3. FRONTEND BACKEND INTERACTION (POST TO GO SERVER)
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('feedbackInput');
    const status = document.getElementById('statusMsg');
    
    try {
        const response = await fetch('http://localhost:8080/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input.value })
        });

        if (response.ok) {
            status.style.color = "#10B981"; // Зеленый
            status.textContent = "Комментарий успешно сохранен!";
            input.value = "";
        } else {
            throw new Error();
        }
    } catch (err) {
        status.style.color = "#EF4444"; // Красный
        status.textContent = "Ошибка. Убедитесь, что Go-бэкенд запущен на порту 8080.";
    }
});