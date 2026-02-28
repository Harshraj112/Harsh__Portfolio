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

const btnNav = document.querySelector(".btn-mobile-nav");
const header = document.querySelector(".header");

const sticky1 = document.querySelector(".sticky");

btnNav.addEventListener("click", function () {
    document.sticky1.style.position = "relative";
})

btnNav.addEventListener("click", function () {
    header.classList.toggle("nav-open");
});

// Smooth navigator

document.addEventListener("DOMContentLoaded", function () {
  const allLinks = document.querySelectorAll("a:link");
  const header = document.querySelector(".header"); // make sure this is defined

  allLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const href = link.getAttribute("href");

      // Handle only internal links
      if (href && (href === "#" || href.startsWith("#"))) {
        e.preventDefault();

        // Scroll to top
        if (href === "#") {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else {
          const sectionEl = document.querySelector(href);
          if (sectionEl) {
            try {
              // Try smooth scroll using scrollIntoView
              sectionEl.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            } catch (err) {
              // Fallback for older browsers
              const top = sectionEl.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({ top, behavior: "smooth" });
            }
          }
        }

        // Close mobile nav if applicable
        if (link.classList.contains("main-nav-link") && header) {
          header.classList.toggle("nav-open");
        }
      }
    });
  });
});



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
