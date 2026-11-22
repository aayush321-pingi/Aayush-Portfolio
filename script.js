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
        const segLen = (len / 4) * (0.78 + seg * 0.04);
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
    [stageBoot, stageName].forEach(s => s.classList.remove('active'));
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
    name.split(' ').forEach((word, wordIndex) => {
      const line = document.createElement('span');
      line.className = 'name-word';
      nameLetters.appendChild(line);
      word.split('').forEach(ch => {
        setTimeout(() => {
          const span = document.createElement('span');
          span.className = wordIndex === 1 ? 'name-char accent' : 'name-char';
          span.textContent = ch;
          line.appendChild(span);
        }, charIdx * 55);
        charIdx++;
      });
    });
    setTimeout(() => {
      nameRole.textContent = 'AI/ML Engineer · Full Stack Developer · Cloud Enthusiast';
      nameRole.style.animation = 'roleReveal 0.7s 0s ease forwards';
    }, charIdx * 55 + 100);
  }, 2100);

  /* ════════════════════════
     BURST + EXIT AFTER NAME REVEAL
  ════════════════════════ */
  setTimeout(() => {
    fireBurst();
    setTimeout(hideIntro, 500);
  }, 4700);

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

  /* ══════════════════════════════════════════════════════════════
     LIQUID TOUCH FEEDBACK
  ══════════════════════════════════════════════════════════════ */
  (function initLiquidTouch() {
    const targets = $$('.nav-links a, .mobile-link, .btn-primary, .btn-resume, .social-icon, .proj-btn, .form-submit');

    targets.forEach(target => {
      target.classList.add('liquid-touch');

      target.addEventListener('pointerdown', e => {
        target.classList.add('is-pressed');

        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'liquid-ripple';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        target.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      });

      target.addEventListener('pointerup', () => target.classList.remove('is-pressed'));
      target.addEventListener('pointerleave', () => target.classList.remove('is-pressed'));
      target.addEventListener('pointercancel', () => target.classList.remove('is-pressed'));
    });
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
  const hero = $('#hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, nodes;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createNodes(count) {
    return Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      r: Math.random() * 1.6 + 0.8,
      alpha: Math.random() * 0.4 + 0.24
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const N = nodes.length;
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      if (!reducedMotion) {
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.995;
        n.vy *= 0.995;
      }
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (!reducedMotion && dist > 0 && dist < 190) {
        const force = (1 - dist / 190) * 0.055;
        n.vx += dx / dist * force;
        n.vy += dy / dist * force;
        const speed = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
        if (speed > 1.4) { n.vx = n.vx / speed * 1.4; n.vy = n.vy / speed * 1.4; }
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = i+1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 150) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(76,220,255,${(1-d/150)*0.2})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const proximity = Math.max(0, 1 - Math.sqrt(dx*dx + dy*dy) / 190);
      ctx.fillStyle = `rgba(120,235,255,${n.alpha + proximity * 0.52})`;
      ctx.shadowBlur = proximity * 12;
      ctx.shadowColor = 'rgba(0,229,255,0.8)';
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (mouse.x >= 0 && mouse.x <= W && mouse.y >= 0 && mouse.y <= H) {
      const pulse = 18 + Math.sin(performance.now() / 360) * 4;
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 72);
      glow.addColorStop(0, 'rgba(0,229,255,0.13)');
      glow.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(114,240,255,0.48)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (!reducedMotion) requestAnimationFrame(draw);
  }

  resize();
  nodes = createNodes(clamp(Math.floor(W * H / 12000), 50, 110));
  draw();
  window.addEventListener('resize', () => {
    resize();
    nodes = createNodes(clamp(Math.floor(W * H / 12000), 50, 110));
    if (reducedMotion) draw();
  });
  hero.addEventListener('pointermove', event => {
    if (reducedMotion || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    const tiltX = (0.5 - y) * 5;
    const tiltY = (x - 0.5) * 8;
    hero.style.setProperty('--hero-portrait-shift-x', `${tiltY * 0.55}px`);
    hero.style.setProperty('--hero-portrait-rotate-x', `${tiltX * 0.38}deg`);
    hero.style.setProperty('--hero-portrait-rotate-y', `${tiltY * -0.5}deg`);
    hero.style.setProperty('--hero-title-rotate', `${tiltY * -0.08}deg`);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    mouse = { x: -9999, y: -9999 };
    [
      '--hero-portrait-rotate-x',
      '--hero-portrait-rotate-y',
      '--hero-title-rotate'
    ].forEach(property => hero.style.setProperty(property, '0deg'));
    hero.style.setProperty('--hero-portrait-shift-x', '0px');
  });
  function updateHeroScroll() {
    const progress = clamp(-hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1), 0, 1);
    hero.style.setProperty('--hero-scroll', progress);
    hero.style.setProperty('--hero-portrait-shift-y', `${progress * 48}px`);
    hero.style.setProperty('--hero-content-shift-y', `${progress * -24}px`);
  }
  window.addEventListener('scroll', updateHeroScroll, { passive: true });
  updateHeroScroll();
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

(function initSkillConnections() {
  const section = $('#skills');
  if (!section) return;

  const tabs = $$('.stab', section);
  const panels = $$('.skills-panel', section);
  const svgNS = 'http://www.w3.org/2000/svg';
  let frame = null;

  function drawNetwork(panel) {
    const grid = $('.skills-grid', panel);
    if (!grid) return;

    let svg = $('.skill-network', grid);
    if (!svg) {
      svg = document.createElementNS(svgNS, 'svg');
      svg.classList.add('skill-network');
      svg.setAttribute('aria-hidden', 'true');
      grid.prepend(svg);
    }

    const width = grid.clientWidth;
    const height = grid.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.replaceChildren();

    const cards = $$('.skill-card', grid);
    if (cards.length < 2 || !width || !height) return;

    const points = cards.map(card => ({
      x: card.offsetLeft + card.offsetWidth / 2,
      y: card.offsetTop + card.offsetHeight / 2,
      halfWidth: card.offsetWidth / 2,
      halfHeight: card.offsetHeight / 2
    }));
    const connected = new Set([0]);
    const edges = [];

    while (connected.size < points.length) {
      let nearest = null;
      let nearestDistance = Infinity;
      connected.forEach(from => {
        points.forEach((point, to) => {
          if (connected.has(to)) return;
          const dx = points[from].x - point.x;
          const dy = points[from].y - point.y;
          const distance = dx * dx + dy * dy;
          if (distance < nearestDistance) {
            nearest = [from, to];
            nearestDistance = distance;
          }
        });
      });
      if (!nearest) break;
      edges.push(nearest);
      connected.add(nearest[1]);
    }

    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    const gradientId = `skill-network-${panel.id}`;
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    [['0%', '#00e5ff'], ['52%', '#2d9cff'], ['100%', '#a855f7']].forEach(([offset, color], index) => {
      const stop = document.createElementNS(svgNS, 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      stop.setAttribute('stop-opacity', index === 1 ? '0.42' : '0.78');
      gradient.appendChild(stop);
    });
    defs.appendChild(gradient);
    svg.appendChild(defs);

    edges.forEach(([from, to], index) => {
      const start = points[from];
      const end = points[to];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const startScale = Math.min(dx === 0 ? Infinity : start.halfWidth / Math.abs(dx), dy === 0 ? Infinity : start.halfHeight / Math.abs(dy));
      const endScale = Math.min(dx === 0 ? Infinity : end.halfWidth / Math.abs(dx), dy === 0 ? Infinity : end.halfHeight / Math.abs(dy));
      const startX = start.x + dx * startScale;
      const startY = start.y + dy * startScale;
      const endX = end.x - dx * endScale;
      const endY = end.y - dy * endScale;
      const edgeX = endX - startX;
      const edgeY = endY - startY;
      const length = Math.hypot(edgeX, edgeY) || 1;
      const bend = Math.min(24, length * 0.1) * (index % 2 ? -1 : 1);
      const controlX = (startX + endX) / 2 - (edgeY / length) * bend;
      const controlY = (startY + endY) / 2 + (edgeX / length) * bend;
      const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

      const glow = document.createElementNS(svgNS, 'path');
      glow.classList.add('skill-link-glow');
      glow.setAttribute('d', pathData);
      glow.setAttribute('stroke', `url(#${gradientId})`);
      svg.appendChild(glow);

      const flow = document.createElementNS(svgNS, 'path');
      flow.classList.add('skill-link');
      flow.setAttribute('d', pathData);
      flow.setAttribute('stroke', `url(#${gradientId})`);
      flow.style.animationDelay = `${-index * 0.35}s`;
      svg.appendChild(flow);
    });
  }

  function scheduleDraw() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = null;
        const activePanel = $('.skills-panel.active', section);
        if (activePanel) drawNetwork(activePanel);
      });
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', scheduleDraw));
  window.addEventListener('resize', scheduleDraw, { passive: true });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleDraw);
    panels.forEach(panel => {
      const grid = $('.skills-grid', panel);
      if (grid) observer.observe(grid);
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleDraw);
  scheduleDraw();
})();

/* ══════════════════════════════════════════════════════════════
   13. 3D TILT EFFECT
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
   14. FEATURED PROJECTS CAROUSEL
══════════════════════════════════════════════════════════════ */
(function initProjectCarousel() {
  const carousel = $('[data-project-carousel]');
  if (!carousel) return;

  const viewport = $('.project-carousel-window', carousel);
  const track = $('.project-carousel-track', carousel);
  const slides = $$('.project-slide', carousel);
  const dots = $$('.carousel-dot', carousel);
  const count = $('.carousel-count', carousel);
  if (!viewport || !track || !slides.length) return;

  let activeIndex = 0;
  let touchStartX = null;
  let pointerOver = false;
  let focusInside = false;
  let autoplayTimer = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setFlipped(card, flipped) {
    const inner = $('.project-card-inner', card);
    const front = $('.project-front', card);
    const back = $('.project-back', card);
    if (!inner || !front || !back) return;

    inner.classList.toggle('is-flipped', flipped);
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    front.inert = flipped;
    back.inert = !flipped;
    $$('.project-flip', card).forEach(button => button.setAttribute('aria-pressed', String(flipped)));
  }

  function updateCarousel() {
    const slide = slides[activeIndex];
    const offset = Math.max(0, slide.offsetLeft - (viewport.clientWidth - slide.clientWidth) / 2);
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;

    slides.forEach((item, index) => {
      const isActive = index === activeIndex;
      item.setAttribute('aria-hidden', String(!isActive));
      item.inert = !isActive;
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle('active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    if (count) count.innerHTML = `${String(activeIndex + 1).padStart(2, '0')} <span>/ ${String(slides.length).padStart(2, '0')}</span>`;
  }

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    updateCarousel();
    updateAutoplay();
  }

  function stopAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function updateAutoplay() {
    stopAutoplay();
    if (!reducedMotion && !pointerOver && !focusInside && !document.hidden) {
      autoplayTimer = window.setInterval(() => showSlide(activeIndex + 1), 10000);
    }
  }

  slides.forEach(slide => {
    const card = $('.project-card', slide);
    if (!card) return;
    setFlipped(card, false);

    let hoverTimer = null;
    card.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      card.classList.add('is-pointer-over');
      if (!reducedMotion && slide.getAttribute('aria-hidden') === 'false') {
        hoverTimer = window.setTimeout(() => {
          if (slide.getAttribute('aria-hidden') === 'false' && card.matches(':hover')) setFlipped(card, true);
        }, 2000);
      }
    });
    card.addEventListener('pointermove', event => {
      if (reducedMotion || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
      const rect = card.getBoundingClientRect();
      const pointerX = (event.clientX - rect.left) / rect.width;
      const pointerY = (event.clientY - rect.top) / rect.height;
      const x = pointerX - 0.5;
      const y = pointerY - 0.5;
      card.style.setProperty('--tilt-x', `${x * 8}deg`);
      card.style.setProperty('--tilt-y', `${-y * 8}deg`);
      card.style.setProperty('--pointer-x', `${pointerX * 100}%`);
      card.style.setProperty('--pointer-y', `${pointerY * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      window.clearTimeout(hoverTimer);
      card.classList.remove('is-pointer-over');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--pointer-x', '50%');
      card.style.setProperty('--pointer-y', '50%');
      setFlipped(card, false);
    });
  });

  carousel.addEventListener('click', event => {
    const flipButton = event.target.closest('.project-flip');
    if (flipButton) {
      const card = flipButton.closest('.project-card');
      if (card) setFlipped(card, !$('.project-card-inner', card).classList.contains('is-flipped'));
      return;
    }

    if (event.target.closest('[data-carousel-prev]')) showSlide(activeIndex - 1);
    if (event.target.closest('[data-carousel-next]')) showSlide(activeIndex + 1);

    const dot = event.target.closest('[data-carousel-slide]');
    if (dot) showSlide(Number(dot.dataset.carouselSlide));
  });

  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(activeIndex + 1);
    }
  });

  carousel.addEventListener('pointerenter', () => {
    pointerOver = true;
    updateAutoplay();
  });
  carousel.addEventListener('pointerleave', () => {
    pointerOver = false;
    updateAutoplay();
  });
  carousel.addEventListener('focusin', () => {
    focusInside = true;
    updateAutoplay();
  });
  carousel.addEventListener('focusout', event => {
    focusInside = carousel.contains(event.relatedTarget);
    updateAutoplay();
  });
  document.addEventListener('visibilitychange', updateAutoplay);
  window.addEventListener('resize', updateCarousel);

  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStartX = event.clientX;
  });
  viewport.addEventListener('pointerup', event => {
    if (touchStartX === null) return;
    const distance = event.clientX - touchStartX;
    if (Math.abs(distance) > 55) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    touchStartX = null;
  });
  viewport.addEventListener('pointercancel', () => { touchStartX = null; });

  updateCarousel();
  updateAutoplay();
})();

/* ══════════════════════════════════════════════════════════════
   15. GITHUB API
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
   16. CHATBOT
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
    projects: `Aayush's resume features 3 projects:\n1. AI HR ATS Manager — LLM-based PDF/DOCX parsing, semantic candidate ranking, and skill-gap analysis with Python, React, MySQL, and Flask.\n2. AI-Powered Micro-Transaction Fraud Detection System — LSTM + GNN, Kafka, Redis, FastAPI, and a Streamlit dashboard.\n3. AI Voice Sales Agent — BERT intent classification, spaCy entity extraction, TextBlob sentiment analysis, and call summaries with Python and PyTorch.`,
    experience: `Aayush's LinkedIn lists five roles:\n• Tech Contributor, GirlScript Summer of Code (AI Agents track), May 2026–Present\n• Tech Contributor, Nexus Spring of Code, Apr–Nov 2026\n• Data Analyst and Software Developer intern, Saltriver Info Systems, May–Aug 2026 — GPS fleet tracking for 400 vehicles, 15 alert types, Google Maps API, and computer-vision height estimation\n• Internship Trainee, Maxgen Technologies, Jun–Jul 2025 — deployed a PHP website on AWS using Linux\n• Project Intern, Internshala, Jun–Oct 2024 — website building and front-end development`,
    contact: `📧 aayushmaheshwari321@gmail.com\n📱 +91-7023092083\n💻 github.com/aayush321-pingi\n🔗 linkedin.com/in/aayush-maheshwari-261173306`,
    education: `Aayush is pursuing B.Tech in CSE with AI/ML specialization, maintaining an outstanding CGPA of 8.9 / 10.`,
    certifications: `Aayush's LinkedIn lists five certifications: Google Introduction to Generative AI (Oct 2026), Google Introduction to Large Language Models (May 2025), and three Anthropic Claude Academy certificates: Model Context Protocol: Advanced Topics, Claude Code in Action, and Claude Code 101 (all Oct 2026).`,
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
   17. CONTACT FORM
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
   18. SMOOTH SCROLL
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
   19. JOURNEY SCROLL PARALLAX
══════════════════════════════════════════════════════════════ */
(function initTimelineMotion() {
  const timeline = $('.timeline');
  if (!timeline) return;

  const line = $('.timeline-line', timeline);
  const items = $$('.timeline-item', timeline);
  if (!line || !items.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsPointerTilt = !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  items.forEach((item, index) => {
    item.style.setProperty('--journey-order', index);
    const card = $('.timeline-card', item);
    if (!card || !supportsPointerTilt) return;

    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const bounds = card.getBoundingClientRect();
      const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
      const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
      card.style.setProperty('--journey-pointer-x', `${(0.5 - y) * 10}deg`);
      card.style.setProperty('--journey-pointer-y', `${(x - 0.5) * 12}deg`);
      card.style.setProperty('--journey-spot-x', `${x * 100}%`);
      card.style.setProperty('--journey-spot-y', `${y * 100}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--journey-pointer-x', '0deg');
      card.style.setProperty('--journey-pointer-y', '0deg');
      card.style.setProperty('--journey-spot-x', '50%');
      card.style.setProperty('--journey-spot-y', '50%');
    });
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    timeline.classList.add('has-motion');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20% 0px' });
    items.forEach(item => revealObserver.observe(item));
  } else {
    items.forEach(item => item.classList.add('is-visible'));
  }

  let framePending = false;
  function updateScrollEffects() {
    framePending = false;
    const marker = window.innerHeight * 0.56;
    const lineRect = line.getBoundingClientRect();
    const progress = clamp((marker - lineRect.top) / Math.max(lineRect.height, 1), 0, 1);
    timeline.style.setProperty('--journey-progress', `${progress * 100}%`);

    let currentIndex = -1;
    let nearestDistance = window.innerHeight * 0.55;
    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const distanceFromMarker = rect.top + rect.height / 2 - marker;
      const distance = Math.abs(distanceFromMarker);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        currentIndex = index;
      }

      if (!reducedMotion) {
        const normalizedDistance = distanceFromMarker / Math.max(window.innerHeight, 1);
        item.style.setProperty('--journey-depth', `${clamp(-normalizedDistance * 16, -12, 12)}px`);
        item.style.setProperty('--journey-tilt', `${clamp(normalizedDistance * 2.8, -2, 2)}deg`);
      }
    });

    items.forEach((item, index) => item.classList.toggle('is-current', index === currentIndex));
  }

  function scheduleScrollEffects() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateScrollEffects);
  }

  window.addEventListener('scroll', scheduleScrollEffects, { passive: true });
  window.addEventListener('resize', scheduleScrollEffects, { passive: true });
  scheduleScrollEffects();
})();

console.log('%c[ AM ] Portfolio loaded — Neural systems online.', 'color:#00e5ff; font-family:monospace; font-size:13px;');