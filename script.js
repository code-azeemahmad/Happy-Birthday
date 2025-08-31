// Elements
const hero = document.getElementById('hero');
const openBtn = document.getElementById('openBtn');
const scene = document.getElementById('scene');
const confettiCanvas = document.getElementById('confetti');
const blowBtn = document.getElementById('blowBtn');
const relightBtn = document.getElementById('relightBtn');
const micBtn = document.getElementById('micBtn');
const nameInput = document.getElementById('nameInput');
const friendName = document.getElementById('friendName');
const candlesWrap = document.getElementById('candles');
const wishText = document.getElementById('wishText');

let audioCtx, analyser, micStream, micEnabled = false;

// --- Surprise open ---
// --- Surprise open ---
openBtn.addEventListener('click', () => {
  // Show the gift image first
  const giftImage = document.getElementById('giftImage');
  giftImage.style.display = "block";

  // After a short delay, transition to scene
  setTimeout(() => {
    hero.classList.add('hidden');
    scene.classList.remove('hidden');
    scene.classList.add('fade-in');
    startConfetti(8000);
  }, 2000); // wait 2s so the image is visible before moving on
});

// su-25-removebg-preview.png
//________________________________________________________________


let aircraftInterval;
let aircraftsActive = false;
let aircrafts = [];
let lastScrollTop = 0;
let isInCakeSection = false;

function createAircraft() {
  const container = document.getElementById("aircraft-container");
  if (!container) return;

  const wrapper = document.createElement("div");
  const aircraft = document.createElement("img");

  aircraft.src = "su-25-removebg-preview.png";
  aircraft.classList.add("aircraft");

  const size = Math.random() * 60 + 80;
  aircraft.style.width = size + "px";

  wrapper.style.position = "absolute";
  wrapper.style.top = Math.random() * (window.innerHeight - 150) + "px";

  const direction = Math.random() > 0.5 ? "right" : "left";
  let x;
  if (direction === "right") {
    x = -200;
    wrapper.style.transform = "scaleX(1)";
  } else {
    x = window.innerWidth + 200;
    wrapper.style.transform = "scaleX(-1)";
  }

  wrapper.style.left = x + "px";
  wrapper.appendChild(aircraft);
  container.appendChild(wrapper);

  const speed = Math.random() * 4 + 3;

  aircrafts.push({ el: wrapper, x, y: parseInt(wrapper.style.top), direction, speed, width: size, height: size * 0.6 });
}

function updateAircrafts() {
  for (let i = aircrafts.length - 1; i >= 0; i--) {
    const plane = aircrafts[i];

    if (plane.direction === "right") {
      plane.x += plane.speed;
      if (plane.x > window.innerWidth + 200) {
        plane.el.remove();
        aircrafts.splice(i, 1);
        continue;
      }
    } else {
      plane.x -= plane.speed;
      if (plane.x < -200) {
        plane.el.remove();
        aircrafts.splice(i, 1);
        continue;
      }
    }

    plane.el.style.left = plane.x + "px";
  }

  let collidedIndices = new Set();
  for (let i = 0; i < aircrafts.length; i++) {
    if (collidedIndices.has(i)) continue;
    for (let j = i + 1; j < aircrafts.length; j++) {
      if (collidedIndices.has(j)) continue;

      const aRect = aircrafts[i].el.getBoundingClientRect();
      const bRect = aircrafts[j].el.getBoundingClientRect();
      const ax = aRect.left + aRect.width / 2;
      const ay = aRect.top + aRect.height / 2;
      const bx = bRect.left + bRect.width / 2;
      const by = bRect.top + bRect.height / 2;
      const distance = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));

      if (distance < 100) {
        crash(aircrafts[i], aircrafts[j]);
        collidedIndices.add(i);
        collidedIndices.add(j);
        break;
      }
    }
  }

  aircrafts = aircrafts.filter((_, idx) => !collidedIndices.has(idx));
  
  if (aircraftsActive) {
    requestAnimationFrame(updateAircrafts);
  }
}

function crash(planeA, planeB) {
  const explosion = document.createElement("img");
  explosion.src = "explosion.png";
  explosion.style.position = "absolute";
  explosion.style.width = "120px";
  explosion.style.height = "120px";

  const aRect = planeA.el.getBoundingClientRect();
  const bRect = planeB.el.getBoundingClientRect();
  const x = (aRect.left + bRect.left) / 2 - 60;
  const y = (aRect.top + bRect.top) / 2 - 60;

  explosion.style.left = x + "px";
  explosion.style.top = y + "px";
  explosion.style.pointerEvents = "none";

  document.getElementById("aircraft-container").appendChild(explosion);
  planeA.el.remove();
  planeB.el.remove();

  setTimeout(() => {
    if (explosion.parentNode) {
      explosion.parentNode.removeChild(explosion);
    }
  }, 1000);
}

function startAircrafts() {
  if (!aircraftsActive) {
    aircraftsActive = true;
    const container = document.getElementById("aircraft-container");
    if (container) {
      container.style.display = "block";
      aircraftInterval = setInterval(createAircraft, Math.random() * 2000 + 2000);
      requestAnimationFrame(updateAircrafts);
    }
  }
}

function stopAircrafts() {
  if (aircraftsActive) {
    aircraftsActive = false;
    const container = document.getElementById("aircraft-container");
    if (container) {
      container.style.display = "none";
    }
    clearInterval(aircraftInterval);
    
    // Clean up all aircraft
    aircrafts.forEach(plane => {
      if (plane.el && plane.el.parentNode) {
        plane.el.parentNode.removeChild(plane.el);
      }
    });
    aircrafts = [];
  }
}

function checkCakeSection() {
  const cake = document.querySelector(".cake");
  if (!cake) return false;
  
  const rect = cake.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

// Scroll detection with direction and cake section checking
window.addEventListener("scroll", function() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollingDown = scrollTop > lastScrollTop;
  lastScrollTop = scrollTop;
  
  const currentlyInCakeSection = checkCakeSection();
  
  // If just entered cake section (scrolling down into it)
  if (currentlyInCakeSection && !isInCakeSection && scrollingDown) {
    stopAircrafts();
    isInCakeSection = true;
  }
  // If just left cake section (scrolling up out of it)
  else if (!currentlyInCakeSection && isInCakeSection && !scrollingDown) {
    startAircrafts();
    isInCakeSection = false;
  }
  // If scrolling up anywhere outside cake section
  else if (!currentlyInCakeSection && !scrollingDown && !aircraftsActive) {
    startAircrafts();
    isInCakeSection = false;
  }
  // If scrolling down anywhere outside cake section but planes are still active
  else if (!currentlyInCakeSection && scrollingDown && aircraftsActive) {
    stopAircrafts();
    isInCakeSection = false;
  }
  
  // Update the current state
  isInCakeSection = currentlyInCakeSection;
});

// Start aircrafts initially if not in cake section
document.addEventListener('DOMContentLoaded', function() {
  if (!checkCakeSection()) {
    startAircrafts();
  }
});

// REMOVE the automatic start on load - planes will only start when button is clicked
// startAircrafts(); // This line is commented out now





// _______________________________________________________________
// Update displayed name live
// nameInput.addEventListener('input', e => {
//   friendName.textContent = e.target.value.trim() || 'Dear Friend';
// });

// --- Candles logic ---
function forEachCandle(cb){
  [...candlesWrap.querySelectorAll('.candle')].forEach(cb);
}

function anyLit(){
  return [...candlesWrap.querySelectorAll('.candle')].some(c => c.dataset.lit === 'true');
}

function blowCandles(){
  if (!anyLit()) return;
  forEachCandle(c => c.dataset.lit = 'false');
  startConfetti(3_000);
}

function relightCandles(){
  forEachCandle(c => c.dataset.lit = 'true');
}

candlesWrap.addEventListener('click', e => {
  const c = e.target.closest('.candle');
  if (c) {
    c.dataset.lit = c.dataset.lit === 'true' ? 'false' : 'true';
  }
});

blowBtn.addEventListener('click', blowCandles);
relightBtn.addEventListener('click', relightCandles);

// Keyboard: press B to blow, R to relight
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'b') blowCandles();
  if (e.key.toLowerCase() === 'r') relightCandles();
});

// --- Optional: Microphone blow (detect loudness) ---
micBtn.addEventListener('click', async () => {
  try {
    if (!micEnabled) {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      micEnabled = true;
      micBtn.textContent = 'Microphone: ON (blow to extinguish)';
      listenForBlow();
    } else {
      // turn off
      micStream.getTracks().forEach(t => t.stop());
      audioCtx.close();
      micEnabled = false;
      micBtn.textContent = 'Enable Microphone Blow';
    }
  } catch (err) {
    alert('Microphone access was blocked. You can still click candles or press B to blow.');
    console.error(err);
  }
});

function listenForBlow(){
  const buf = new Uint8Array(analyser.frequencyBinCount);
  let cooldown = 0;

  function loop(){
    if (!micEnabled) return;
    analyser.getByteTimeDomainData(buf);

    // Rough volume estimate: average deviation from midpoint (128)
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      sum += Math.abs(buf[i] - 128);
    }
    const vol = sum / buf.length; // ~ 0..~40+ for loud clap/whistle

    if (vol > 18 && cooldown <= 0) {
      blowCandles();
      cooldown = 60; // ~1s cooldown
    } else {
      cooldown = Math.max(0, cooldown - 1);
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// --- Confetti ---
const ctx = confettiCanvas.getContext('2d');
function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let confetti = [];
function makeConfettiBurst(count=180){
  const colors = ['#ff6ec7','#ffd166','#22c55e','#60a5fa','#f43f5e','#a78bfa','#00e6ff'];
  for (let i=0;i<count;i++){
    confetti.push({
      x: confettiCanvas.width/2 + (Math.random()-0.5)*80,
      y: confettiCanvas.height/2 - 60 + (Math.random()-0.5)*40,
      vx: (Math.random()-0.5)*6,
      vy: Math.random()*-6 - 3,
      size: Math.random()*6+4,
      rot: Math.random()*Math.PI*2,
      vr: (Math.random()-0.5)*0.2,
      color: colors[Math.floor(Math.random()*colors.length)],
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
      life: 120 + Math.random()*60
    });
  }
}

function updateConfetti(){
  ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  confetti.forEach(p => {
    p.vy += 0.12;          // gravity
    p.vx *= 0.995;         // gentle drag
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 'rect') {
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
    } else {
      ctx.beginPath();
      ctx.arc(0,0,p.size/2,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  });
  confetti = confetti.filter(p => p.life > 0 && p.y < confettiCanvas.height + 40);
  requestAnimationFrame(updateConfetti);
}
updateConfetti();

function startConfetti(durationMs=3000){
  makeConfettiBurst();
  const bursts = Math.max(1, Math.floor(durationMs / 350));
  let i = 1;
  const id = setInterval(() => {
    makeConfettiBurst(120);
    if (++i >= bursts) clearInterval(id);
  }, 350);
  // also briefly jiggle wish text as a fun touch
  wishText.style.transition = 'transform .2s';
  wishText.style.transform = 'scale(1.02)';
  setTimeout(()=> wishText.style.transform='none', 250);
}

// Auto focus name input on scene load
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !hero.classList.contains('hidden')) {
    // still on hero
  }
});
