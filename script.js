// Script: creative Age Calculator
document.addEventListener('DOMContentLoaded', () => {
  const dobInput = document.getElementById('dob');
  const form = document.getElementById('ageForm');
  const yearsVal = document.getElementById('yearsVal');
  const monthsVal = document.getElementById('monthsVal');
  const daysVal = document.getElementById('daysVal');
  const yearsRing = document.getElementById('yearsRing');
  const monthsRing = document.getElementById('monthsRing');
  const daysRing = document.getElementById('daysRing');
  const iconWrap = document.getElementById('iconWrap');
  const calendarIcon = document.getElementById('calendarIcon');
  const cakeIcon = document.getElementById('cakeIcon');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const copyBtn = document.getElementById('copyBtn');
  const resultText = document.getElementById('resultText');
  const calcBtn = document.getElementById('calcBtn');

  // set max date to today
  const today = new Date().toISOString().split('T')[0];
  dobInput.setAttribute('max', today);

  // utility: animate counter
  function animateCount(el, start, end, duration = 800) {
    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(start + (end - start) * easeOutCubic(progress));
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = end; // ensure exact
    }
    requestAnimationFrame(frame);
  }
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  // utility: animate ring stroke
  function setRing(ringEl, percent) {
    // SVG circle path uses stroke-dasharray/offset; path length roughly maps to 100
    const pct = Math.max(0, Math.min(100, percent * 100)); // 0..100
    // stroke-dashoffset 100 -> empty, 0 -> full
    ringEl.style.strokeDashoffset = String(100 - pct);
  }

  // small bounce icon
  function bounceIcon() {
    calendarIcon.classList.add('bounce');
    cakeIcon.classList.add('bounce');
    setTimeout(() => {
      calendarIcon.classList.remove('bounce');
      cakeIcon.classList.remove('bounce');
    }, 900);
  }

  // Simple confetti implementation
  function runConfetti(duration = 1500, particleCount = 80) {
    const ctx = confettiCanvas.getContext('2d');
    const w = confettiCanvas.width = window.innerWidth;
    const h = confettiCanvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#ff9a9e','#ffd166','#60c3ff','#88f7b5','#ffb3de'];

    for (let i=0;i<particleCount;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h - h/2,
        r: (Math.random()*6)+4,
        d: Math.random()*60+10,
        vx: (Math.random()-0.5)*6,
        vy: Math.random()*6+2,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360
      });
    }
    let start = performance.now();
    function frame(now) {
      const t = now - start;
      ctx.clearRect(0,0,w,h);
      for (const p of particles){
        p.x += p.vx;
        p.y += p.vy + Math.sin((t+p.d)/500)*0.5;
        p.rot += p.vx * 4;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
        ctx.restore();
      }
      if (t < duration) requestAnimationFrame(frame);
      else ctx.clearRect(0,0,w,h);
    }
    requestAnimationFrame(frame);
    // clear after a bit
    setTimeout(()=> ctx.clearRect(0,0,w,h), duration + 80);
  }

  // copy result to clipboard
  copyBtn.addEventListener('click', async () => {
    const text = `${yearsVal.textContent} years, ${monthsVal.textContent} months, ${daysVal.textContent} days`;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied ✓';
      setTimeout(()=> copyBtn.textContent = 'Copy Result', 1200);
    } catch (e) {
      copyBtn.textContent = 'Copy Failed';
      setTimeout(()=> copyBtn.textContent = 'Copy Result', 1200);
    }
  });

  // button ripple effect
  calcBtn.addEventListener('click', (ev) => {
    const btn = ev.currentTarget;
    const circle = document.createElement('span');
    circle.classList.add('ripple');
    btn.appendChild(circle);
    const d = Math.max(btn.clientWidth, btn.clientHeight);
    circle.style.width = circle.style.height = d + 'px';
    const rect = btn.getBoundingClientRect();
    circle.style.left = (ev.clientX - rect.left - d/2) + 'px';
    circle.style.top = (ev.clientY - rect.top - d/2) + 'px';
    setTimeout(()=> circle.remove(), 600);
  });

  // create ripple CSS dynamically
  (function addRippleStyle(){
    const style = document.createElement('style');
    style.textContent = `
      .ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        background: rgba(255,255,255,0.18);
        animation: rippleAnim 600ms linear;
        pointer-events:none;
      }
      @keyframes rippleAnim {
        to { transform: scale(4); opacity:0; }
      }
      #calcBtn { position: relative; overflow: hidden; }
    `;
    document.head.appendChild(style);
  })();

  // Main calculation
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dobStr = dobInput.value;
    if (!dobStr) {
      alert('Please enter your date of birth.');
      return;
    }
    const dob = new Date(dobStr);
    const now = new Date();
    if (dob > now) {
      alert('Date of birth cannot be in the future.');
      return;
    }

    // Calculate years, months, days
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      // days in previous month of 'now'
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // animate numbers
    animateCount(yearsVal, 0, years, 900);
    animateCount(monthsVal, 0, months, 900);
    animateCount(daysVal, 0, days, 900);

    // animate rings: scale to values (normalize)
    // For years, we will show % of 100 as playful (cap at 100)
    const yearsPct = Math.min(1, years / 100);
    const monthsPct = months / 12;
    const daysPct = days / 31; // approximate
    setRing(yearsRing, yearsPct);
    setRing(monthsRing, monthsPct);
    setRing(daysRing, daysPct);

    // show cake icon and bounce
    cakeIcon.style.opacity = '1';
    cakeIcon.style.transform = 'translateY(-6px)';
    bounceIcon();

    // update hidden result text (for copying & screen readers)
    resultText.textContent = `You are ${years} years, ${months} months, and ${days} days old.`;

    // confetti
    runConfetti(1400, 80);

    // small flash on result area
    const resArea = document.getElementById('resultArea');
    resArea.animate([{opacity:0.6},{opacity:1}],{duration:700, easing:'ease-out'});

    // visual ring animation smoothing: give stroke-dashoffset instantly then let CSS transition update it
    // (already done above - CSS transitions handle it)
  });
});
