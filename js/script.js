// FitForge interactions
(function(){
  const init = () => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const y = new Date().getFullYear();
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = y;

  // Mobile menu toggle
  const menuBtn = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  if (menuBtn && mobileMenu){
    let lastTouch = 0;
    const handleToggle = (e) => {
      if (e && e.type === 'touchstart'){
        lastTouch = Date.now();
        e.preventDefault();
      } else if (Date.now() - lastTouch < 300){
        // avoid double-fire after touch
        return;
      }
      const exp = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!exp));
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('no-scroll', !exp);
    };
    menuBtn.addEventListener('touchstart', handleToggle, {passive:false});
    menuBtn.addEventListener('click', handleToggle);
    // close on click
    $$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded','false');
      document.body.classList.remove('no-scroll');
    }));

    // close on Escape
    window.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape'){
        if (!mobileMenu.classList.contains('hidden')){
          mobileMenu.classList.add('hidden');
          menuBtn.setAttribute('aria-expanded','false');
          document.body.classList.remove('no-scroll');
        }
      }
    });
  }

  // Smooth scrolling for nav links
  const scrollLinks = $$('a[href^="#"]');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scrollLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length === 1) return;
      const target = document.getElementById(href.slice(1));
      if (target){
        e.preventDefault();
        try {
          if (target.scrollIntoView){
            // Some older browsers don't support options object
            if ('scrollBehavior' in document.documentElement.style){
              target.scrollIntoView({behavior: prefersReduced ? 'auto' : 'smooth', block:'start'});
            } else {
              target.scrollIntoView();
            }
          }
        } catch(_) {
          // no-op fallback
        }
        try { history.pushState(null, '', href); } catch(_) {}
      }
    });
  });

  // IntersectionObserver for active menu + AOS-like animations
  const navMap = new Map();
  $$('.nav-link').forEach(l=>{
    const href = l.getAttribute('href');
    const id = href ? href.replace('#','') : '';
    if (id) navMap.set(id, l);
  });

  const hasIO = typeof window.IntersectionObserver !== 'undefined';

  if (hasIO){
    const sectionObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const id = entry.target.id;
        const link = navMap.get(id);
        if (!link) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5){
          $$('.nav-link').forEach(n=>{n.classList.remove('active'); n.removeAttribute('aria-current');});
          link.classList.add('active');
          link.setAttribute('aria-current','true');
        }
      });
    }, {threshold:[0.55]});

    ['services','results','pricing','booking','faq'].forEach(id=>{
      const sec = document.getElementById(id);
      if (sec) sectionObserver.observe(sec);
    });
  } else {
    // Fallback: set "active" on click only
    $$('.nav-link').forEach(l=>{
      l.addEventListener('click', ()=>{
        $$('.nav-link').forEach(n=>{n.classList.remove('active'); n.removeAttribute('aria-current');});
        l.classList.add('active');
        l.setAttribute('aria-current','true');
      });
    });
  }

  // AOS-like: reveal on enter (respect reduced motion)
  if (prefersReduced || !hasIO){
    $$('[data-animate]').forEach(el=>el.classList.add('in'));
  } else {
    const aosObserver = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold: 0.2});
    $$('[data-animate]').forEach(el=>aosObserver.observe(el));
  }

  // Before-After slider
  (function(){
    const wrap = $('.before-after__wrap');
    const topImg = $('.before-after__img--top');
    const divider = $('.before-after__divider');
    const range = $('.before-after__range');
    if (!wrap || !topImg || !divider || !range) return;

    let dragging = false;
    const setPosition = (percent) => {
      const p = Math.max(0, Math.min(100, percent));
      topImg.style.clipPath = `inset(0 ${100-p}% 0 0)`;
      divider.style.left = `${p}%`;
      range.value = String(p);
    };

    // Init
    setPosition(parseFloat(range.value || '50'));

    range.addEventListener('input', () => setPosition(parseFloat(range.value)));

    // Drag on image
    const getPercentFromEvent = (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.touches? e.touches[0].clientX : e.clientX) - rect.left;
      return (x / rect.width) * 100;
    };

    const start = (e)=>{
      e.preventDefault();
      dragging = true;
      wrap.classList.add('dragging');
      move(e);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('touchmove', move, {passive:false});
      window.addEventListener('touchend', end);
    };
    const move = (e)=>{
      if (!dragging) return;
      if (e && e.cancelable) e.preventDefault();
      setPosition(getPercentFromEvent(e));
    };
    const end = ()=>{
      dragging = false;
      wrap.classList.remove('dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };

    wrap.addEventListener('pointerdown', start);
    wrap.addEventListener('touchstart', start, {passive:false});
    // Mouse fallback for environments without Pointer Events
    wrap.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  })();

  // Keyboard-only skip link visibility: show skip link when user presses Tab
  (function(){
    let keyboardSet = false;
    const onKey = (e)=>{
      if (e.key === 'Tab'){
        document.body.classList.add('keyboard');
        keyboardSet = true;
        window.removeEventListener('keydown', onKey, true);
      }
    };
    window.addEventListener('keydown', onKey, true);
    // On pointer input, ensure we don't show keyboard styles inadvertently
    window.addEventListener('pointerdown', ()=>{
      if (!keyboardSet) document.body.classList.remove('keyboard');
    }, true);
  })();

  // Pricing toggle (session vs monthly)
  (function(){
    const toggle = $('#priceToggle');
    if (!toggle) return;
    const priceEls = $$('[data-price]');
    const fmt = (n) => new Intl.NumberFormat('hu-HU').format(n);
    const update = () => {
      const monthly = toggle.checked;
      priceEls.forEach(el=>{
        const session = parseInt(el.getAttribute('data-session')||'0',10);
        const month = parseInt(el.getAttribute('data-month')||'0',10);
        if (monthly){
          el.textContent = `${fmt(month)} Ft / hó`;
        } else {
          el.textContent = `${fmt(session)} Ft / alkalom`;
        }
      });
    };
    toggle.addEventListener('change', update);
    update();
  })();

  // Calculator (BMI + daily calories)
  (function(){
    const gender = $('#gender');
    const age = $('#age');
    const height = $('#height');
    const weight = $('#weight');
    const activity = $('#activity');
    const bmiValue = $('#bmiValue');
    const bmiClass = $('#bmiClass');
    const calValue = $('#calorieValue');

    if (!gender || !age || !height || !weight || !activity) return;

    const bmiClassify = (b)=>{
      if (b < 18.5) return 'Sovány';
      if (b < 25) return 'Normál';
      if (b < 30) return 'Túlsúly';
      return 'Elhízás';
    };

    const calc = ()=>{
      const a = parseFloat(age.value)||0;
      const h = parseFloat(height.value)||0;
      const w = parseFloat(weight.value)||0;
      const act = parseFloat(activity.value)||1.2;
      if (h>0 && w>0){
        const bmi = w / Math.pow(h/100,2);
        bmiValue.textContent = bmi.toFixed(1);
        bmiClass.textContent = bmiClassify(bmi);
      } else {
        bmiValue.textContent = '—';
        bmiClass.textContent = '—';
      }
      if (a>0 && h>0 && w>0){
        const s = gender.value === 'male' ? 5 : -161;
        const bmr = 10*w + 6.25*h - 5*a + s;
        const kcal = Math.round(bmr * act);
        calValue.textContent = `${kcal} kcal`;
      } else {
        calValue.textContent = '— kcal';
      }
    };

    [gender,age,height,weight,activity].forEach(el=>el.addEventListener('input', calc));
    calc();
  })();

  // FAQ accordion (ARIA)
  (function(){
    const buttons = $$('.accordion-btn');
    buttons.forEach(btn=>{
      btn.addEventListener('click',()=>{
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panelId = btn.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (!panel) return;
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.classList.toggle('hidden', expanded);
      });
      btn.addEventListener('keydown',(e)=>{
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          btn.click();
        }
      });
    });
  })();

  // Booking form validation (client-side, demo only)
  (function(){
    const form = $('#bookingForm');
    if (!form) return;
    const fields = {
      name: $('#name'),
      email: $('#email'),
      goal: $('#goal'),
      time: $('#time'),
      consent: $('#consent')
    };
    const errors = {
      name: $('#nameErr'),
      email: $('#emailErr'),
      goal: $('#goalErr'),
      time: $('#timeErr'),
      consent: $('#consentErr')
    };
    const status = $('#formStatus');

    const emailOk = (v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const setErr = (key, msg, invalid) => {
      const f = fields[key];
      const e = errors[key];
      if (!f || !e) return;
      if (invalid){
        f.setAttribute('aria-invalid','true');
        e.textContent = msg;
        e.hidden = false;
      } else {
        f.removeAttribute('aria-invalid');
        e.hidden = true;
      }
    };

    const validate = ()=>{
      let ok = true;
      setErr('name','Kérjük, add meg a neved.', !fields.name.value.trim());
      ok = ok && !!fields.name.value.trim();

      const eVal = fields.email.value.trim();
      setErr('email','Kérjük, valós email címet adj meg.', !emailOk(eVal));
      ok = ok && emailOk(eVal);

      setErr('goal','Kérjük, válassz célt.', !fields.goal.value);
      ok = ok && !!fields.goal.value;

      setErr('time','Kérjük, válassz időpontot.', !fields.time.value);
      ok = ok && !!fields.time.value;

      if (!fields.consent.checked){
        errors.consent.hidden = false;
        ok = false;
      } else {
        errors.consent.hidden = true;
      }
      return ok;
    };

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      if (!validate()){
        status.textContent = 'Hiba: kérjük, javítsd a kiemelt mezőket.';
        status.className = 'text-sm text-red-300';
        return;
      }
      // Mock success (no backend)
      status.textContent = 'Sikeres foglalás! Hamarosan felvesszük veled a kapcsolatot.';
      status.className = 'text-sm text-emerald-300';
      form.reset();
      // remove aria-invalid and hide errors
      Object.keys(errors).forEach(k=>setErr(k,'',false));
    });

    // realtime validation on blur/input
    Object.values(fields).forEach(f=>{
      if (!f) return;
      f.addEventListener('blur', validate);
      f.addEventListener('input', ()=>{
        // light validation
        validate();
      });
    });
  })();
  };

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
