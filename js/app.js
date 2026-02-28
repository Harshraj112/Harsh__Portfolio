// const sectionHeroEl = document.querySelector(".section-hero");

// const obs = new IntersectionObserver(function(entries){
//     const ent = entries[0];
//     if(ent.isIntersecting === false) {
//         document.body.classList.add("sticky");
//     }
//     if(ent.isIntersecting === true) {
//         document.body.classList.remove("sticky");
//     }
// }, {
//     //In the viewport
//     root: null,
//     threshold: 0,
//     rootMargin: '-80px'
// });
// obs.observe(sectionHeroEl);

function usrScroll() {
    const navbar1 = document.querySelector('.header');
    const logos = document.querySelectorAll('.main-nav-link:link'); // select all matching elements

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar1.classList.add('bg-dark');
            // navbar.classList.add('sticky');
            logos.forEach(logo => logo.classList.add('logo-colour')); // apply to each
        } else {
            navbar1.classList.remove('bg-dark');
            // navbar.classList.remove('sticky');
            logos.forEach(logo => logo.classList.remove('logo-colour'));
        }
    });
}

document.addEventListener('DOMContentLoaded', usrScroll);


// STICK navigator

// const sectionHeroEl = document.querySelector(".hero");

// const obs = new IntersectionObserver(function(entries){
//     const ent = entries[0];
//     if(ent.isIntersecting === false) {
//         document.body.classList.add("sticki");
//         // document.body.classList.remove("sticky");
//     }
//     if(ent.isIntersecting === true) {
//         document.body.classList.remove("sticki");
//         // document.body.classList.add("sticky");
//     }
// }, {
//     //In the viewport
//     root: null,
//     threshold: 0,
//     rootMargin: '-80px'
// });
// obs.observe(sectionHeroEl);

/* ═══════════════════════════════════════════════════════
   HAMBURGER MENU
   CSS scroll-behavior:smooth + scroll-margin-top handles
   all scrolling — JS only manages the mobile menu.
   ═══════════════════════════════════════════════════════ */
(function () {
  var btnNav  = document.querySelector('.btn-mobile-nav');
  var header  = document.querySelector('.header');
  var mainNav = document.querySelector('.main-nav');

  /* ── Hamburger toggle ── */
  if (btnNav && header) {
    btnNav.addEventListener('click', function (e) {
      e.stopPropagation();
      header.classList.toggle('nav-open');
    });
  }

  /* ── Close mobile menu when any nav link is clicked ── */
  var navLinks = document.querySelectorAll('.main-nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (header) header.classList.remove('nav-open');
    });
  });

  /* ── Close on outside tap ── */
  document.addEventListener('click', function (e) {
    if (!header || !header.classList.contains('nav-open')) return;
    if (mainNav && mainNav.contains(e.target)) return;
    if (btnNav && btnNav.contains(e.target)) return;
    header.classList.remove('nav-open');
  });

  /* ── Close on Escape ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header && header.classList.contains('nav-open')) {
      header.classList.remove('nav-open');
    }
  });
})();



  const sections = document.querySelectorAll("section[id], div[id]");
  const navLinks = document.querySelectorAll(".main-nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").substring(1) === entry.target.id) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    {
      threshold: 0.25, // Lowered so tall sections (Achievements etc.) still trigger active state
    }
  );

  sections.forEach((section) => observer.observe(section));

// ── 3D TILT ON CONTACT FORM ───────────────────────────────
(function () {
  const card = document.querySelector('.contact-form');
  if (!card) return;

  const MAX_TILT = 14;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    const rotX  = (-y * MAX_TILT).toFixed(2);
    const rotY  = ( x * MAX_TILT).toFixed(2);
    const glow  = Math.abs(x) + Math.abs(y);

    card.style.transform =
      `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
    card.style.boxShadow =
      `0 0 ${32 + glow * 40}px rgba(0,245,255,${0.12 + glow * 0.25}), ` +
      `0 ${12 + glow * 10}px 40px rgba(0,0,0,0.6)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    card.style.boxShadow = '0 0 32px rgba(0,245,255,0.1)';
  });
})();
