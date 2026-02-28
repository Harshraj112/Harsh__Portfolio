/**
 * space-engine.js — Cinematic Space Portfolio Engine
 * Pure JS + Canvas (no libraries)
 * Handles: Starfield, Custom Cursor, Click Explosions, Scroll Reveal
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────
     SHARED CANVAS SETUP
  ───────────────────────────────────────────── */
  const starCanvas = document.getElementById("space-canvas");
  const cursorCanvas = document.getElementById("cursor-canvas");
  const starCtx = starCanvas.getContext("2d");
  const cursorCtx = cursorCanvas.getContext("2d");

  function resizeCanvases() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
    buildStars();
  }

  window.addEventListener("resize", resizeCanvases);

  /* ─────────────────────────────────────────────
     STARFIELD
  ───────────────────────────────────────────── */
  const STAR_LAYERS = [
    { count: 220, minR: 0.3, maxR: 0.8, speed: 0.08, alpha: 0.45 }, // distant
    { count: 130, minR: 0.8, maxR: 1.5, speed: 0.18, alpha: 0.65 }, // mid
    { count: 60, minR: 1.5, maxR: 2.8, speed: 0.35, alpha: 0.9 }, // close
  ];

  let stars = [];

  function buildStars() {
    stars = [];
    STAR_LAYERS.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const ox = Math.random() * starCanvas.width;
        const oy = Math.random() * starCanvas.height;
        stars.push({
          x: ox, y: oy,
          ox, oy,           // home position
          vx: 0, vy: 0,    // repulsion velocity
          r: layer.minR + Math.random() * (layer.maxR - layer.minR),
          speed: layer.speed,
          baseAlpha: layer.alpha,
          alpha: layer.alpha,
          twinkleOffset: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.005 + Math.random() * 0.015,
        });
      }
    });
  }

  /* Shooting stars */
  let shootingStars = [];
  let nextShoot = Date.now() + randBetween(1000, 2500);

  function spawnShootingStar() {
    const startX = Math.random() * starCanvas.width * 0.7;
    const startY = Math.random() * starCanvas.height * 0.3;
    shootingStars.push({
      x: startX,
      y: startY,
      len: 180 + Math.random() * 140,
      speed: 9 + Math.random() * 7,
      alpha: 1,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      trail: [],
    });
  }

  function drawStarField(ts) {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

    /* Stars */
    const REPEL_RADIUS = 110;
    const REPEL_STRENGTH = 2.8;
    const SPRING = 0.06;
    const DAMPING = 0.82;

    stars.forEach((s) => {
      // ── Repulsion from cursor ──────────────────────
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      if (dist < REPEL_RADIUS) {
        const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
      }

      // ── Spring back to home (+ natural drift) ─────
      s.vx += (s.ox - s.x) * SPRING;
      s.vy += (s.oy - s.y) * SPRING;
      s.vx *= DAMPING;
      s.vy *= DAMPING;

      s.x += s.vx;
      s.y += s.vy;

      // Drift home downward naturally
      s.oy += s.speed;
      if (s.oy > starCanvas.height) {
        s.oy = 0;
        s.ox = Math.random() * starCanvas.width;
        s.x = s.ox;
        s.y = s.oy;
        s.vx = 0; s.vy = 0;
      }

      // ── Twinkle ───────────────────────────────────
      const nearGlow = dist < REPEL_RADIUS ? (1 - dist / REPEL_RADIUS) * 0.4 : 0;
      s.alpha = s.baseAlpha + 0.35 * Math.sin(ts * s.twinkleSpeed + s.twinkleOffset) + nearGlow;
      s.alpha = Math.max(0.05, Math.min(1, s.alpha));

      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starCtx.fillStyle = `rgba(232,244,255,${s.alpha})`;
      starCtx.fill();
    });

    /* Shooting stars */
    if (Date.now() >= nextShoot) {
      spawnShootingStar();
      if (Math.random() > 0.5) spawnShootingStar(); // occasional double burst
      nextShoot = Date.now() + randBetween(1000, 2500);
    }

    shootingStars = shootingStars.filter((ss) => ss.alpha > 0.02);
    shootingStars.forEach((ss) => {
      const dx = Math.cos(ss.angle) * ss.speed;
      const dy = Math.sin(ss.angle) * ss.speed;
      ss.x += dx;
      ss.y += dy;
      ss.alpha -= 0.018;

      const tailX = ss.x - Math.cos(ss.angle) * ss.len;
      const tailY = ss.y - Math.sin(ss.angle) * ss.len;

      const grad = starCtx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(1, `rgba(200,240,255,${ss.alpha})`);

      starCtx.beginPath();
      starCtx.moveTo(tailX, tailY);
      starCtx.lineTo(ss.x, ss.y);
      starCtx.strokeStyle = grad;
      starCtx.lineWidth = 1.8;
      starCtx.stroke();
    });
  }

  /* ─────────────────────────────────────────────
     CUSTOM SPACESHIP CURSOR
  ───────────────────────────────────────────── */
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let prevMouse = { x: mouse.x, y: mouse.y };
  let shipAngle = -Math.PI / 2; // pointing up
  let trailParticles = [];

  document.addEventListener("mousemove", (e) => {
    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Emit trail particles on move
    const dx = mouse.x - prevMouse.x;
    const dy = mouse.y - prevMouse.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed > 1) {
      trailParticles.push({
        x: mouse.x - dx * 0.5,
        y: mouse.y - dy * 0.5,
        r: 2 + Math.random() * 2,
        alpha: 0.6,
        vx: -dx * 0.04 + (Math.random() - 0.5) * 1.5,
        vy: -dy * 0.04 + (Math.random() - 0.5) * 1.5,
      });
    }

    // Tilt ship based on velocity
    if (speed > 2) {
      const targetAngle = Math.atan2(dy, dx) - Math.PI / 2;
      shipAngle += (targetAngle - shipAngle) * 0.1;
    }
  });

  function drawShip(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    // Engine glow
    const glow = ctx.createRadialGradient(0, 8, 0, 0, 8, 22);
    glow.addColorStop(0, "rgba(0,180,255,0.45)");
    glow.addColorStop(1, "rgba(0,180,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, 8, 14, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ship body
    ctx.beginPath();
    ctx.moveTo(0, -16); // nose
    ctx.lineTo(7, 8); // right base
    ctx.lineTo(0, 4); // center notch
    ctx.lineTo(-7, 8); // left base
    ctx.closePath();
    ctx.fillStyle = "#e8f4ff";
    ctx.fill();

    // Wing accents
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(11, 10);
    ctx.lineTo(7, 8);
    ctx.closePath();
    ctx.fillStyle = "#00f5ff";
    ctx.globalAlpha = 0.6;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-11, 10);
    ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fillStyle = "#7b2fff";
    ctx.globalAlpha = 0.6;
    ctx.fill();

    ctx.globalAlpha = 1;

    // Cockpit dot
    ctx.beginPath();
    ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#00f5ff";
    ctx.fill();

    ctx.restore();
  }

  function drawCursorLayer(ts) {
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // Trail particles
    trailParticles = trailParticles.filter((p) => p.alpha > 0.02);
    trailParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.045;
      p.r *= 0.96;
      cursorCtx.beginPath();
      cursorCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cursorCtx.fillStyle = `rgba(0,200,255,${p.alpha})`;
      cursorCtx.fill();
    });

    // Explosion particles (drawn here too)
    drawExplosionParticles(cursorCtx);

    // Ship
    drawShip(cursorCtx, mouse.x, mouse.y, shipAngle);
  }

  /* ─────────────────────────────────────────────
     CLICK EXPLOSIONS
  ───────────────────────────────────────────── */
  let explosions = [];

  document.addEventListener("click", (e) => {
    createExplosion(e.clientX, e.clientY);
  });

  function createExplosion(cx, cy) {
    const exp = {
      cx,
      cy,
      flash: { r: 0, alpha: 1 },
      particles: [],
      rings: [],
      embers: [],
      done: false,
    };

    // Phase 2 — shrapnel
    const shrapCount = 22 + Math.floor(Math.random() * 12);
    const colors = ["#ff6b35", "#ffcc00", "#ff3333", "#ffffff", "#ff9900"];
    for (let i = 0; i < shrapCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2.5 + Math.random() * 6;
      exp.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r: 1.5 + Math.random() * 3,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        drag: 0.96,
        gravity: 0.12,
      });
    }

    // Phase 3 — smoke rings
    for (let i = 0; i < 3; i++) {
      exp.rings.push({ r: 8 + i * 6, alpha: 0.5 - i * 0.1, maxR: 80 + i * 30 });
    }

    // Phase 4 — embers
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      exp.embers.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * (0.6 + Math.random() * 1.2),
        vy: Math.sin(angle) * (0.6 + Math.random() * 1.2) - 1,
        r: 1.5 + Math.random() * 2,
        alpha: 0.9,
        color: Math.random() > 0.5 ? "#ff6b35" : "#ffcc00",
        gravity: 0.04,
      });
    }

    explosions.push(exp);
  }

  function drawExplosionParticles(ctx) {
    explosions.forEach((exp) => {
      // Phase 1 — flash
      if (exp.flash.alpha > 0) {
        exp.flash.r += 6;
        exp.flash.alpha -= 0.07;
        const g = ctx.createRadialGradient(
          exp.cx,
          exp.cy,
          0,
          exp.cx,
          exp.cy,
          exp.flash.r,
        );
        g.addColorStop(0, `rgba(255,255,220,${exp.flash.alpha})`);
        g.addColorStop(0.5, `rgba(255,140,0,${exp.flash.alpha * 0.5})`);
        g.addColorStop(1, `rgba(255,80,0,0)`);
        ctx.beginPath();
        ctx.arc(exp.cx, exp.cy, exp.flash.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Phase 2 — particles
      exp.particles = exp.particles.filter((p) => p.alpha > 0.03);
      exp.particles.forEach((p) => {
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color
          .replace(")", `,${p.alpha})`)
          .replace("rgb", "rgba")
          .replace("#", "rgba(")
          .split("rgba(")[1]
          ? p.color
          : p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Phase 3 — rings
      exp.rings = exp.rings.filter((rng) => rng.alpha > 0.01);
      exp.rings.forEach((rng) => {
        rng.r += 2.5;
        rng.alpha -= 0.012;
        ctx.beginPath();
        ctx.arc(exp.cx, exp.cy, rng.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(160,100,60,${rng.alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Phase 4 — embers
      exp.embers = exp.embers.filter((em) => em.alpha > 0.02);
      exp.embers.forEach((em) => {
        em.vy += em.gravity;
        em.x += em.vx;
        em.y += em.vy;
        em.alpha -= 0.008;
        ctx.beginPath();
        ctx.arc(em.x, em.y, em.r, 0, Math.PI * 2);
        ctx.fillStyle = em.color;
        ctx.globalAlpha = em.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Mark done when all phases spent
      exp.done =
        exp.flash.alpha <= 0 &&
        exp.particles.length === 0 &&
        exp.rings.length === 0 &&
        exp.embers.length === 0;
    });

    explosions = explosions.filter((e) => !e.done);
  }

  /* ─────────────────────────────────────────────
     SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────────── */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px -10px 0px" },
    );

    revealEls.forEach((el) => {
      // Immediately show anything already in the viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("reveal-active");
      } else {
        obs.observe(el);
      }
    });
  }

  /* ─────────────────────────────────────────────
     MAIN ANIMATION LOOP
  ───────────────────────────────────────────── */
  function animate(ts) {
    drawStarField(ts);
    drawCursorLayer(ts);
    requestAnimationFrame(animate);
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    resizeCanvases();
    initScrollReveal();
    requestAnimationFrame(animate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ─────────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────────── */
  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }
})();
