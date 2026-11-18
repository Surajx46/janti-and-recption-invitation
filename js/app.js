/**
 * Sulav Rana & Mannu Shrestha - Royal Wedding Invitation
 * Core Application Controller
 */

window.currentLang = 'np';

function toNepaliDigits(num) {
  const nepaliNums = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).padStart(2, '0').replace(/\d/g, d => nepaliNums[d]);
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Petal Particle Engine
  window.petalEngine = new PetalParticleEngine('petals-canvas');

  // Setup Event Listeners
  initEnvelopeOpener();
  initCountdown();
  initLanguageSwitcher();
  initCalendarButtons();
  initRSVPForm();
  initShareFeatures();
  initQRCode();
  initNavControls();
  initFooterReveal();

  // Load Initial Wishes
  loadWishesWall();
});

/* ==========================================================================
   Scroll-Triggered Slow Water-Wave Reveal & Welcome Pop-up (Once Per Open)
   ========================================================================== */
function initFooterReveal() {
  const footer = document.getElementById('blessing-footer');
  if (!footer) return;

  const envelopeScreen = document.getElementById('envelope-screen');
  const welcomeModal = document.getElementById('welcome-popup-modal');
  const btnClose = document.getElementById('welcome-popup-close');
  const btnOk = document.getElementById('welcome-popup-ok');

  let revealed = false;
  let scheduled = false;
  let popupShown = false;
  let popupTimer = null;

  const showWelcomePopup = () => {
    if (popupShown || !welcomeModal) return;
    popupShown = true;
    welcomeModal.classList.add('active');
    welcomeModal.setAttribute('aria-hidden', 'false');
    if (typeof triggerCelebrationConfetti === 'function') {
      triggerCelebrationConfetti();
    }
  };

  const closeWelcomePopup = () => {
    if (!welcomeModal) return;
    welcomeModal.classList.remove('active');
    welcomeModal.setAttribute('aria-hidden', 'true');
  };

  if (btnClose) btnClose.addEventListener('click', closeWelcomePopup);
  if (btnOk) btnOk.addEventListener('click', closeWelcomePopup);
  if (welcomeModal) {
    welcomeModal.addEventListener('click', (e) => {
      if (e.target === welcomeModal) closeWelcomePopup();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWelcomePopup();
  });

  const openFooterWave = () => {
    if (revealed) return;
    revealed = true;
    footer.classList.add('revealed');

    // Display the welcome pop-up right after the slow water-wave animation completes
    popupTimer = setTimeout(() => {
      showWelcomePopup();
    }, 4200);
  };

  const scheduleReveal = () => {
    if (revealed || scheduled) return;
    scheduled = true;
    setTimeout(openFooterWave, 650);
  };

  // Allow clicking directly on the wave cover to open
  const overlay = footer.querySelector('.footer-wave-overlay');
  if (overlay) {
    overlay.addEventListener('click', openFooterWave);
  }

  const tryRevealIfVisible = () => {
    if (revealed || scheduled) return;
    const isEnvelopeOpen = !envelopeScreen || envelopeScreen.classList.contains('opened');
    if (!isEnvelopeOpen) return;

    const rect = footer.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visibleHeight >= Math.min(rect.height * 0.48, 125)) {
      scheduleReveal();
    }
  };

  let observer = null;
  const startObserving = () => {
    if (!('IntersectionObserver' in window)) return;
    if (observer) observer.disconnect();

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || revealed || scheduled) return;
        const isEnvelopeOpen = !envelopeScreen || envelopeScreen.classList.contains('opened');
        if (!isEnvelopeOpen) return;

        scheduleReveal();
        observer.unobserve(footer);
      });
    }, {
      threshold: 0.48
    });

    observer.observe(footer);
  };

  startObserving();

  // Companion scroll listener guarantees trigger across all screen heights
  window.addEventListener('scroll', tryRevealIfVisible, { passive: true });

  // Reset cleanly if the page is reopened from browser cache (bfcache)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      revealed = false;
      scheduled = false;
      popupShown = false;
      if (popupTimer) clearTimeout(popupTimer);
      footer.classList.remove('revealed');
      closeWelcomePopup();
      startObserving();
    }
  });
}

/* ==========================================================================
   Envelope Unveiling Sequence
   ========================================================================== */
function initEnvelopeOpener() {
  const waxSeal = document.getElementById('wax-seal-btn');
  const envelopeScreen = document.getElementById('envelope-screen');

  if (!waxSeal || !envelopeScreen) return;

  waxSeal.addEventListener('click', () => {
    // Start YouTube Panchebaja song immediately within user gesture (mobile-safe)
    if (window.weddingAudio) {
      window.weddingAudio.playSealChime();
      window.weddingAudio.startMusic();
    }

    // Trigger celebration confetti
    triggerCelebrationConfetti();

    // Seal break animation
    waxSeal.style.animation = 'sealCrack 0.7s forwards ease-in';

    // Slide away envelope screen after brief dramatic pause
    setTimeout(() => {
      envelopeScreen.classList.add('opened');
      document.body.style.overflow = 'auto';

      // Gentle scroll to top of card
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 650);
  });
}

/* ==========================================================================
   Countdown Timers (Janti: Dec 3 | Reception: Mangshir 19 / Dec 5)
   ========================================================================== */
function initCountdown() {
  // Target timestamps
  // Current reference year: 2026 (Mangshir 17 / Dec 3 at 8:00 AM)
  const jantiTarget = new Date('2026-12-03T08:00:00+05:45').getTime();
  const receptionTarget = new Date('2026-12-05T16:00:00+05:45').getTime();

  let activeTarget = jantiTarget;

  const tabJanti = document.getElementById('tab-janti');
  const tabReception = document.getElementById('tab-reception');
  const countdownTitle = document.getElementById('countdown-title-text');

  if (tabJanti && tabReception) {
    tabJanti.addEventListener('click', () => {
      activeTarget = jantiTarget;
      tabJanti.classList.add('active');
      tabReception.classList.remove('active');
      if (countdownTitle) {
        countdownTitle.textContent = translations[window.currentLang].countdownJantiTitle;
      }
      updateTimer();
    });

    tabReception.addEventListener('click', () => {
      activeTarget = receptionTarget;
      tabReception.classList.add('active');
      tabJanti.classList.remove('active');
      if (countdownTitle) {
        countdownTitle.textContent = translations[window.currentLang].countdownReceptionTitle;
      }
      updateTimer();
    });
  }

  function updateTimer() {
    const now = new Date().getTime();
    let diff = activeTarget - now;

    if (diff < 0) {
      diff = 0; // Event reached or past
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const dElem = document.getElementById('count-days');
    const hElem = document.getElementById('count-hours');
    const mElem = document.getElementById('count-mins');
    const sElem = document.getElementById('count-secs');

    if (dElem) dElem.textContent = toNepaliDigits(days);
    if (hElem) hElem.textContent = toNepaliDigits(hours);
    if (mElem) mElem.textContent = toNepaliDigits(minutes);
    if (sElem) sElem.textContent = toNepaliDigits(seconds);
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   Language Switcher (English <-> नेपाली)
   ========================================================================== */
function initLanguageSwitcher() {
  const langBtn = document.getElementById('lang-toggle-btn');
  if (!langBtn) return;

  langBtn.addEventListener('click', () => {
    window.currentLang = window.currentLang === 'en' ? 'np' : 'en';
    applyTranslations();
  });
}

function applyTranslations() {
  const dict = translations[window.currentLang];
  if (!dict) return;

  // Update text for all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Update language toggle button text
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.querySelector('.lang-btn-text').textContent = dict.langToggle;
  }

  // Update active countdown title depending on tab
  const tabReception = document.getElementById('tab-reception');
  const countdownTitle = document.getElementById('countdown-title-text');
  if (countdownTitle) {
    if (tabReception && tabReception.classList.contains('active')) {
      countdownTitle.textContent = dict.countdownReceptionTitle;
    } else {
      countdownTitle.textContent = dict.countdownJantiTitle;
    }
  }
}

/* ==========================================================================
   Navigation Controls (Music & Petals)
   ========================================================================== */
function initNavControls() {
  const musicBtn = document.getElementById('music-toggle-btn');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (window.weddingAudio) window.weddingAudio.toggle();
    });
  }

  const petalsBtn = document.getElementById('petals-toggle-btn');
  if (petalsBtn) {
    petalsBtn.addEventListener('click', () => {
      if (window.petalEngine) {
        const active = window.petalEngine.toggle();
        petalsBtn.style.opacity = active ? '1' : '0.5';
      }
    });
  }

  const printBtn = document.getElementById('print-invitation-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   Calendar Generators (Google Calendar & .ics Download)
   ========================================================================== */
function initCalendarButtons() {
  // Janti Event
  const jantiCalBtn = document.getElementById('cal-btn-janti');
  if (jantiCalBtn) {
    jantiCalBtn.addEventListener('click', () => {
      downloadICSFile({
        title: "सुलभ राना र मन्नु श्रेष्ठ — शुभ जन्ती (मंसिर १७ / डिसेम्बर ३)",
        description: "वर निवास हत्तिवन, ललितपुर (भेला बिहान ७:०० बजे, प्रस्थान बिहान ८:०० बजे) बाट द स्मार्ट प्यालेससम्म शुभ जन्ती तथा विवाह समारोह।",
        location: "हत्तिवन, ललितपुर देखि द स्मार्ट प्यालेस",
        startDate: "20261203T080000",
        endDate: "20261203T160000"
      }, "Sulav_Mannu_Janti.ics");
    });
  }

  // Reception Event
  const receptionCalBtn = document.getElementById('cal-btn-reception');
  if (receptionCalBtn) {
    receptionCalBtn.addEventListener('click', () => {
      downloadICSFile({
        title: "सुलभ राना र मन्नु श्रेष्ठ — विवाह प्रीतिभोज (मंसिर १९ / डिसेम्बर ५)",
        description: "क्रिस्टल ब्याङ्क्वेट, मानभवन, पाटन, ललितपुरमा बेलुकी ४:०० बजे देखि भव्य विवाह प्रीतिभोज।",
        location: "क्रिस्टल ब्याङ्क्वेट, मानभवन, पाटन, ललितपुर",
        startDate: "20261205T160000",
        endDate: "20261205T213000"
      }, "Sulav_Mannu_Reception.ics");
    });
  }
}

function downloadICSFile(event, filename) {
  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sulav & Mannu Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    `DTSTART;TZID=Asia/Kathmandu:${event.startDate}`,
    `DTEND;TZID=Asia/Kathmandu:${event.endDate}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   RSVP Form & Blessings Wall
   ========================================================================== */
const DEFAULT_WISHES = [
  {
    name: "Rana & Shrestha Elders",
    attending: "Both (Janti & Reception)",
    msg: "May Lord Ganesha bless Sulav and Mannu with eternal love, prosperity, and joy on this sacred journey together! Shubha Vivaha!",
    date: "Auspicious Blessing"
  },
  {
    name: "Rohan & Family (Lalitpur)",
    attending: "Janti (Dec 3)",
    msg: "Congratulations to dearest Sulav! Excited to join the royal Janti from Hattiban with Panche Baja!",
    date: "Warm Wishes"
  },
  {
    name: "Sunita Shrestha & Family",
    attending: "Reception (Mangshir 19)",
    msg: "Heartiest congratulations to beautiful Mannu and Sulav. Looking forward to celebrating at Crystal Banquet!",
    date: "With Love"
  }
];

function initRSVPForm() {
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  if (!rsvpForm) return;

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('rsvp-name');
    const phoneInput = document.getElementById('rsvp-phone');
    const guestsInput = document.getElementById('rsvp-guests');
    const attendingRadio = document.querySelector('input[name="attending_event"]:checked');
    const messageInput = document.getElementById('rsvp-message');

    if (!nameInput.value.trim()) {
      alert("Please enter your name / कृपया आफ्नो नाम लेख्नुहोस्");
      nameInput.focus();
      return;
    }

    const attendingText = attendingRadio ? attendingRadio.value : "Attending with Joy";

    const newWish = {
      name: nameInput.value.trim(),
      phone: phoneInput ? phoneInput.value.trim() : "",
      guests: guestsInput ? guestsInput.value : "1",
      attending: attendingText,
      msg: messageInput.value.trim() || "Heartiest congratulations and best wishes to Sulav and Mannu on their wedding!",
      date: "Just now"
    };

    // Save to LocalStorage
    saveWish(newWish);

    // Blast celebration confetti
    triggerCelebrationConfetti();

    // Reset Form
    rsvpForm.reset();

    // Display confirmation alert
    const confirmMsg = window.currentLang === 'np'
      ? "धन्यवाद! यहाँको शुभकामना र उपस्थिति दर्ता भयो।"
      : "Thank you! Your RSVP and heartfelt blessings have been received with love.";
    
    alert(confirmMsg);

    // Refresh Wishes list
    loadWishesWall();
  });
}

function saveWish(wish) {
  try {
    const existing = JSON.parse(localStorage.getItem('sulav_mannu_wishes') || '[]');
    existing.unshift(wish);
    localStorage.setItem('sulav_mannu_wishes', JSON.stringify(existing));
  } catch (err) {
    console.warn("Storage error", err);
  }
}

function loadWishesWall() {
  const listContainer = document.getElementById('wishes-list');
  if (!listContainer) return;

  let storedWishes = [];
  try {
    storedWishes = JSON.parse(localStorage.getItem('sulav_mannu_wishes') || '[]');
  } catch (err) {
    storedWishes = [];
  }

  const allWishes = [...storedWishes, ...DEFAULT_WISHES];

  listContainer.innerHTML = '';
  allWishes.forEach(item => {
    const bubble = document.createElement('div');
    bubble.className = 'wish-bubble';
    bubble.innerHTML = `
      <div class="wish-header">
        <span class="wish-author">${escapeHtml(item.name)}</span>
        <span class="wish-badge">${escapeHtml(item.attending)}</span>
      </div>
      <p class="wish-msg">“${escapeHtml(item.msg)}”</p>
    `;
    listContainer.appendChild(bubble);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/* ==========================================================================
   Share Features (WhatsApp, Viber, Facebook, Copy Link)
   ========================================================================== */
function initShareFeatures() {
  const shareText = encodeURIComponent(
    "💍 Royal Wedding Invitation: Sulav Rana & Mannu Shrestha\n" +
    "🎉 Janti Day: Mangshir 17 / Dec 3 (Gathering 7 AM, Departure 8 AM from Hattiban to The Smart Palace)\n" +
    "🥂 Reception: Mangshir 19 / Dec 5 (Crystal Banquet, Manbhawan, Patan at 4 PM)\n" +
    "You are cordially invited to celebrate with us!\n" +
    window.location.href
  );

  const btnWA = document.getElementById('share-whatsapp');
  if (btnWA) {
    btnWA.href = `https://api.whatsapp.com/send?text=${shareText}`;
  }

  const btnViber = document.getElementById('share-viber');
  if (btnViber) {
    btnViber.href = `viber://forward?text=${shareText}`;
  }

  const btnFB = document.getElementById('share-facebook');
  if (btnFB) {
    btnFB.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  }

  const btnCopy = document.getElementById('share-copy');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const shareData = {
        title: "Sulav Rana & Mannu Shrestha Wedding Invitation",
        text: "You are cordially invited to celebrate the wedding of Sulav Rana & Mannu Shrestha! (Dec 3 Janti & Dec 5 Reception)",
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => copyToClipboard());
      } else {
        copyToClipboard();
      }

      function copyToClipboard() {
        navigator.clipboard.writeText(window.location.href).then(() => {
          const span = btnCopy.querySelector('span');
          if (span) {
            const origText = span.textContent;
            span.textContent = translations[window.currentLang].shareCopied;
            setTimeout(() => {
              span.textContent = origText;
            }, 2000);
          } else {
            alert(translations[window.currentLang].shareCopied);
          }
        }).catch(() => {
          alert(window.location.href);
        });
      }
    });
  }
}

/* ==========================================================================
   Quick Scannable QR Code Canvas Generator
   ========================================================================== */
function initQRCode() {
  const canvas = document.getElementById('qrcode-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const size = 160;
  canvas.width = size;
  canvas.height = size;

  // Draw an elegant decorative QR graphic placeholder with gold corner accents
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#160206';
  // Finder patterns (top-left, top-right, bottom-left)
  drawQRCorner(ctx, 10, 10, 36);
  drawQRCorner(ctx, size - 46, 10, 36);
  drawQRCorner(ctx, 10, size - 46, 36);

  // Decorative grid representing the wedding link
  ctx.fillStyle = '#4a0d16';
  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 14; c++) {
      if ((r < 5 && c < 5) || (r < 5 && c > 8) || (r > 8 && c < 5)) continue;
      if ((r * 7 + c * 11 + 3) % 2 === 0) {
        ctx.fillRect(16 + c * 9.2, 16 + r * 9.2, 7, 7);
      }
    }
  }

  // Central Gold Monogram Emblem
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#800E1E';
  ctx.font = 'bold 12px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S&M', size / 2, size / 2 + 1);
}

function drawQRCorner(ctx, x, y, size) {
  ctx.fillStyle = '#160206';
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 5, y + 5, size - 10, size - 10);
  ctx.fillStyle = '#800E1E';
  ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
}

