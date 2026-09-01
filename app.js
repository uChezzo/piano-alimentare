/* ===========================================================
   PIANO — logica dell'app
   Dati in locale per la velocità, Google Fogli come archivio.
   =========================================================== */

const S = {
  tab: "oggi",
  cfg: null,
  mese: null,          // "2026-09"
  dati: { giorni: {}, pasti: [] },
  sel: null,           // data selezionata nel calendario
  coda: [],
  online: navigator.onLine,
  sync: "",
  bozza: null          // stima del pasto in attesa di conferma
};

const CFG_BASE = {
  url: "", token: "", obiettivi: PIANO.obiettivi, macro: PIANO.macro, riflusso: true
};

/* ------------- utilità date ------------- */
const p2 = n => String(n).padStart(2, "0");
const kData = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const kMese = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
const OGGI = kData(new Date());
const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const DOW = ["L","M","M","G","V","S","D"];
const lunedì = d => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0,0,0,0); return x; };
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

/* ------------- memoria locale ------------- */
const L = {
  get(k, d) { try { const v = localStorage.getItem("pv." + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("pv." + k, JSON.stringify(v)); } catch {} }
};

/* ------------- dialogo col foglio ------------- */
async function chiama(azione, extra = {}, silenzioso = false) {
  if (!S.cfg.url) return { ok: false, errore: "Indirizzo del backend non impostato" };
  try {
    const r = await fetch(S.cfg.url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },   // evita il preflight CORS
      body: JSON.stringify(Object.assign({ azione, token: S.cfg.token }, extra))
    });
    const t = await r.text();
    return JSON.parse(t);
  } catch (e) {
    if (!silenzioso) avviso("Nessuna connessione col foglio. Le modifiche restano in coda.");
    return { ok: false, errore: String(e) };
  }
}

function accoda(azione, extra) {
  S.coda.push({ azione, extra, quando: Date.now() });
  L.set("coda", S.coda);
  svuotaCoda();
}

async function svuotaCoda() {
  if (!S.coda.length || !navigator.onLine || !S.cfg.url) return;
  const resta = [];
  for (const v of S.coda) {
    const r = await chiama(v.azione, v.extra, true);
    if (!r.ok) resta.push(v);
  }
  S.coda = resta;
  L.set("coda", S.coda);
  mostraStato();
}

/* ------------- caricamento ------------- */
async function caricaMese(m, daRete = true) {
  S.mese = m;
  const cache = L.get("mese." + m, null);
  if (cache) S.dati = cache;
  else S.dati = { giorni: {}, pasti: [] };
  disegna();
  if (!daRete || !navigator.onLine || !S.cfg.url) return;
  const r = await chiama("leggiMese", { mese: m }, true);
  if (r.ok) {
    S.dati = { giorni: r.giorni || {}, pasti: r.pasti || [] };
    L.set("mese." + m, S.dati);
    S.sync = "aggiornato " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    disegna();
  }
  mostraStato();
}

function salvaCache() { L.set("mese." + S.mese, S.dati); }

/* ------------- obiettivi ------------- */
const attivi = () => S.cfg.obiettivi.filter(o => o.attivo);
const giornoDi = d => S.dati.giorni[d] || {};
const quota = (d, o) => Math.min(1, (giornoDi(d)[o.id] || 0) / o.target);
const completo = d => attivi().length > 0 && attivi().every(o => quota(d, o) >= 1);

function tocca(data, id) {
  const o = S.cfg.obiettivi.find(x => x.id === id);
  const v = giornoDi(data)[id] || 0;
  const nuovo = o.tipo === "bool" ? (v ? 0 : 1) : (v >= o.target ? 0 : v + 1);
  const g = Object.assign({}, giornoDi(data));
  if (nuovo <= 0) delete g[id]; else g[id] = nuovo;
  S.dati.giorni[data] = g;
  salvaCache();
  accoda("salvaGiorno", { data, valori: g });
  disegna();
}

/* ------------- pasti ------------- */
async function stima(testo, momento) {
  const r = await chiama("stima", { testo, momento });
  if (!r.ok) return { errore: r.errore || "Stima non riuscita" };
  return r.stima;
}

function salvaPasto(p) {
  p.id = p.id || String(Date.now());
  const i = S.dati.pasti.findIndex(x => x.id === p.id);
  if (i >= 0) S.dati.pasti[i] = p; else S.dati.pasti.push(p);
  salvaCache();
  accoda("salvaPasto", { pasto: p });
}

function eliminaPasto(id) {
  S.dati.pasti = S.dati.pasti.filter(p => p.id !== id);
  salvaCache();
  accoda("eliminaPasto", { id });
  disegna();
}

const pastiDi = d => S.dati.pasti.filter(p => p.data === d);
function totaliDi(d) {
  return pastiDi(d).reduce((t, p) => ({
    proteine: t.proteine + (+p.proteine || 0),
    grassi: t.grassi + (+p.grassi || 0),
    carboidrati: t.carboidrati + (+p.carboidrati || 0),
    kcal: t.kcal + (+p.kcal || 0)
  }), { proteine: 0, grassi: 0, carboidrati: 0, kcal: 0 });
}

function fontiSettimana() {
  const l = lunedì(new Date()), f = new Date(l); f.setDate(l.getDate() + 6);
  const da = kData(l), a = kData(f);
  const conta = {};
  S.dati.pasti.filter(p => p.data >= da && p.data <= a && p.fonte)
    .forEach(p => conta[p.fonte] = (conta[p.fonte] || 0) + 1);
  return conta;
}

/* ------------- disegno ------------- */
const V = () => document.getElementById("vista");

function disegna() {
  const f = { oggi: vOggi, mese: vMese, pasti: vPasti, consigli: vConsigli, piano: vPiano }[S.tab];
  V().innerHTML = f();
  document.querySelectorAll("nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === S.tab));
  collega();
  mostraStato();
}

function mostraStato() {
  const e = document.getElementById("stato");
  let t = "";
  if (!S.cfg.url) t = "Collega il foglio Google dalla scheda Piano";
  else if (!navigator.onLine) t = "Offline: le modifiche partiranno al rientro";
  else if (S.coda.length) t = S.coda.length + " modifiche in attesa di sincronizzazione";
  e.textContent = t;
  e.classList.toggle("mostra", !!t);
  document.body.style.paddingTop = t ? "30px" : "0";
}

/* ---- scheda OGGI ---- */
function vOggi() {
  const d = new Date();
  const fatti = attivi().filter(o => quota(OGGI, o) >= 1).length;
  const t = totaliDi(OGGI), m = S.cfg.macro;
  const conta = fontiSettimana();

  return `
  <header class="testa">
    <div class="data">${["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"][d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}</div>
    <h1 class="grande">${fatti}<span>/${attivi().length}</span></h1>
    <div class="sotto">${fatti === attivi().length && attivi().length ? "Giornata completa." : "obiettivi raggiunti oggi"}</div>
  </header>

  ${attivi().map(o => rigaObiettivo(OGGI, o)).join("") || `<div class="vuoto">Nessun obiettivo attivo. Attivali dalla scheda Piano.</div>`}

  <h2 class="sez">Macronutrienti <em>${t.kcal ? Math.round(t.kcal) + " kcal" : ""}</em></h2>
  ${pastiDi(OGGI).length ? ["proteine","grassi","carboidrati"].map(k => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
        <span style="text-transform:capitalize">${k}</span>
        <span style="font-variant-numeric:tabular-nums"><b>${Math.round(t[k])}</b><span style="color:var(--lieve)"> / ${m[k]} g</span></span>
      </div>
      <div class="barra"><i style="width:${Math.min(100, t[k]/m[k]*100)}%;background:${{proteine:"#2F7D6E",grassi:"#B0782A",carboidrati:"#5B4FC7"}[k]}"></i></div>
    </div>`).join("") : `<div class="vuoto">Nessun pasto registrato oggi. Vai su Pasti per aggiungerne uno.</div>`}

  <h2 class="sez">Fonti proteiche <em>questa settimana</em></h2>
  ${PIANO.fonti.map(f => {
    const n = conta[f.id] || 0;
    const troppo = n > f.max, poco = f.min && n < f.min;
    return `<div style="margin-bottom:11px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
        <span><span class="tacca" style="background:${f.colore}"></span> ${f.label}</span>
        <span style="font-variant-numeric:tabular-nums;color:${troppo ? "var(--allarme)" : "inherit"}">
          ${n}<span style="color:var(--lieve)"> / ${f.min ? f.min + "-" : "max "}${f.max}</span>${troppo ? " ⚠" : poco ? "" : n ? " ✓" : ""}
        </span>
      </div>
      <div class="barra"><i style="width:${Math.min(100, n / f.max * 100)}%;background:${troppo ? "#C0392B" : f.colore}"></i></div>
    </div>`;
  }).join("")}

  <h2 class="sez">Questa settimana</h2>
  <div class="sett">${settimanaHTML()}</div>`;
}

function settimanaHTML() {
  const l = lunedì(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const g = new Date(l); g.setDate(l.getDate() + i);
    const k = kData(g), futuro = k > OGGI;
    return `<div class="sg" style="opacity:${futuro ? .35 : 1}">
      <div class="sl">${DOW[i]}</div>
      <div class="sc ${completo(k) ? "pieno" : ""} ${k === OGGI ? "oggi" : ""}">${g.getDate()}</div>
      <div class="barrette">${attivi().slice(0,5).map(o =>
        `<span class="b"><i style="height:${quota(k,o)*100}%;background:${o.colore}"></i></span>`).join("")}</div>
    </div>`;
  }).join("");
}

function rigaObiettivo(data, o) {
  const q = quota(data, o), fatto = q >= 1, v = giornoDi(data)[o.id] || 0;
  return `<button class="riga" data-tocca="${o.id}" data-data="${data}"
    style="border-color:${fatto ? o.colore : "var(--bordo)"};background:${fatto ? o.colore + "12" : "var(--carta)"}">
    <span class="ico" style="${fatto ? `background:${o.colore};color:#fff` : ""}">${o.emoji}</span>
    <span class="corpo">
      <span class="nome">${esc(o.label)}</span>
      <span class="nota">${esc(o.nota)}</span>
      ${o.tipo === "count" ? `<span class="mini"><i style="width:${q*100}%;background:${o.colore}"></i></span>` : ""}
    </span>
    <span class="val" style="${fatto ? `color:${o.colore}` : ""}">${o.tipo === "count" ? v + "/" + o.target : fatto ? "✓" : "+"}</span>
  </button>`;
}

/* ---- scheda MESE ---- */
function vMese() {
  const [a, m] = S.mese.split("-").map(Number);
  const primo = new Date(a, m - 1, 1);
  const giorni = new Date(a, m, 0).getDate();
  const vuote = (primo.getDay() + 6) % 7;
  const sel = S.sel || OGGI;
  const selD = new Date(sel + "T12:00:00");
  const pasti = pastiDi(sel);

  let celle = "";
  for (let i = 0; i < vuote; i++) celle += "<div></div>";
  for (let n = 1; n <= giorni; n++) {
    const k = `${a}-${p2(m)}-${p2(n)}`;
    celle += `<button class="cella ${k === OGGI ? "oggi" : ""} ${k === sel ? "sel" : ""}" data-giorno="${k}">
      <span class="num" style="${completo(k) ? "color:var(--inchiostro);font-weight:600" : ""}">${n}</span>
      <span class="barrette">${attivi().slice(0,5).map(o =>
        `<span class="b"><i style="height:${quota(k,o)*100}%;background:${o.colore}"></i></span>`).join("")}</span>
    </button>`;
  }

  return `
  <header class="testa" style="padding-bottom:14px">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <button class="btn vuoto" data-mese="-1" style="padding:8px 14px">‹</button>
      <h2 style="font-size:25px">${MESI[m-1]} <span style="color:var(--lieve)">${a}</span></h2>
      <button class="btn vuoto" data-mese="1" style="padding:8px 14px">›</button>
    </div>
  </header>

  <div class="griglia">${DOW.map(d => `<div class="dow">${d}</div>`).join("")}${celle}</div>
  <div class="legenda">${attivi().map(o => `<span><span class="tacca" style="background:${o.colore}"></span>${esc(o.label)}</span>`).join("")}</div>

  <h2 class="sez">${selD.getDate()} ${MESI[selD.getMonth()]} ${sel === OGGI ? '<span class="pill">oggi</span>' : ""}</h2>
  ${attivi().map(o => rigaObiettivo(sel, o)).join("")}

  ${pasti.length ? `<h2 class="sez">Pasti del giorno</h2>` + pasti.map(pastoHTML).join("") : ""}`;
}

/* ---- scheda PASTI ---- */
function vPasti() {
  const oggi = pastiDi(OGGI);
  const t = totaliDi(OGGI);
  const b = S.bozza;

  return `
  <header class="testa">
    <div class="data">registra un pasto</div>
    <h1 class="grande" style="font-size:34px">Cosa hai mangiato</h1>
    <div class="sotto">Descrivilo a voce o per iscritto, ci penso io a stimare le quantità.</div>
  </header>

  <div class="fila" style="margin-bottom:10px">
    ${["colazione","spuntino","pranzo","merenda","cena"].map(m =>
      `<button class="chip ${(S.momento||momentoOra()) === m ? "on" : ""}" data-momento="${m}">${m}</button>`).join("")}
  </div>

  <div class="dettatura">
    <textarea class="parla" id="testo" placeholder="a pranzo pasta al pesto con fagioli e insalata">${esc(S.testo || "")}</textarea>
    <button class="mic" id="mic" title="Detta">🎤</button>
  </div>
  <div class="fila" style="margin-top:10px">
    <button class="btn" id="stima">Calcola le macro</button>
    <button class="btn vuoto" id="manuale">Inserisci a mano</button>
  </div>
  <div id="esito"></div>

  ${b ? bozzaHTML(b) : ""}

  <h2 class="sez">Oggi <em>${t.kcal ? Math.round(t.kcal) + " kcal · " + Math.round(t.proteine) + "P " + Math.round(t.grassi) + "G " + Math.round(t.carboidrati) + "C" : ""}</em></h2>
  ${oggi.length ? oggi.map(pastoHTML).join("") : `<div class="vuoto">Ancora nessun pasto registrato oggi.</div>`}`;
}

function momentoOra() {
  const h = new Date().getHours();
  return h < 10 ? "colazione" : h < 12 ? "spuntino" : h < 15 ? "pranzo" : h < 18 ? "merenda" : "cena";
}

function bozzaHTML(b) {
  if (b.errore) return `<div class="errore">${esc(b.errore)}</div>`;
  const fonte = PIANO.fonti.find(f => f.id === b.fonte);
  return `<div class="carta" style="margin-top:12px;border-color:var(--inchiostro)">
    <div class="nome">${esc(b.descrizione)}</div>
    ${b.alimenti && b.alimenti.length ? `<div class="nota" style="margin-top:4px">${b.alimenti.map(a => esc(a.nome + (a.quantita ? " " + a.quantita : ""))).join(" · ")}</div>` : ""}
    ${fonte ? `<div class="nota" style="margin-top:6px"><span class="tacca" style="background:${fonte.colore}"></span> conta come porzione di ${esc(fonte.label.toLowerCase())}</div>` : ""}
    <div class="macro">
      <span><b>${Math.round(b.proteine)}</b> g proteine</span>
      <span><b>${Math.round(b.grassi)}</b> g grassi</span>
      <span><b>${Math.round(b.carboidrati)}</b> g carboidrati</span>
    </div>
    ${b.note ? `<div class="nota" style="margin-top:8px">${esc(b.note)}</div>` : ""}
    <div class="fila" style="margin-top:12px">
      <button class="btn" id="conferma">Salva il pasto</button>
      <button class="btn vuoto" id="correggi">Correggi</button>
      <button class="btn vuoto" id="annulla">Annulla</button>
    </div>
  </div>`;
}

function pastoHTML(p) {
  const f = PIANO.fonti.find(x => x.id === p.fonte);
  return `<div class="pasto">
    <header>
      <div>
        <div class="momento">${esc(p.momento)}${f ? ` · <span class="tacca" style="background:${f.colore}"></span> ${esc(f.label.toLowerCase())}` : ""}</div>
        <div class="nome">${esc(p.descrizione)}</div>
      </div>
      <button class="btn vuoto" data-elimina="${p.id}" style="padding:5px 10px;font-size:12px">✕</button>
    </header>
    <div class="macro">
      <span><b>${Math.round(p.proteine)}</b> P</span>
      <span><b>${Math.round(p.grassi)}</b> G</span>
      <span><b>${Math.round(p.carboidrati)}</b> C</span>
      ${p.kcal ? `<span style="margin-left:auto">${Math.round(p.kcal)} kcal</span>` : ""}
    </div>
  </div>`;
}

/* ---- scheda CONSIGLI ---- */
function vConsigli() {
  const sez = S.consigli || "generali";
  const elenco = { generali: PIANO.riferimenti, reflusso: PIANO.reflusso }[sez];

  return `
  <header class="testa">
    <div class="data">dai documenti della dott.ssa Viti</div>
    <h1 class="grande" style="font-size:34px">Promemoria</h1>
  </header>

  <div class="fila" style="margin-bottom:14px">
    ${[["generali","Generali"],["reflusso","Reflusso"],["sostituzioni","Sostituzioni"],["ricette","Ricette"],["settimana","Settimana tipo"]]
      .map(([k,l]) => `<button class="chip ${sez===k?"on":""}" data-consigli="${k}">${l}</button>`).join("")}
  </div>

  ${sez === "sostituzioni" ? Object.entries(PIANO.sostituzioni).map(([t, v]) => `
    <div class="carta"><div class="nome" style="text-transform:capitalize">${esc(t)}</div>
    <div class="nota" style="margin-top:6px;line-height:1.7">${v.map(esc).join(" · ")}</div></div>`).join("")
  : sez === "ricette" ? PIANO.ricette.map(r => `
    <div class="carta"><div class="nome">${esc(r.nome)}</div>
    <div class="nota" style="margin-top:6px;line-height:1.6">${esc(r.testo)}</div></div>`).join("")
  : sez === "settimana" ? PIANO.settimana.map(g => `
    <div class="carta"><div class="nome">${esc(g.giorno)}</div>
    <div class="nota" style="margin-top:8px;line-height:1.6">
      <b>Colazione</b> ${esc(g.colazione)}<br>
      <b>Pranzo</b> ${esc(g.pranzo.piatto)}<br>
      <b>Cena</b> ${esc(g.cena.piatto)}<br>
      <b>Spuntini</b> ${g.spuntini.map(esc).join(" · ")}
    </div></div>`).join("")
  : elenco.map(c => `
    <div class="carta"><div class="nome">${c.icona} ${esc(c.titolo)}</div>
    <div class="nota" style="margin-top:6px;line-height:1.6">${esc(c.testo)}</div></div>`).join("")}`;
}

/* ---- scheda PIANO ---- */
function vPiano() {
  const c = S.cfg;
  return `
  <header class="testa">
    <div class="data">impostazioni</div>
    <h1 class="grande" style="font-size:34px">Il tuo piano</h1>
    <div class="sotto">${c.url ? (S.sync || "collegato al foglio") : "foglio non ancora collegato"}${S.coda.length ? " · " + S.coda.length + " in coda" : ""}</div>
  </header>

  <h2 class="sez">Collegamento</h2>
  <label class="et">Indirizzo dell'app web di Apps Script</label>
  <input class="campo" id="url" value="${esc(c.url)}" placeholder="https://script.google.com/macros/s/.../exec">
  <label class="et">Parola segreta, la stessa scritta in Codice.gs</label>
  <input class="campo" id="token" value="${esc(c.token)}" placeholder="cambia-questa-parola-segreta">
  <div class="fila" style="margin-top:12px">
    <button class="btn" id="salvaColl">Salva e collega</button>
    <button class="btn vuoto" id="prepara">Prepara i fogli</button>
  </div>
  <div id="esitoColl"></div>

  <h2 class="sez">Obiettivi</h2>
  ${c.obiettivi.map(o => `
    <div class="carta" style="display:flex;align-items:center;gap:11px;padding:11px 13px;opacity:${o.attivo?1:.55}">
      <span class="tacca" style="background:${o.colore};height:26px"></span>
      <div class="corpo">
        <div class="nome">${o.emoji} ${esc(o.label)}</div>
        <div class="nota">${esc(o.nota)}</div>
      </div>
      ${o.attivo && o.tipo === "count" ? `<div class="step">
        <button data-target="${o.id}" data-delta="-1">−</button><span>${o.target}</span>
        <button data-target="${o.id}" data-delta="1">+</button></div>` : ""}
      <button class="sw ${o.attivo?"on":""}" data-attiva="${o.id}"><i></i></button>
    </div>`).join("")}

  <h2 class="sez">Obiettivi macronutrienti</h2>
  <div class="fila">
    ${["proteine","grassi","carboidrati"].map(k => `
      <div style="flex:1;min-width:90px">
        <label class="et" style="margin-top:0;text-transform:capitalize">${k}</label>
        <input class="campo" type="number" data-macro="${k}" value="${c.macro[k]}">
      </div>`).join("")}
  </div>
  <div class="nota" style="margin-top:8px">Stima ricavata dalle grammature del piano. Vale la pena farla confermare alla dott.ssa Viti.</div>

  <h2 class="sez">Dati</h2>
  <div class="fila">
    <button class="btn vuoto" id="ricarica">Ricarica dal foglio</button>
    <button class="btn vuoto" id="apriFoglio">Apri il foglio</button>
  </div>
  <div class="nota" style="margin-top:26px;text-align:center">Versione 1.0</div>`;
}

/* ------------- eventi ------------- */
function collega() {
  const on = (sel, ev, f) => document.querySelectorAll(sel).forEach(e => e.addEventListener(ev, f));

  on("[data-tocca]", "click", e => {
    const b = e.currentTarget;
    tocca(b.dataset.data, b.dataset.tocca);
  });
  on("[data-giorno]", "click", e => { S.sel = e.currentTarget.dataset.giorno; disegna(); });
  on("[data-mese]", "click", e => {
    const [a, m] = S.mese.split("-").map(Number);
    const d = new Date(a, m - 1 + Number(e.currentTarget.dataset.mese), 1);
    S.sel = null;
    caricaMese(kMese(d));
  });
  on("[data-elimina]", "click", e => eliminaPasto(e.currentTarget.dataset.elimina));
  on("[data-momento]", "click", e => { S.momento = e.currentTarget.dataset.momento; disegna(); });
  on("[data-consigli]", "click", e => { S.consigli = e.currentTarget.dataset.consigli; disegna(); });

  const testo = document.getElementById("testo");
  if (testo) testo.addEventListener("input", e => { S.testo = e.target.value; });

  const mic = document.getElementById("mic");
  if (mic) mic.addEventListener("click", dettatura);

  const bStima = document.getElementById("stima");
  if (bStima) bStima.addEventListener("click", async () => {
    const t = (S.testo || "").trim();
    if (!t) return;
    bStima.disabled = true; bStima.textContent = "Sto calcolando…";
    const r = await stima(t, S.momento || momentoOra());
    S.bozza = r;
    disegna();
  });

  const bMan = document.getElementById("manuale");
  if (bMan) bMan.addEventListener("click", () => {
    S.bozza = { descrizione: (S.testo || "Pasto"), alimenti: [], proteine: 0, grassi: 0, carboidrati: 0, kcal: 0, fonte: "", manuale: true };
    disegna();
  });

  const conf = document.getElementById("conferma");
  if (conf) conf.addEventListener("click", () => {
    const b = S.bozza;
    salvaPasto({
      data: OGGI, momento: S.momento || momentoOra(), descrizione: b.descrizione,
      proteine: Math.round(b.proteine), grassi: Math.round(b.grassi),
      carboidrati: Math.round(b.carboidrati), kcal: Math.round(b.kcal || (b.proteine*4 + b.grassi*9 + b.carboidrati*4)),
      fonte: b.fonte || ""
    });
    S.bozza = null; S.testo = "";
    disegna();
  });

  const corr = document.getElementById("correggi");
  if (corr) corr.addEventListener("click", () => {
    const b = S.bozza;
    const q = (etichetta, valore) => { const v = prompt(etichetta, valore); return v === null ? valore : (Number(v) || 0); };
    b.descrizione = prompt("Descrizione", b.descrizione) || b.descrizione;
    b.proteine = q("Proteine in grammi", Math.round(b.proteine));
    b.grassi = q("Grassi in grammi", Math.round(b.grassi));
    b.carboidrati = q("Carboidrati in grammi", Math.round(b.carboidrati));
    const f = prompt("Fonte proteica: legumi, soia, uova, formaggi, burger, affettati, oppure vuoto", b.fonte || "");
    b.fonte = f === null ? b.fonte : f.trim();
    b.kcal = b.proteine * 4 + b.grassi * 9 + b.carboidrati * 4;
    disegna();
  });

  const ann = document.getElementById("annulla");
  if (ann) ann.addEventListener("click", () => { S.bozza = null; disegna(); });

  const sc = document.getElementById("salvaColl");
  if (sc) sc.addEventListener("click", async () => {
    S.cfg.url = document.getElementById("url").value.trim();
    S.cfg.token = document.getElementById("token").value.trim();
    L.set("cfg", S.cfg);
    const r = await chiama("ping");
    document.getElementById("esitoColl").innerHTML = r.ok
      ? `<div class="ok">Collegato al foglio “${esc(r.foglio)}”.</div>`
      : `<div class="errore">${esc(r.errore || "Nessuna risposta dal backend")}</div>`;
    if (r.ok) { await svuotaCoda(); caricaMese(S.mese); }
  });

  const pr = document.getElementById("prepara");
  if (pr) pr.addEventListener("click", async () => {
    const r = await chiama("prepara");
    document.getElementById("esitoColl").innerHTML = r.ok
      ? `<div class="ok">${esc(r.messaggio)}</div>` : `<div class="errore">${esc(r.errore)}</div>`;
  });

  on("[data-attiva]", "click", e => {
    const id = e.currentTarget.dataset.attiva;
    const o = S.cfg.obiettivi.find(x => x.id === id);
    o.attivo = !o.attivo;
    L.set("cfg", S.cfg); accoda("salvaConfig", { config: { obiettivi: S.cfg.obiettivi, macro: S.cfg.macro } });
    disegna();
  });
  on("[data-target]", "click", e => {
    const o = S.cfg.obiettivi.find(x => x.id === e.currentTarget.dataset.target);
    o.target = Math.max(1, o.target + Number(e.currentTarget.dataset.delta));
    L.set("cfg", S.cfg); disegna();
  });
  on("[data-macro]", "change", e => {
    S.cfg.macro[e.target.dataset.macro] = Number(e.target.value) || 0;
    L.set("cfg", S.cfg);
  });

  const ric = document.getElementById("ricarica");
  if (ric) ric.addEventListener("click", () => caricaMese(S.mese));
  const apri = document.getElementById("apriFoglio");
  if (apri) apri.addEventListener("click", () => {
    if (S.cfg.foglioUrl) window.open(S.cfg.foglioUrl, "_blank");
    else alert("Apri il foglio da Google Drive: è quello dove hai incollato Codice.gs.");
  });
}

/* ------------- dettatura vocale ------------- */
let RIC = null;
function dettatura() {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = document.getElementById("mic");
  if (!Rec) { avviso("Il riconoscimento vocale non è disponibile qui. Usa il microfono della tastiera."); return; }
  if (RIC) { RIC.stop(); RIC = null; mic.classList.remove("attivo"); return; }

  RIC = new Rec();
  RIC.lang = "it-IT";
  RIC.interimResults = true;
  RIC.continuous = false;
  const partenza = S.testo || "";
  mic.classList.add("attivo");

  RIC.onresult = ev => {
    let t = "";
    for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
    S.testo = (partenza ? partenza + " " : "") + t;
    const c = document.getElementById("testo");
    if (c) c.value = S.testo;
  };
  RIC.onerror = ev => { avviso("Microfono: " + ev.error); mic.classList.remove("attivo"); RIC = null; };
  RIC.onend = () => { mic.classList.remove("attivo"); RIC = null; };
  RIC.start();
}

function avviso(t) {
  const e = document.getElementById("stato");
  e.textContent = t; e.classList.add("mostra");
  document.body.style.paddingTop = "30px";
  setTimeout(mostraStato, 4000);
}

/* ------------- avvio ------------- */
document.querySelectorAll("nav button").forEach(b =>
  b.addEventListener("click", () => { S.tab = b.dataset.tab; S.bozza = null; disegna(); }));

window.addEventListener("online", () => { S.online = true; svuotaCoda(); mostraStato(); });
window.addEventListener("offline", () => { S.online = false; mostraStato(); });

(function avvio() {
  S.cfg = Object.assign({}, CFG_BASE, L.get("cfg", {}));
  // gli obiettivi salvati possono essere più vecchi del file piano.js: li fondo
  S.cfg.obiettivi = PIANO.obiettivi.map(d => Object.assign({}, d, (S.cfg.obiettivi || []).find(x => x.id === d.id) || {}));
  S.coda = L.get("coda", []);
  S.sel = OGGI;
  caricaMese(kMese(new Date()));
  svuotaCoda();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
})();
