(function () {
  'use strict';
  const cfg = window.APP_CONFIG || {};
  const live = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const sb = live ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const $app = document.getElementById('app');
  const CATS = ['زميتة', 'شباكية', 'غريبة', 'كعب غزال', 'أخرى'];
  const CITIES = ['الدار البيضاء', 'الرباط', 'فاس', 'مراكش', 'طنجة', 'مكناس', 'أكادير', 'وجدة'];
  const WEIGHTS = ['500غ', '1كغ', '2كغ'];
  const DELIVERY = ['توصيل', 'استلام من عند البائعة'];
  const PAYMENT = ['عند الاستلام', 'تحويل بنكي'];
  const state = { q: '', cat: '', city: '', mode: 'login', user: null, profile: null, products: [], demoUser: null };

  const P = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    heart: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    back: '<path d="M9 5l7 7-7 7"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'
  };
  const ic = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = msg => {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  };
  const favs = () => { try { return JSON.parse(localStorage.getItem('favs') || '[]'); } catch (e) { return []; } };
  const setFavs = a => { try { localStorage.setItem('favs', JSON.stringify(a)); } catch (e) { /* ignore */ } };
  const curUser = () => (live ? state.user : state.demoUser);

  const DEMO = [
    { id: 'd1', name: 'زميتة بالعسل', description: 'زميتة محضرة بالعسل الحر والسمسم والجوز، بوصفة العائلة.', category: 'زميتة', price: 60, weights: ['500غ', '1كغ'], delivery: ['توصيل'], payment: ['عند الاستلام'], prep_time: '24 ساعة', shelf_life: '15 يوم', image_url: '', city: 'فاس', profiles: { shop_name: 'تعاونية النور', whatsapp: '0600000000', city: 'فاس', created_at: '2026-01-10' } },
    { id: 'd2', name: 'شباكية تقليدية', description: 'شباكية مقرمشة بالعسل وماء الزهر والسمسم.', category: 'شباكية', price: 90, weights: ['1كغ', '2كغ'], delivery: ['توصيل', 'استلام من عند البائعة'], payment: ['عند الاستلام', 'تحويل بنكي'], prep_time: '24 ساعة', shelf_life: '10 أيام', image_url: '', city: 'الرباط', profiles: { shop_name: 'خديجة للحلويات', whatsapp: '0611111111', city: 'الرباط', created_at: '2026-03-02' } },
    { id: 'd3', name: 'غريبة باللوز', description: 'غريبة هشة باللوز والسمن البلدي.', category: 'غريبة', price: 45, weights: ['500غ'], delivery: ['استلام من عند البائعة'], payment: ['عند الاستلام'], prep_time: '12 ساعة', shelf_life: '20 يوم', image_url: '', city: 'الدار البيضاء', profiles: { shop_name: 'حلويات أمينة', whatsapp: '0622222222', city: 'الدار البيضاء', created_at: '2026-05-18' } },
    { id: 'd4', name: 'كعب غزال', description: 'كعاب غزال باللوز وماء الزهر.', category: 'كعب غزال', price: 120, weights: ['500غ', '1كغ'], delivery: ['توصيل'], payment: ['عند الاستلام'], prep_time: '48 ساعة', shelf_life: '15 يوم', image_url: '', city: 'مراكش', profiles: { shop_name: 'دار الحلوى', whatsapp: '0633333333', city: 'مراكش', created_at: '2026-06-01' } }
  ];

  async function loadProfile() {
    if (!live || !state.user) return;
    const r = await sb.from('profiles').select('*').eq('id', state.user.id).maybeSingle();
    state.profile = r.data || null;
  }
  async function loadProducts() {
    if (!live) { if (!state.products.length) state.products = DEMO.slice(); return; }
    const r = await sb.from('products').select('*, profiles(shop_name,whatsapp,city,created_at)').eq('is_active', true).order('created_at', { ascending: false });
    state.products = r.data || [];
  }

  const waLink = (num, text) => {
    let d = String(num || '').replace(/\D/g, '');
    if (d.startsWith('0')) d = '212' + d.slice(1);
    return 'https://wa.me/' + d + '?text=' + encodeURIComponent(text);
  };
  const since = d => (d ? new Date(d).getFullYear() : '');

  function shell(inner, active) {
    const tab = (h, n, l, k) => `<a href="${h}" class="${active === k ? 'on' : ''}">${ic(n, 24)}${l}</a>`;
    const nav = active ? `<nav class="tabs">${tab('#/', 'home', 'الرئيسية', 'home')}${tab('#/fav', 'heart', 'المفضلة', 'fav')}${tab('#/sell', 'user', 'محلي', 'sell')}</nav>` : '';
    $app.innerHTML = `<div class="shell"><main>${inner}</main>${nav}</div>`;
    window.scrollTo(0, 0);
  }
  const header = title => `<div class="row" style="margin-bottom:14px"><a class="ib" href="#/" aria-label="رجوع">${ic('back', 20)}</a><h1 style="margin:0;font-size:20px">${esc(title)}</h1></div>`;

  function card(p) {
    const s = p.profiles || {};
    const on = favs().includes(p.id);
    return `<div class="card"><a href="#/p/${esc(p.id)}"><div class="ph">${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">` : '<i></i>'}</div><div class="cb"><span class="t">${esc(p.name)}</span><span class="m">${esc(s.shop_name || '')} · ${esc(p.city || s.city || '')}</span><span class="pr">${esc(p.price)} د.م</span></div></a><button class="ib fav ${on ? 'on' : ''}" data-fav="${esc(p.id)}" aria-label="مفضلة">${ic('heart', 20)}</button></div>`;
  }

  function filtered() {
    const q = state.q.trim();
    return state.products.filter(p => {
      const s = p.profiles || {};
      if (state.cat && p.category !== state.cat) return false;
      if (state.city && (p.city || s.city) !== state.city) return false;
      if (q && !(p.name + ' ' + (p.description || '') + ' ' + (s.shop_name || '')).includes(q)) return false;
      return true;
    });
  }
  function drawGrid() {
    const g = document.getElementById('grid'); if (!g) return;
    const l = filtered();
    g.innerHTML = l.length ? l.map(card).join('') : '<div class="empty">ما لقينا حتى منتج. جرب كلمة أخرى أو بدل المدينة.</div>';
  }

  async function home() {
    await loadProducts();
    shell(`
      <h1>${esc(cfg.APP_NAME || 'حلويات')}</h1>
      <div class="m" style="margin-bottom:12px">تواصل مباشرة مع البائعات وتفاهمو على الثمن والتسليم</div>
      <div class="c search">${ic('search', 20)}<input id="q" type="search" aria-label="بحث" placeholder="قلب على زميتة، شباكية..." value="${esc(state.q)}"></div>
      <div class="chips" role="group" aria-label="الفئات"><button class="chip ${state.cat ? '' : 'on'}" data-cat="">الكل</button>${CATS.map(c => `<button class="chip ${state.cat === c ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>
      <label class="field"><span>المدينة</span><select id="city"><option value="">كل المدن</option>${CITIES.map(c => `<option ${state.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      ${live ? '' : '<div class="note" style="margin-bottom:12px">وضع التجربة: هاد البيانات وهمية. فعل Supabase فملف config.js باش تخدم بيانات حقيقية.</div>'}
      <div class="grid" id="grid"></div>
      <p class="m" style="margin-top:18px;line-height:1.8">المنصة وسيط فقط. الدفع والتسليم كيتم مباشرة بين الزبون والبائعة.</p>`, 'home');
    drawGrid();
  }

  async function product(id) {
    await loadProducts();
    const p = state.products.find(x => String(x.id) === String(id));
    if (!p) { shell(header('المنتج') + '<div class="empty">هاد المنتج ما بقاش متوفر.</div>'); return; }
    const s = p.profiles || {};
    const on = favs().includes(p.id);
    const msg = 'السلام، شفت إعلانك ديال ' + p.name + ' فتطبيق ' + (cfg.APP_NAME || '') + '. واش ما زال متوفر؟';
    const list = a => (a && a.length ? a.map(esc).join(' · ') : 'يتفاهمو عليه');
    shell(`
      <div class="ph hero">${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}">` : '<i style="width:90px;height:90px"></i>'}<a class="ib" style="right:16px" href="#/" aria-label="رجوع">${ic('back', 20)}</a><button class="ib fav ${on ? 'on' : ''}" style="left:16px" data-fav="${esc(p.id)}" aria-label="مفضلة">${ic('heart', 20)}</button></div>
      <div class="row between"><h1>${esc(p.name)}</h1><div style="text-align:left"><div class="t" style="font-size:22px;color:var(--g)">${esc(p.price)} د.م</div><div class="m">ثمن تقريبي / كغ</div></div></div>
      <div class="c pad row" style="margin:12px 0"><div class="ph" style="width:44px;height:44px;border-radius:50%"></div><div style="flex:1"><div class="t">${esc(s.shop_name || '')} · ${esc(p.city || s.city || '')}</div><div class="m">عضوة من ${esc(since(s.created_at))}</div></div></div>
      ${p.weights && p.weights.length ? `<div class="row wrap" style="margin-bottom:12px"><span class="m">الأوزان</span>${p.weights.map(w => `<span class="tag">${esc(w)}</span>`).join('')}</div>` : ''}
      ${p.description ? `<p style="line-height:1.9;margin:0 0 12px">${esc(p.description)}</p>` : ''}
      <div class="c pad" style="line-height:2;font-size:14px;margin-bottom:12px">
        <div><span class="m">التسليم:</span> ${list(p.delivery)}</div>
        <div><span class="m">الدفع:</span> ${list(p.payment)}</div>
        ${p.prep_time ? `<div><span class="m">مدة التحضير:</span> ${esc(p.prep_time)}</div>` : ''}
        ${p.shelf_life ? `<div><span class="m">الصلاحية:</span> ${esc(p.shelf_life)}</div>` : ''}
      </div>
      <div class="note">الدفع والتسليم كيتم مباشرة بينك وبين البائعة. المنصة غير كتجمعكم، فتأكد قبل ما تدفع.</div>`);
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.innerHTML = `<a class="btn" style="flex:1" href="${esc(waLink(s.whatsapp, msg))}" target="_blank" rel="noopener">${ic('chat', 20)} واتساب</a><a class="btn alt" style="min-height:50px" href="tel:${esc(String(s.whatsapp || '').replace(/\s/g, ''))}">${ic('phone', 20)} اتصل</a>`;
    $app.querySelector('.shell').appendChild(bar);
  }

  async function favsPage() {
    await loadProducts();
    const f = favs();
    const l = state.products.filter(p => f.includes(p.id));
    shell(`<h1>المفضلة</h1><div class="grid" style="margin-top:12px">${l.length ? l.map(card).join('') : '<div class="empty">ما زال ما زدتي والو للمفضلة. دوز على القلب فأي منتج.</div>'}</div>`, 'fav');
  }

  function login() {
    const su = state.mode === 'signup';
    shell(`${header(su ? 'سجل محلك' : 'دخول البائعة')}
      <div class="tabsw"><button class="chip ${su ? '' : 'on'}" data-act="mode" data-v="login">دخول</button><button class="chip ${su ? 'on' : ''}" data-act="mode" data-v="signup">حساب جديد</button></div>
      ${live ? '' : '<div class="note" style="margin-bottom:12px">وضع التجربة: أي معلومات غادي تدخلك بلا حساب حقيقي.</div>'}
      <form data-form="login">
        ${su ? `<label class="field"><span>اسم المحل</span><input name="shop" required placeholder="مثال: تعاونية النور"></label>
        <label class="field"><span>المدينة</span><select name="city" required>${CITIES.map(c => `<option>${c}</option>`).join('')}</select></label>
        <label class="field"><span>رقم الواتساب</span><input name="wa" required inputmode="tel" placeholder="06 XX XX XX XX"></label>` : ''}
        <label class="field"><span>الإيميل</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="field"><span>كلمة السر</span><input name="pass" type="password" minlength="6" required autocomplete="${su ? 'new-password' : 'current-password'}"></label>
        <button class="btn full" type="submit">${su ? 'سجل' : 'دخل'}</button>
      </form>`);
  }

  async function sell() {
    const u = curUser();
    if (!u) { location.hash = '#/login'; return; }
    let mine;
    if (live) {
      if (!state.profile) await loadProfile();
      const r = await sb.from('products').select('*').eq('seller_id', u.id).order('created_at', { ascending: false });
      mine = r.data || [];
    } else { mine = state.products.filter(p => p.seller_id === 'demo'); }
    const name = (live ? (state.profile && state.profile.shop_name) : 'محل تجريبي') || 'محلي';
    shell(`<div class="row between"><div><div class="m">مرحبا</div><h1>${esc(name)}</h1></div><button class="btn alt" data-act="logout">خروج</button></div>
      <a class="btn full" style="margin:14px 0" href="#/add">+ زيد منتج جديد</a>
      <h2>منتجاتي (${mine.length})</h2>
      ${mine.length ? mine.map(p => `<div class="c lrow" style="margin-bottom:10px"><div class="ph">${p.image_url ? `<img src="${esc(p.image_url)}" alt="">` : '<i style="width:28px;height:28px"></i>'}</div><div class="info"><div class="t">${esc(p.name)}</div><div class="m">${esc(p.price)} د.م · ${p.is_active === false ? 'مخفي' : 'منشور'}</div></div><button class="btn alt" data-act="toggle" data-id="${esc(p.id)}">${p.is_active === false ? 'نشر' : 'إخفاء'}</button><button class="btn alt" data-act="del" data-id="${esc(p.id)}" aria-label="حذف">حذف</button></div>`).join('') : '<div class="empty">ما عندك حتى منتج. زيد أول منتج ديالك.</div>'}`, 'sell');
  }

  const checks = (name, opts, sel) => `<div class="checks">${opts.map(o => `<label><input type="checkbox" name="${name}" value="${o}" ${sel.includes(o) ? 'checked' : ''}> ${o}</label>`).join('')}</div>`;
  function add() {
    if (!curUser()) { location.hash = '#/login'; return; }
    shell(`${header('منتج جديد')}<form data-form="add">
      <label class="field"><span>صورة المنتج</span><input name="img" type="file" accept="image/*"></label>
      <label class="field"><span>اسم المنتج</span><input name="name" required placeholder="مثال: زميتة بالعسل"></label>
      <label class="field"><span>وصف المنتج</span><textarea name="desc" placeholder="المكونات، الطعم، كيفاش كتتحضر..."></textarea></label>
      <label class="field"><span>الفئة</span><select name="cat">${CATS.map(c => `<option>${c}</option>`).join('')}</select></label>
      <label class="field"><span>الثمن التقريبي (د.م / كغ)</span><input name="price" type="number" min="1" step="any" required inputmode="decimal"></label>
      <div class="field"><span>الأوزان المتاحة</span>${checks('weights', WEIGHTS, ['500غ', '1كغ'])}</div>
      <div class="field"><span>التسليم</span>${checks('delivery', DELIVERY, ['توصيل'])}</div>
      <div class="field"><span>طرق الدفع (يتفاهمو عليها مباشرة)</span>${checks('payment', PAYMENT, ['عند الاستلام'])}</div>
      <label class="field"><span>مدة التحضير</span><input name="prep" placeholder="مثال: 24 ساعة"></label>
      <label class="field"><span>مدة الصلاحية</span><input name="shelf" placeholder="مثال: 10 أيام"></label>
      <button class="btn full" type="submit">انشر المنتج</button></form>`);
  }

  function resize(file, max) {
    return new Promise((res, rej) => {
      const img = new Image(); const u = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(b => { URL.revokeObjectURL(u); b ? res(b) : rej(new Error('img')); }, 'image/jpeg', 0.8);
      };
      img.onerror = () => rej(new Error('img'));
      img.src = u;
    });
  }

  async function submitLogin(f) {
    const d = new FormData(f); const su = state.mode === 'signup';
    const email = d.get('email'), pass = d.get('pass');
    if (!live) {
      state.demoUser = { id: 'demo' };
      state.profile = { shop_name: su ? d.get('shop') : 'محل تجريبي' };
      location.hash = '#/sell'; return;
    }
    if (su) {
      const r = await sb.auth.signUp({ email, password: pass });
      if (r.error) { toast('ما تسجلتش: ' + r.error.message); return; }
      if (!r.data.session) { toast('صيفطنا ليك إيميل للتأكيد. أكد وردّ دخل.'); return; }
      state.user = r.data.session.user;
      const pr = await sb.from('profiles').upsert({ id: state.user.id, shop_name: d.get('shop'), city: d.get('city'), whatsapp: d.get('wa') });
      if (pr.error) { toast('وقع مشكل فحفظ معلومات المحل'); return; }
      await loadProfile();
    } else {
      const r = await sb.auth.signInWithPassword({ email, password: pass });
      if (r.error) { toast('الإيميل أو كلمة السر غالطين'); return; }
      state.user = r.data.user; await loadProfile();
    }
    location.hash = '#/sell';
  }

  async function submitAdd(f) {
    const d = new FormData(f); const btn = f.querySelector('button[type=submit]');
    const row = {
      name: d.get('name'), description: d.get('desc'), category: d.get('cat'), price: Number(d.get('price')),
      weights: d.getAll('weights'), delivery: d.getAll('delivery'), payment: d.getAll('payment'),
      prep_time: d.get('prep'), shelf_life: d.get('shelf'), image_url: '', is_active: true
    };
    btn.disabled = true; btn.textContent = 'كنتشرو...';
    try {
      const file = d.get('img');
      const hasImg = file && file.size > 0;
      if (!live) {
        if (hasImg) row.image_url = URL.createObjectURL(file);
        state.products.unshift(Object.assign(row, { id: 'm' + Date.now(), seller_id: 'demo', city: 'فاس', profiles: { shop_name: (state.profile && state.profile.shop_name) || 'محل تجريبي', whatsapp: '0600000000', city: 'فاس', created_at: new Date().toISOString() } }));
      } else {
        if (hasImg) {
          const blob = await resize(file, 1000);
          const path = state.user.id + '/' + Date.now() + '.jpg';
          const up = await sb.storage.from('products').upload(path, blob, { contentType: 'image/jpeg' });
          if (up.error) throw up.error;
          row.image_url = sb.storage.from('products').getPublicUrl(path).data.publicUrl;
        }
        row.seller_id = state.user.id;
        row.city = state.profile && state.profile.city;
        const ins = await sb.from('products').insert(row);
        if (ins.error) throw ins.error;
      }
      toast('تنشر المنتج');
      location.hash = '#/sell';
    } catch (e) {
      toast('ما تنشرش المنتج. جرب مرة أخرى.');
      btn.disabled = false; btn.textContent = 'انشر المنتج';
    }
  }

  async function onAct(el) {
    const a = el.dataset.act, id = el.dataset.id;
    if (a === 'mode') { state.mode = el.dataset.v; login(); }
    else if (a === 'logout') {
      if (live) await sb.auth.signOut();
      state.user = null; state.profile = null; state.demoUser = null; location.hash = '#/';
    } else if (a === 'toggle') {
      const p = state.products.find(x => String(x.id) === id);
      if (live) {
        const cur = await sb.from('products').select('is_active').eq('id', id).single();
        await sb.from('products').update({ is_active: !(cur.data && cur.data.is_active) }).eq('id', id);
      } else if (p) { p.is_active = p.is_active === false; }
      await loadProducts(); sell();
    } else if (a === 'del') {
      if (!confirm('تأكد بغيتي تحذف هاد المنتج؟')) return;
      if (live) await sb.from('products').delete().eq('id', id);
      else state.products = state.products.filter(x => String(x.id) !== id);
      await loadProducts(); sell();
    }
  }

  $app.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      const id = fav.dataset.fav; let f = favs();
      f = f.includes(id) ? f.filter(x => x !== id) : f.concat(id);
      setFavs(f);
      document.querySelectorAll('[data-fav="' + id + '"]').forEach(b => b.classList.toggle('on', f.includes(id)));
      if (location.hash === '#/fav') favsPage();
      return;
    }
    const cat = e.target.closest('[data-cat]');
    if (cat) {
      state.cat = cat.dataset.cat;
      document.querySelectorAll('[data-cat]').forEach(b => b.classList.toggle('on', b.dataset.cat === state.cat));
      drawGrid(); return;
    }
    const act = e.target.closest('[data-act]');
    if (act) onAct(act);
  });
  $app.addEventListener('input', e => { if (e.target.id === 'q') { state.q = e.target.value; drawGrid(); } });
  $app.addEventListener('change', e => { if (e.target.id === 'city') { state.city = e.target.value; drawGrid(); } });
  $app.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.closest('form'); if (!f) return;
    if (f.dataset.form === 'login') submitLogin(f);
    if (f.dataset.form === 'add') submitAdd(f);
  });

  function route() {
    const p = (location.hash.slice(1) || '/').split('/').filter(Boolean);
    if (p[0] === 'p') return product(p[1]);
    if (p[0] === 'fav') return favsPage();
    if (p[0] === 'sell') return sell();
    if (p[0] === 'login') return login();
    if (p[0] === 'add') return add();
    return home();
  }

  async function init() {
    if (live) {
      const r = await sb.auth.getSession();
      state.user = r.data.session ? r.data.session.user : null;
      await loadProfile();
    }
    window.addEventListener('hashchange', route);
    route();
    if ('serviceWorker' in navigator) {
      const had = !!navigator.serviceWorker.controller; let done = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !done) { done = true; location.reload(); } });
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  init();
})();
