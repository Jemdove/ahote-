/* =========================================================
   This file is used by BOTH pages:
     • index.html  (main site)
     • crew.html   (crew members)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Sticky navbar — toggle scrolled state (main site) ---------- */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('is-scrolled');
      else                     nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  

  /* ---------- 2. Mobile menu toggle (main site) ---------- */
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // close the menu when a link is tapped
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (links.classList.contains('is-open')) {
          links.classList.remove('is-open');
          toggle.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });
  }

  /* ---------- 3. Scroll-reveal animations ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(el => io.observe(el));
  }

  /* ---------- 4. Auto-fill year in footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ---------- 6. Scroll-spy: highlight the nav link of the section in view ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a:not(.nav__cta)');
  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(
            `.nav__links a[href="#${entry.target.id}"]`
          );
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, {
      rootMargin: '-40% 0px -55% 0px', // triggers when section hits middle of viewport
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }
})();



/* =========================================================
   CREW PAGE (crew.html) — panel switching + pinned selector

   These three functions are GLOBAL on purpose: crew.html calls
   them straight from inline onclick / onsubmit attributes.
   ========================================================= */

/**
 * Open one crew member's panel, highlight their avatar, and pin the
 * crew selector to the top of the screen.
 *
 * Pinning (body.crew-active) is what lets you pick another crew member
 * without scrolling back up — the avatar row stays put while you scroll
 * through the content. The matching CSS lives in crew_styles.css
 * (base look) and mediaQuery.css (responsive sizing).
 */
function noJump(e, id) {
  if (e) e.preventDefault();

  // Hide every panel, then show only the clicked member's panel
  document.querySelectorAll('.crew-panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  // Move the active-crew highlight to the clicked avatar
  document.querySelectorAll('.things').forEach(a => a.classList.remove('active-crew'));
  if (e && e.currentTarget) e.currentTarget.classList.add('active-crew');

  // Pin the selector to the top so switching members needs no scroll-up
  document.body.classList.add('crew-active');

  // Smooth-scroll to the content. scroll-margin-top (set in CSS) keeps the
  // content clear of the now-pinned selector bar.
  const content = document.querySelector('.crew-content');
  if (content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * On load: open the panel named in the URL hash (e.g. crew.html#ama-modal),
 * or fall back to Jemima, and highlight the matching avatar.
 */
function initCrewPage() {
  // Bail out if this isn't the crew page
  if (!document.querySelector('.crew-panel')) return;

  const hash = window.location.hash.slice(1); // remove the '#'
  const targetId = hash && document.getElementById(hash) ? hash : 'jemima-modal';

  const panel = document.getElementById(targetId);
  if (panel) panel.classList.add('active');

  const activeLink = document.querySelector(`a.things[onclick*="${targetId}"]`);
  if (activeLink) activeLink.classList.add('active-crew');

  // If the visitor arrived via a direct link to a member, pin straight away
  if (hash && document.getElementById(hash)) {
    document.body.classList.add('crew-active');
  }

  // Slim the pinned hero once the page is scrolled down a little.
  // (The hero keeps its full initial size while at the top.)
  const SLIM_AFTER = 40; // px scrolled before the hero slims
  const onCrewScroll = () => {
    document.body.classList.toggle('crew-slim', window.scrollY > SLIM_AFTER);
  };
  window.addEventListener('scroll', onCrewScroll, { passive: true });
  onCrewScroll();
}

// Run init whether the script loads before or after the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCrewPage);
} else {
  initCrewPage();
}


/* ---------- Feedback form (crew.html) ---------- */
// Stop users picking a future service date (runs once when the page loads)
const serviceDateInput = document.getElementById('serviceDate');
if (serviceDateInput) {
  serviceDateInput.max = new Date().toISOString().split('T')[0];
}

function submitFeedback(e) {
  e.preventDefault();

  const name    = document.getElementById('clientName').value.trim();
  const date    = document.getElementById('serviceDate').value || 'Not specified';
  const service = document.getElementById('serviceType').value || 'Not specified';
  const rating  = document.querySelector('input[name="rating"]:checked')?.value || 'Not rated';
  const msg     = document.getElementById('message').value.trim();

  // Build the message one line at a time so each item sits in its own row
  const lines = [
    'Hello, new customer feedback:',
    '',
    `Name: ${name}`,
    `Service Date: ${date}`,
    `Service: ${service}`,
    `Rating: ${rating} stars`,
    '',
    'Message:',
    msg
  ];

  // Join with line breaks, then encode the whole thing once for the URL
  const wa = encodeURIComponent(lines.join('\n'));

  document.getElementById('successMsg').style.display = 'block';
  document.getElementById('feedbackForm').reset();

  window.open(`https://wa.me/233500155502?text=${wa}`, '_blank');
 
}
