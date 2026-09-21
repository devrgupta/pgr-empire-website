(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header, back-to-top */
  const header = $('.site-header'), toTop = $('#toTop');
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 24);
    toTop.hidden = y < 700;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* mobile menu */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && setMenu(false));

  /* active nav link */
  const links = $$('.menu a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const t = $(l.getAttribute('href')); t && spy.observe(t); });

  /* count-up */
  const count = el => {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); }
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* reveal with light stagger */
  $$('.reveal').forEach(el => {
    const sibs = [...(el.parentElement?.children || [])].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 0.08 + 's');
  });
  const rio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => rio.observe(el));

  /* tabs (arrow-key accessible) */
  $$('[data-tabs]').forEach(box => {
    const tabs = $$('[role=tab]', box);
    const select = t => {
      tabs.forEach(b => {
        const on = b === t;
        b.setAttribute('aria-selected', on);
        b.tabIndex = on ? 0 : -1;
        $('#' + b.getAttribute('aria-controls')).hidden = !on;
      });
      t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length]); }
        if (e.key === 'Home') select(tabs[0]);
        if (e.key === 'End') select(tabs[tabs.length - 1]);
      });
    });
  });

  /* land bank data (Corporate Profile, pp. 19–20) */
  const parcels = [
    ['Chincholi — Haji Malang Road, Kalyan East', 36.00, 1568160],
    ['Shelu, Neral — District Karjat', 22.00, 958320],
    ['Bhal — Regency Amantran', 5.00, 217800],
    ['Dwarli — New RTO, Kalyan East', 4.50, 196020],
    ['Gauripada — Kalyan West', 3.50, 152460],
    ['Sapad — Kalyan West', 2.50, 108900],
    ['Umberde — Kalyan West (1,500 sq.m.)', 0.37, 16146],
    ['Shahad — Kalyan West (1,200 sq.m.)', 0.30, 12917],
    ['Versova / Four Bungalows — Mumbai (800 sq.m.)', 0.20, 8611],
    ['Rambaug — Kalyan (650 sq.m.)', 0.16, 6997],
    ['Shahad — Kalyan West (600 sq.m.)', 0.15, 6458],
    ['Barave Ring Road — Kalyan (150 sq.m.)', 0.04, 1615]
  ];
  const fmt = new Intl.NumberFormat('en-IN');
  $('#lb-body').innerHTML = parcels.map(([n, ac, sf]) =>
    `<tr><td>${n}</td><td class="n">${ac.toFixed(2)}</td><td class="n hide-sm">${fmt.format(sf)}</td></tr>`).join('');

  const slices = [
    ['Chincholi', 36, '#dcc9a3'], ['Shelu / Neral', 22, '#b58b43'], ['Bhal', 5, '#5a7689'],
    ['Dwarli', 4.5, '#2c4d65'], ['Gauripada', 3.5, '#c9974a'], ['Sapad', 2.5, '#c7ad7a'], ['Other', 1.21, '#827967']
  ];
  const total = slices.reduce((s, x) => s + x[1], 0);
  let acc = 0;
  const stops = slices.map(([, v, c]) => {
    const a = acc / total * 100; acc += v; const b = acc / total * 100;
    return `${c} ${a}% ${b}%`;
  });
  $('#donut').style.background = `conic-gradient(${stops.join(',')})`;
  $('#legend').innerHTML = slices.map(([n, v, c]) =>
    `<li><i style="background:${c}"></i>${n}<b>${v.toFixed(2)} ac · ${(v / total * 100).toFixed(1)}%</b></li>`).join('');

  /* enquiry form: saves to Google Sheet + emails the team via Apps Script.
     Paste the deployed Web App URL below (see google-apps-script/README.md). */
  const ENQUIRY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx6k00cY5HW4ma36lrvAJB12epMh0LWoDpWXYW_eOUfwOLDrzvJgWLMEwjQsigpTZPJ/exec';
  const FALLBACK_EMAIL = 'info@pgrempire.com';
  const form = $('#enquiry'), note = $('#form-note'), btn = $('button[type=submit]', form);
  const say = (msg, err) => { note.textContent = msg; note.classList.toggle('err', !!err); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(form));
    if (d.website) return; /* honeypot */
    if (!ENQUIRY_ENDPOINT) {
      const body = `Name: ${d.name}
Email: ${d.email}
Phone: ${d.phone || '-'}
Topic: ${d.topic}

${d.msg || ''}`;
      location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent('Website enquiry: ' + d.topic)}&body=${encodeURIComponent(body)}`;
      say('Opening your email app with the enquiry ready to send…');
      return;
    }
    btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending…'; say('');
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...d, page: location.href, submittedAt: new Date().toISOString() })
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'rejected');
      form.reset();
      say('Thank you — your enquiry has been received. Our team will contact you shortly.');
    } catch {
      say('Could not send right now. Please call +91 86550 18555 or email ' + FALLBACK_EMAIL + '.', true);
    } finally { btn.disabled = false; btn.textContent = label; }
  });

  $('#yr').textContent = new Date().getFullYear();
})();
