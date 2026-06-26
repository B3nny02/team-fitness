'use strict';

// ── YEAR ──────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── NAVBAR SCROLL ─────────────────────────────────────────
const $nav = document.getElementById('navbar');
const onScroll = () => {
  $nav.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('progress-bar').style.width =
    (window.scrollY / (document.documentElement.scrollHeight -
    window.innerHeight) * 100) + '%';
  updateFloating();
};
window.addEventListener('scroll', onScroll, { passive: true });

// ── HAMBURGER ─────────────────────────────────────────────
const $hb  = document.getElementById('hamburger');
const $mob = document.getElementById('mob-menu');
const $im  = document.getElementById('ic-menu');
const $ic  = document.getElementById('ic-close');
$hb.addEventListener('click', () => {
  const open = $mob.classList.toggle('open');
  $im.style.display  = open ? 'none'  : 'block';
  $ic.style.display  = open ? 'block' : 'none';
  $hb.setAttribute('aria-expanded', open);
});
function closeMob() {
  $mob.classList.remove('open');
  $im.style.display = 'block';
  $ic.style.display = 'none';
  $hb.setAttribute('aria-expanded', 'false');
}

// ── WHATSAPP FAB ─────────────────────────────────────────
const $wa  = document.getElementById('wa-fab');
let cachedHeroH = 0;
function updateFloating() {
  if (!cachedHeroH) cachedHeroH = document.getElementById('hero')?.offsetHeight || 600;
  const past = window.scrollY > cachedHeroH * 0.55;
  $wa.classList.toggle('vis', past);
}
updateFloating();

// ── LIVE STATUS ────────────────────────────────────────────
const SCHED = [
  [[9.5*60,22*60]], [[9.5*60,22*60]], [[9.5*60,22*60]],
  [[9.5*60,22*60]], [[9.5*60,22*60]], [[10*60,18*60]],
  []
];
const hhmm = m => String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');

function updateStatus() {
  const now  = new Date();
  const dIdx = (now.getDay() + 6) % 7;
  const mins = now.getHours()*60 + now.getMinutes();
  const slot = SCHED[dIdx].find(s => mins >= s[0] && mins < s[1]);
  const open = !!slot;

  const $pill = document.getElementById('status-pill');
  $pill.className = 'status-pill ' + (open ? 'open' : 'closed');
  const cls = open ? 'p-open' : 'p-closed';
  $pill.querySelectorAll('.ping-out,.ping-in').forEach(el => {
    el.className = el.className.replace(/p-\w+/,'') + ' ' + cls;
  });
  document.getElementById('st-title').textContent = open ? 'Aperto Ora' : 'Chiuso';
  document.getElementById('st-sub').textContent   = open ? `Fino alle ${hhmm(slot[1])}` : 'Ci vediamo presto';

  for (let i = 0; i < 7; i++) {
    const row = document.getElementById('row-'+i);
    if (!row) continue;
    row.classList.toggle('today', i === dIdx);
    const $day = row.querySelector('.h-day');
    $day.classList.toggle('active', i === dIdx);
    if (i === dIdx && !$day.querySelector('.h-dot')) {
      const dot = document.createElement('span');
      dot.className = 'h-dot';
      $day.prepend(dot);
    }
  }
}
updateStatus();
setInterval(updateStatus, 60_000);

// ── GALLERY SCROLL ─────────────────────────────────────────
function galScroll(dir) {
  const el   = document.getElementById('gal-scroll');
  const card = el.querySelector('.gal-card');
  el.scrollBy({ left: dir * ((card?.offsetWidth || 340) + 12), behavior: 'smooth' });
}

// ── REVIEWS ────────────────────────────────────────────────
const REVIEWS = [
  { name: 'Chiara', text: 'Esperienza fantastica! Ci vado da anni ed è una garanzia. Ragazzi competenti, disponibili, gentili e specializzati in ogni problematica. I migliori!' },
  { name: 'flo', text: 'La frequenta mio figlio. L\'attenzione che ho visto da parte dei personal trainer nei confronti di mio figlio è rassicurante. Ci siamo trovati molto bene con Erik, ragazzo dolcissimo, molto disponibile e sensibile.' },
  { name: 'Andrea L.', text: 'Una palestra dove non manca nulla, professionalità molto alta dello Staff, pulizia, ti seguono in maniera ineccepibile e ti fanno sentire a tuo agio. LA STRACONSIGLIO!' },
  { name: 'Matteo A.', text: 'Spazio danza per i bimbi veramente ottimo e insegnante molto valida!' },
  { name: 'Alex', text: 'Una garanzia. Personale qualificato e preparato. Ambiente dove non manca la professionalità e la simpatia. Super consigliato!' },
];
let rIdx = 0, rTimer;

function renderRevDots() {
  document.getElementById('rev-dots').innerHTML = REVIEWS.map((_, i) =>
    `<button class="rev-dot${i===rIdx?' on':''}" onclick="goRev(${i})" aria-label="Recensione ${i+1}" role="tab" aria-selected="${i===rIdx}"></button>`
  ).join('');
}

function showRev(i) {
  const $c = document.getElementById('rev-card');
  $c.style.opacity = '0'; $c.style.transform = 'translateY(18px)';
  setTimeout(() => {
    document.getElementById('rev-text').textContent   = `"${REVIEWS[i].text}"`;
    document.getElementById('rev-author').textContent = `— ${REVIEWS[i].name} · Google`;
    $c.style.opacity = '1'; $c.style.transform = 'translateY(0)';
    renderRevDots();
  }, 200);
}
function goRev(i)  { rIdx = i; showRev(i); resetRevTimer(); }
function nextRev() { rIdx = (rIdx+1) % REVIEWS.length; showRev(rIdx); resetRevTimer(); }
function prevRev() { rIdx = (rIdx-1+REVIEWS.length) % REVIEWS.length; showRev(rIdx); resetRevTimer(); }
function resetRevTimer() { clearInterval(rTimer); rTimer = setInterval(nextRev, 5500); }
showRev(0);
resetRevTimer();

// ── FORM (Formspree AJAX) ─────────────────────────────────
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const $fb = document.getElementById('f-fb');
  const $btn = form.querySelector('button[type="submit"]');
  const originalText = $btn.innerHTML;

  $btn.disabled = true;
  $btn.innerHTML = 'Invio in corso…';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      $fb.innerHTML = '<p class="f-ok">✓ Messaggio inviato! Ti risponderemo entro 24 ore.</p>';
      form.reset();
    } else {
      const data = await res.json();
      $fb.innerHTML = '<p class="f-err">✗ ' + (data.error || 'Errore. Riprova più tardi.') + '</p>';
    }
  } catch {
    $fb.innerHTML = '<p class="f-err">✗ Errore di rete. Controlla la connessione.</p>';
  }

  $btn.disabled = false;
  $btn.innerHTML = originalText;
  setTimeout(() => { $fb.innerHTML = ''; }, 6000);
});

// ── SCROLL REVEAL (IntersectionObserver) ────────────────────
(function(){
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

// ── STAFF CARD FLIP 3D ──────────────────────────────
document.querySelectorAll('.staff-flip-scene').forEach(scene => {
  const inner = scene.querySelector('.staff-flip-inner');
  if (!inner) return;
  scene.addEventListener('click', () => {
    inner.classList.toggle('flipped');
  });
});
