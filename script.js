// Show AM Portfolio badge after intro exits
document.addEventListener('DOMContentLoaded', function() {
  const badge = document.getElementById('portfolioBadge');
  const intro = document.getElementById('intro');
  if (!badge || !intro) return;
  const observer = new MutationObserver(() => {
    if (intro.classList.contains('exit')) {
      setTimeout(() => badge.classList.add('visible'), 700);
    }
  });
  observer.observe(intro, { attributes: true, attributeFilter: ['class'] });
});
'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ══════════════════════════════════════════════════════════════
   1. CINEMATIC INTRO — WITH CYBER WARNING CANVAS BACKGROUND
══════════════════════════════════════════════════════════════ */
(function initCinematicIntro() {
  const intro       = $('#intro');
  const canvas      = $('#introCanvas');
  const stageBoot   = $('#stageboot');
  const stageName   = $('#stagename');
  const stageWelc   = $('#stagewelcome');
  const burst       = $('#introBurst');
  const flash       = $('#introFlash');
  const nameLetters = $('#nameLetters');
  const nameRole    = $('#nameRole');
  const bootLines   = $('#bootLines');

  document.body.style.overflow = 'hidden';

  /* ════════════════════════════════════
     CYBER WARNING CANVAS ANIMATION
     Red/orange network + warning triangles
  ════════════════════════════════════ */
  const ctx = canvas.getContext('2d');
  let W, H;
  let cyberNodes = [];
  let warningTriangles = [];
  let scanY = 0;
  let animFrame;
  let globalTime = 0;

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Cyber node
  function createCyberNode() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.7,
      vy:    (Math.random() - 0.5) * 0.7,
      r:     Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.3,
      pulse: Math.random() * Math.PI * 2,
      type:  Math.random() > 0.7 ? 'hot' : 'dim',  // hot = orange, dim = dark red
    };
  }

  // Warning triangle data
  function createWarningTriangle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      size:  Math.random() * 18 + 8,
      alpha: Math.random() * 0.25 + 0.05,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.003,
      vy:    -(Math.random() * 0.3 + 0.1),
    };
  }

  for (let i = 0; i < 90; i++)  cyberNodes.push(createCyberNode());
  for (let i = 0; i < 14; i++) warningTriangles.push(createWarningTriangle());

  // Draw warning triangle shape
  function drawTriangle(cx, cy, size, alpha) {
    const h = size * Math.sqrt(3) / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.67);
    ctx.lineTo(cx - size / 2, cy + h * 0.33);
    ctx.lineTo(cx + size / 2, cy + h * 0.33);
    ctx.closePath();
    ctx.strokeStyle = `rgba(255,60,30,${alpha})`;
    ctx.lineWidth   = 1.2;
    ctx.stroke();
    // exclamation
    if (size > 14) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.25);
      ctx.lineTo(cx, cy + h * 0.1);
      ctx.strokeStyle = `rgba(255,100,30,${alpha * 0.8})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + h * 0.2, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,100,30,${alpha * 0.8})`;
      ctx.fill();
    }
  }

  // Central warning glow
  function drawCentralGlow() {
    const cx = W / 2;
    const cy = H / 2;
    const pulse = 0.5 + 0.5 * Math.sin(globalTime * 0.04);

    // Outer radial glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55);
    grad.addColorStop(0,   `rgba(255,40,0,${0.06 + pulse * 0.04})`);
    grad.addColorStop(0.3, `rgba(200,30,0,${0.04 + pulse * 0.02})`);
    grad.addColorStop(0.6, `rgba(80,10,0,${0.02})`);
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Concentric rings
    for (let r = 1; r <= 4; r++) {
      const radius = (W * 0.08 * r) + pulse * 15;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,50,0,${0.06 / r})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Central big warning
    const bigSize = 80 + pulse * 12;
    const h = bigSize * Math.sqrt(3) / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.67);
    ctx.lineTo(cx - bigSize / 2, cy + h * 0.33);
    ctx.lineTo(cx + bigSize / 2, cy + h * 0.33);
    ctx.closePath();
    ctx.strokeStyle = `rgba(255,60,20,${0.18 + pulse * 0.12})`;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Inner fill gradient
    const tGrad = ctx.createLinearGradient(cx - bigSize/2, cy - h*0.67, cx + bigSize/2, cy + h*0.33);
    tGrad.addColorStop(0, `rgba(255,80,0,${0.04 + pulse * 0.04})`);
    tGrad.addColorStop(1, `rgba(255,0,0,0.01)`);
    ctx.fillStyle = tGrad;
    ctx.fill();

    // Big exclamation
    const iAlpha = 0.35 + pulse * 0.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.22);
    ctx.lineTo(cx, cy + h * 0.08);
    ctx.strokeStyle = `rgba(255,120,30,${iAlpha})`;
    ctx.lineWidth   = 3.5;
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + h * 0.18, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,120,30,${iAlpha})`;
    ctx.fill();
  }

  // Circuit board horizontal/vertical lines from center
  function drawCircuitLines() {
    const cx = W / 2, cy = H / 2;
    const pulse = 0.5 + 0.5 * Math.sin(globalTime * 0.025);
    const lineAlpha = 0.06 + pulse * 0.04;

    const dirs = [
      [1,0],[-1,0],[0,1],[0,-1],
      [0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]
    ];
    dirs.forEach(([dx, dy]) => {
      const len = Math.min(W, H) * 0.45;
      // dashed circuit segments
      let x = cx, y = cy;
      for (let seg = 0; seg < 4; seg++) {
        const segLen = (len / 4) * (0.7 + Math.random() * 0.3);
        ctx.beginPath();
        ctx.moveTo(x, y);
        x += dx * segLen * 0.75;
        y += dy * segLen * 0.75;
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(255,60,0,${lineAlpha * (1 - seg * 0.2)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // node dot at junction
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,100,0,${lineAlpha * 1.5 * (1 - seg * 0.2)})`;
        ctx.fill();
        // perpendicular branch
        if (seg < 3) {
          const px = dy, py = -dx;
          const branchLen = segLen * 0.3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + px * branchLen, y + py * branchLen);
          ctx.strokeStyle = `rgba(255,40,0,${lineAlpha * 0.6})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });
  }

  // Scan line effect
  function drawScanLine() {
    scanY = (scanY + 1.5) % H;
    const grad = ctx.createLinearGradient(0, scanY - 3, 0, scanY + 3);
    grad.addColorStop(0,   'rgba(255,40,0,0)');
    grad.addColorStop(0.5, 'rgba(255,80,20,0.12)');
    grad.addColorStop(1,   'rgba(255,40,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 3, W, 6);
  }

  function drawCyberCanvas() {
    globalTime++;

    // Clear with dark overlay (trail effect)
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, W, H);

    // Central warning glow
    drawCentralGlow();

    // Circuit lines
    drawCircuitLines();

    // Update + draw nodes
    cyberNodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      n.pulse += 0.04;
      if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;

      const pAlpha = n.alpha * (0.6 + 0.4 * Math.sin(n.pulse));
      const color = n.type === 'hot'
        ? `rgba(255,${100 + Math.floor(Math.sin(n.pulse)*40)},20,${pAlpha})`
        : `rgba(${180 + Math.floor(Math.sin(n.pulse)*40)},30,0,${pAlpha * 0.7})`;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (0.8 + 0.2 * Math.sin(n.pulse)), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // glow halo on hot nodes
      if (n.type === 'hot') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        halo.addColorStop(0, `rgba(255,80,0,${pAlpha * 0.3})`);
        halo.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = halo;
        ctx.fill();
      }
    });

    // Draw connections between nearby nodes
    for (let i = 0; i < cyberNodes.length; i++) {
      for (let j = i + 1; j < cyberNodes.length; j++) {
        const dx = cyberNodes[i].x - cyberNodes[j].x;
        const dy = cyberNodes[i].y - cyberNodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          const alpha = (1 - d / 130) * 0.18;
          ctx.beginPath();
          ctx.moveTo(cyberNodes[i].x, cyberNodes[i].y);
          ctx.lineTo(cyberNodes[j].x, cyberNodes[j].y);
          ctx.strokeStyle = `rgba(255,50,0,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Floating warning triangles
    warningTriangles.forEach(t => {
      t.y  += t.vy;
      t.phase += t.speed;
      const alpha = t.alpha * (0.5 + 0.5 * Math.sin(t.phase));
      if (t.y < -t.size * 2) {
        t.y = H + t.size;
        t.x = Math.random() * W;
      }
      drawTriangle(t.x, t.y, t.size, alpha);
    });

    // Scan line
    drawScanLine();

    animFrame = requestAnimationFrame(drawCyberCanvas);
  }

  canvas.classList.add('visible');
  drawCyberCanvas();

  /* ── Stage helpers ── */
  function showStage(el) {
    [stageBoot, stageName, stageWelc].forEach(s => s.classList.remove('active'));
    el.classList.add('active');
  }

  function hideIntro() {
    cancelAnimationFrame(animFrame);
    flash.classList.add('go');
    setTimeout(() => {
      flash.classList.remove('go');
      intro.classList.add('exit');
      setTimeout(() => {
        intro.style.display = 'none';
        document.body.style.overflow = '';
        initAOS();
      }, 900);
    }, 80);
  }

  /* ── Burst particles ── */
  function fireBurst() {
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 14 + 4;
      const angle = Math.random() * Math.PI * 2;
      const dist  = Math.random() * 55 + 25;
      const colors = [
        'rgba(0,229,255,0.9)', 'rgba(45,156,255,0.9)',
        'rgba(168,85,247,0.9)', 'rgba(244,114,182,0.9)',
        'rgba(255,255,255,0.95)'
      ];
      p.className = 'burst-particle';
      p.style.cssText = `
        left:50%; top:50%;
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        box-shadow:0 0 ${size*2}px ${colors[Math.floor(Math.random()*colors.length)]};
        --tx:${Math.cos(angle)*dist*3.5}vw;
        --ty:${Math.sin(angle)*dist*3.5}vh;
        animation-duration:${Math.random()*0.5+0.8}s;
        animation-delay:${Math.random()*0.12}s;
      `;
      burst.appendChild(p);
    }
    setTimeout(() => { burst.innerHTML = ''; }, 1500);
  }

  /* ════════════════════════
     STAGE 1: BOOT SEQUENCE
  ════════════════════════ */
  const bootData = [
    { text: '> SYSTEM BOOT v4.2.1',             cls: 'head', delay: 0 },
    { text: '  Mounting Portfolio core...',      cls: 'dim',  delay: 120 },
    { text: '  [OK] Core loaded',               cls: 'ok',   delay: 220 },
    { text: '  Loading CV dataset...',          cls: 'dim',  delay: 360 },
    { text: '  [OK] 8.9 CGPA verified',         cls: 'ok',   delay: 480 },
    { text: '  Scanning skills matrix...',      cls: 'dim',  delay: 620 },
    { text: '  [OK] 20+ skills indexed',        cls: 'ok',   delay: 760 },
    { text: '  Compiling projects...',          cls: 'dim',  delay: 900 },
    { text: '  [OK] 3 flagship projects',       cls: 'ok',   delay: 1020 },
    { text: '  Verifying certs...',             cls: 'dim',  delay: 1160 },
    { text: '  [OK] 11+ certificates found',   cls: 'ok',   delay: 1280 },
    { text: '  WARN: Exceptional talent detected', cls: 'warn', delay: 1440 },
    { text: '> LAUNCHING PORTFOLIO...',         cls: 'head', delay: 1620 },
  ];

  showStage(stageBoot);

  bootData.forEach(({ text, cls, delay }) => {
    setTimeout(() => {
      const line = document.createElement('span');
      line.className = `boot-line ${cls}`;
      line.textContent = text;
      bootLines.appendChild(line);
      bootLines.scrollTop = bootLines.scrollHeight;
    }, delay);
  });

  /* ════════════════════════
     STAGE 2: NAME REVEAL
  ════════════════════════ */
  setTimeout(() => {
    showStage(stageName);
    const name = 'AAYUSH MAHESHWARI';
    nameLetters.innerHTML = '';
    let charIdx = 0;
    name.split('').forEach((ch, i) => {
      setTimeout(() => {
        const span = document.createElement('span');
        span.className = ch === ' ' ? 'name-char space' : 'name-char';
        span.textContent = ch === ' ' ? '' : ch;
        span.style.animationDelay = '0s';
        nameLetters.appendChild(span);
      }, charIdx * 55);
      if (ch !== ' ') charIdx++;
    });
    setTimeout(() => {
      nameRole.textContent = 'AI/ML Engineer · Full Stack Developer · Cloud Enthusiast';
      nameRole.style.animation = 'roleReveal 0.7s 0s ease forwards';
    }, charIdx * 55 + 100);
  }, 2100);

  /* ════════════════════════
     STAGE 3: WELCOME HR
  ════════════════════════ */
  setTimeout(() => {
    showStage(stageWelc);
  }, 4200);

  /* ════════════════════════
     BURST + EXIT
  ════════════════════════ */
  setTimeout(() => {
    fireBurst();
    setTimeout(hideIntro, 500);
  }, 5700);

})();

/* ══════════════════════════════════════════════════════════════
   2. AOS INIT
══════════════════════════════════════════════════════════════ */
function initAOS() {
  AOS.init({
    duration: 700,
    easing:   'cubic-bezier(0.4, 0, 0.2, 1)',
    once:     true,
    offset:   60
  });
}

/* ══════════════════════════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  let rx = 0, ry = 0, dx = 0, dy = 0;

  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    dot.style.left = dx + 'px';
    dot.style.top  = dy + 'px';
  });

  (function animateRing() {
    rx = lerp(rx, dx, 0.14);
    ry = lerp(ry, dy, 0.14);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  const hoverEls = 'a, button, [data-tilt], .skill-card, .cert-card, .project-card';
  document.addEventListener('mouseover', e => { if (e.target.closest(hoverEls)) document.body.classList.add('hovering'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(hoverEls)) document.body.classList.remove('hovering'); });
})();

/* ══════════════════════════════════════════════════════════════
   4. MOUSE GLOW
══════════════════════════════════════════════════════════════ */
(function initMouseGlow() {
  const glow = document.createElement('div');
  glow.className = 'mouse-glow';
  document.body.appendChild(glow);
  let gx = 0, gy = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function anim() {
    gx = lerp(gx, tx, 0.06);
    gy = lerp(gy, ty, 0.06);
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(anim);
  })();
})();

/* ══════════════════════════════════════════════════════════════
   5. SCROLL PROGRESS + NAV
══════════════════════════════════════════════════════════════ */
(function initScrollEffects() {
  const progress = $('#scrollProgress');
  const nav      = $('#nav');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = ((window.scrollY / total) * 100) + '%';
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════
   6. HAMBURGER MENU
══════════════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const btn  = $('#hamburger');
  const menu = $('#mobileMenu');
  let open   = false;

  function toggle() {
    open = !open;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    const [s1, s2, s3] = btn.querySelectorAll('span');
    if (open) {
      s1.style.transform = 'translateY(6.5px) rotate(45deg)';
      s2.style.opacity   = '0';
      s3.style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      [s1, s2, s3].forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  }

  btn.addEventListener('click', toggle);
  $$('.mobile-link').forEach(l => l.addEventListener('click', () => { if (open) toggle(); }));
})();

/* ══════════════════════════════════════════════════════════════
   7. NEURAL NETWORK CANVAS (HERO)
══════════════════════════════════════════════════════════════ */
(function initNeuralCanvas() {
  const canvas = $('#neuralCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, nodes, mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createNodes(count) {
    return Array.from({ length: count }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.5,
      vy:    (Math.random() - 0.5) * 0.5,
      r:     Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.3
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const N = nodes.length;
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        n.vx += dx/dist*0.3; n.vy += dy/dist*0.3;
        const speed = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
        if (speed > 2) { n.vx /= speed*0.6; n.vy /= speed*0.6; }
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = i+1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 140) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${(1-d/140)*0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(45,156,255,${n.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  nodes = createNodes(70);
  draw();
  window.addEventListener('resize', () => { resize(); nodes = createNodes(70); });
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
})();

/* ══════════════════════════════════════════════════════════════
   8. TYPEWRITER
══════════════════════════════════════════════════════════════ */
(function initTypewriter() {
  const el      = $('#typewriterText');
  const strings = [
    'Machine Learning Engineer',
    'Python Developer',
    'AI/ML Engineer',
    'Full Stack Developer',
    'Cloud Enthusiast',
  ];
  let si = 0, ci = 0, deleting = false, waiting = false;

  function type() {
    const current = strings[si];
    if (waiting) { setTimeout(type, 1800); waiting = false; return; }
    if (!deleting) {
      el.textContent = current.slice(0, ci + 1);
      ci++;
      if (ci === current.length) { waiting = true; deleting = true; }
      setTimeout(type, 70);
    } else {
      el.textContent = current.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; si = (si + 1) % strings.length; }
      setTimeout(type, 38);
    }
  }
  setTimeout(type, 1800);
})();

/* ══════════════════════════════════════════════════════════════
   9. FLOATING HERO PARTICLES
══════════════════════════════════════════════════════════════ */
(function initHeroParticles() {
  const container = $('#floatParticles');
  if (!container) return;
  const colors = ['rgba(0,229,255,', 'rgba(45,156,255,', 'rgba(168,85,247,'];

  function spawnParticle() {
    const p   = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const col  = colors[Math.floor(Math.random() * colors.length)];
    const dur  = Math.random() * 12 + 8;
    const del  = Math.random() * 4;
    p.className = 'float-particle';
    p.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;background:${col}${Math.random()*0.5+0.2});box-shadow:0 0 ${size*3}px ${col}0.4);animation-duration:${dur}s;animation-delay:${del}s;`;
    container.appendChild(p);
    setTimeout(() => p.remove(), (dur + del) * 1000);
  }

  setInterval(spawnParticle, 600);
  for (let i = 0; i < 8; i++) spawnParticle();
})();

/* ══════════════════════════════════════════════════════════════
   10. STATS COUNTER
══════════════════════════════════════════════════════════════ */
(function initCounters() {
  const items = $$('.stat-num');
  let done = false;

  function runCounters() {
    if (done) return;
    const statsSection = $('#stats');
    if (!statsSection) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      done = true;
      items.forEach(el => {
        const target = parseInt(el.dataset.target || 0);
        let current  = 0;
        const step   = target / 40;
        const interval = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          el.textContent = Math.floor(current);
        }, 40);
      });
    }
  }
  window.addEventListener('scroll', runCounters, { passive: true });
  setTimeout(runCounters, 2000);
})();

/* ══════════════════════════════════════════════════════════════
   11. SKILLS TABS
══════════════════════════════════════════════════════════════ */
(function initSkillsTabs() {
  const tabs   = $$('.stab');
  const panels = $$('.skills-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = $(`#tab-${tab.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   12. 3D TILT EFFECT
══════════════════════════════════════════════════════════════ */
(function initTilt() {
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top  + rect.height/2;
      const dx = (e.clientX - cx) / (rect.width/2);
      const dy = (e.clientY - cy) / (rect.height/2);
      card.style.transform = `perspective(1000px) rotateX(${-dy*6}deg) rotateY(${dx*6}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ══════════════════════════════════════════════════════════════
   13. GITHUB API
══════════════════════════════════════════════════════════════ */
(function initGitHubRepos() {
  const grid     = $('#reposGrid');
  const username = 'aayush321-pingi';

  async function fetchRepos() {
    try {
      const res  = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
      if (!res.ok) throw new Error('API error');
      const repos = await res.json();
      grid.innerHTML = '';
      if (!repos.length) { grid.innerHTML = '<div class="repo-loading">No public repositories found.</div>'; return; }
      repos.forEach(repo => {
        const card = document.createElement('a');
        card.href   = repo.html_url;
        card.target = '_blank';
        card.className = 'repo-card';
        card.innerHTML = `
          <div class="repo-name">${escapeHtml(repo.name)}</div>
          <div class="repo-desc">${escapeHtml(repo.description || 'No description provided.')}</div>
          <div class="repo-meta">
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
            ${repo.language ? `<span>● ${escapeHtml(repo.language)}</span>` : ''}
          </div>`;
        grid.appendChild(card);
      });
    } catch (err) {
      grid.innerHTML = `<div class="repo-loading">Could not load repositories — <a href="https://github.com/${username}" target="_blank" style="color:var(--cyan)">view on GitHub</a></div>`;
    }
  }
  fetchRepos();
})();

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════════════════════════
   14. CHATBOT
══════════════════════════════════════════════════════════════ */
(function initChatbot() {
  const fab   = $('#chatbotFab');
  const panel = $('#chatbotPanel');
  const close = $('#chatClose');
  const input = $('#chatInput');
  const send  = $('#chatSend');
  const msgs  = $('#chatMessages');
  const suggs = $$('.sugg-btn');

  const KB = {
    skills: `Aayush is proficient in Python, C, Java, SQL, Machine Learning, Deep Learning, NLP, Generative AI, TensorFlow, PyTorch, React, Node.js, Flask, and AWS (EC2/S3/IAM). His strongest areas are Python and AI/ML frameworks.`,
    projects: `Aayush has built 3 major projects:\n1. 🤖 AI HR ATS Manager — LLM-powered resume parsing & candidate ranking\n2. 🔊 Jarvis X — AI Voice Assistant with NLP & automation\n3. 🛡️ Fraud Detection System — LSTM + GNN with Kafka & FastAPI`,
    experience: `Aayush has interned at:\n• Maxgen Technologies — AWS cloud deployment (EC2, S3, IAM)\n• Internshala — Full-stack development & authentication systems`,
    contact: `📧 aayushmaheshwari321@gmail.com\n📱 +91-7023092083\n💻 github.com/aayush321-pingi\n🔗 linkedin.com/in/aayush-maheshwari-261173306`,
    education: `Aayush is pursuing B.Tech in CSE with AI/ML specialization, maintaining an outstanding CGPA of 8.9 / 10.`,
    certifications: `Aayush holds certifications from IBM (Watsonx), Microsoft (Power BI), Google (Data Analytics), Cisco (Generative AI), AWS (Cloud Foundations), and IIT Bombay Techfest.`,
    default: `I can tell you about Aayush's skills, projects, experience, education, or certifications. What would you like to know?`
  };

  function matchAnswer(q) {
    q = q.toLowerCase();
    if (/skill|tech|language|framework|stack|python|ml|ai/.test(q)) return KB.skills;
    if (/project|build|jarvis|fraud|ats|hr/.test(q)) return KB.projects;
    if (/experience|work|intern|job|maxgen|internshala/.test(q)) return KB.experience;
    if (/contact|email|phone|reach|hire/.test(q)) return KB.contact;
    if (/education|cgpa|degree|btech|college/.test(q)) return KB.education;
    if (/cert|certif|ibm|google|aws|cisco|microsoft/.test(q)) return KB.certifications;
    return KB.default;
  }

  function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.innerHTML = `<span>${text.replace(/\n/g, '<br>')}</span>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function handleSend(q) {
    if (!q.trim()) return;
    appendMsg(q, 'user');
    input.value = '';
    setTimeout(() => appendMsg(matchAnswer(q), 'bot'), 600);
  }

  fab.addEventListener('click', () => panel.classList.toggle('open'));
  close.addEventListener('click', () => panel.classList.remove('open'));
  send.addEventListener('click', () => handleSend(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(input.value); });
  suggs.forEach(s => s.addEventListener('click', () => handleSend(s.dataset.q)));
  document.addEventListener('click', e => { if (!panel.contains(e.target) && !fab.contains(e.target)) panel.classList.remove('open'); });
})();

/* ══════════════════════════════════════════════════════════════
   15. CONTACT FORM
══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.innerHTML = '<span>Sending...</span>';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
    setTimeout(() => {
      form.reset();
      success.classList.add('show');
      btn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1500);
  });
})();

/* ══════════════════════════════════════════════════════════════
   16. SMOOTH SCROLL
══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   17. TIMELINE ANIMATION
══════════════════════════════════════════════════════════════ */
(function initTimelineObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $$('.timeline-item').forEach(item => {
    const isLeft = item.classList.contains('left');
    item.style.cssText = `opacity:0; transform:translateX(${isLeft ? '-30px' : '30px'}); transition: opacity 0.7s ease, transform 0.7s ease;`;
    observer.observe(item);
  });
})();

console.log('%c[ AM ] Portfolio loaded — Neural systems online.', 'color:#00e5ff; font-family:monospace; font-size:13px;');