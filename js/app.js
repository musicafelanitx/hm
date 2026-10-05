/* ==========================================================
   Història de la música · Conservatori de Felanitx
   Script comú: capçalera, peu i contingut de cada pàgina.
   Les dades es llegeixen de la carpeta /dades.
   ========================================================== */

const PAGINES = [
  { href: "index.html", text: "Inici" },
  { href: "4t.html", text: "4t" },
  { href: "5e.html", text: "5è" },
  { href: "6e.html", text: "6è" },
  { href: "linia-del-temps.html", text: "Línia del temps" },
  { href: "glossari.html", text: "Glossari" },
  { href: "audicions.html", text: "Entrena l'oïda" },
  { href: "recursos.html", text: "Recursos" }
];

const ORDRE_PERIODES = ["introduccio", "antiguitat", "edat-mitjana", "renaixement", "barroc", "classicisme", "romanticisme", "xx-xxi"];

const ICONES = {
  apunts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>',
  diapositives: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  fletxa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  musica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
};

/* ---------- Utilitats ---------- */

function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function colorDe(periode) {
  return `var(--${ORDRE_PERIODES.includes(periode) ? periode : "introduccio"})`;
}

function dosDigits(n) {
  return String(n).padStart(2, "0");
}

async function carrega(fitxer) {
  const resposta = await fetch(`dades/${fitxer}`, { cache: "no-cache" });
  if (!resposta.ok) throw new Error(`No s'ha pogut carregar ${fitxer}`);
  return resposta.json();
}

function mostraError(contenidor, error) {
  console.error(error);
  contenidor.innerHTML = `<p class="buit">No s'han pogut carregar les dades. Torna-ho a provar més tard.</p>`;
}

let periodesCache;
async function periodes() {
  if (!periodesCache) {
    const llista = await carrega("periodes.json");
    periodesCache = Object.fromEntries(llista.map(p => [p.id, p]));
    periodesCache._llista = llista;
  }
  return periodesCache;
}

/* ---------- Capçalera i peu ---------- */

function franja() {
  return `<div class="franja" aria-hidden="true">${ORDRE_PERIODES.slice(1).map(p => `<span style="background:${colorDe(p)}"></span>`).join("")}</div>`;
}

function pintaCapcalera() {
  const actual = location.pathname.split("/").pop() || "index.html";
  const capcalera = document.createElement("header");
  capcalera.className = "capcalera";
  capcalera.innerHTML = `
    ${franja()}
    <div class="contenidor">
      <a class="marca" href="index.html">
        <strong>Història de la música</strong>
        <small>Conservatori de Felanitx</small>
      </a>
      <button class="boto-menu" aria-expanded="false" aria-controls="menu">Menú</button>
      <nav class="menu" id="menu" aria-label="Principal">
        <ul>
          ${PAGINES.map(p => `<li><a href="${p.href}"${p.href === actual ? ' aria-current="page"' : ""}>${p.text}</a></li>`).join("")}
        </ul>
      </nav>
    </div>`;
  document.body.prepend(capcalera);

  const salta = document.createElement("a");
  salta.className = "salta";
  salta.href = "#contingut";
  salta.textContent = "Salta al contingut";
  document.body.prepend(salta);

  const boto = capcalera.querySelector(".boto-menu");
  const menu = capcalera.querySelector(".menu");
  boto.addEventListener("click", () => {
    const obert = menu.classList.toggle("obert");
    boto.setAttribute("aria-expanded", obert);
    boto.textContent = obert ? "Tanca" : "Menú";
  });
}

function pintaPeu() {
  const peu = document.createElement("footer");
  peu.className = "peu";
  peu.innerHTML = `
    <div class="contenidor">
      Miquel Àngel Llull, professor · <a href="mailto:capdestudis@musicafelanitx.com">capdestudis@musicafelanitx.com</a>
    </div>`;
  document.body.append(peu);
}

/* ---------- Inici ---------- */

const MESOS = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];

// «del 5 d'octubre», «de l'1 de desembre»
function delDia(data) {
  const dia = data.getDate();
  const mes = MESOS[data.getMonth()];
  const article = (dia === 1 || dia === 11) ? `de l'${dia}` : `del ${dia}`;
  return `${article} ${/^[aeiouà]/.test(mes) ? "d'" : "de "}${mes}`;
}

function dilluns(data) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

const SETMANA_MS = 7 * 24 * 60 * 60 * 1000;

// Quina obra toca aquesta setmana (i quantes setmanes han passat des de l'inici)
function obraActual(dades, avui = new Date()) {
  const [a, m, d] = dades.inici.split("-").map(Number);
  const setmanes = Math.max(0, Math.round((dilluns(avui) - dilluns(new Date(a, m - 1, d))) / SETMANA_MS));
  const n = dades.obres.length;
  const index = dades.fixa > 0 ? (dades.fixa - 1) % n : setmanes % n;
  return { index, setmanes };
}

function miniatura(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

async function paginaInici() {
  try {
    const per = await periodes();
    const llista = per._llista.filter(p => p.linia !== false);
    document.getElementById("mini-linia").innerHTML = llista.map(p => `<span style="background:${colorDe(p.id)}"></span>`).join("");
  } catch (e) { console.error(e); }

  const caixa = document.getElementById("obra-setmana");
  try {
    const [dades, per] = await Promise.all([carrega("obra-setmana.json"), periodes()]);
    const { index } = obraActual(dades);
    const obra = dades.obres[index];
    const color = colorDe(obra.periode);
    const nomPeriode = per[obra.periode]?.nom;
    const urlYouTube = `https://www.youtube.com/watch?v=${obra.youtube}`;

    caixa.innerHTML = `
      <article class="obra" style="--color:${color}">
        <div class="video">
          <button type="button" aria-label="Reprodueix ${esc(obra.titol)}">
            <img src="${miniatura(obra.youtube)}" alt="">
            <span class="play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg></span>
            <span class="avis-play">Escolta-la aquí</span>
          </button>
        </div>
        <div class="text">
          <p class="setmana">Setmana ${delDia(dilluns(new Date()))}</p>
          <h3>${esc(obra.titol)}</h3>
          <p class="autor">${esc(obra.autor)} · ${esc(obra.any)}${nomPeriode ? ` <span class="xip">${esc(nomPeriode)}</span>` : ""}</p>
          <div class="sabies"><strong>Sabies que…?</strong><p>${esc(obra.anecdota)}</p></div>
          <div class="accions">
            <a class="boto secundari" href="${urlYouTube}" target="_blank" rel="noopener">Obre-la a YouTube</a>
          </div>
        </div>
      </article>`;

    caixa.querySelector(".video button").addEventListener("click", e => {
      e.currentTarget.parentElement.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${obra.youtube}?autoplay=1&rel=0" title="${esc(obra.titol)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    });

  } catch (e) {
    mostraError(caixa, e);
  }
}

/* ---------- Pàgina de curs ---------- */

async function paginaCurs(clau) {
  const cap = document.getElementById("cap-curs");
  const cos = document.getElementById("sessions-curs");
  try {
    const [dades, per] = await Promise.all([carrega("sessions.json"), periodes()]);
    const curs = dades[clau];
    if (!curs) throw new Error(`El curs «${clau}» no existeix a sessions.json`);

    const colors = curs.periodes.map(colorDe);
    cap.style.background = `var(--curs-${clau})`;
    cap.innerHTML = `
      <div class="contenidor">
        <span class="etiqueta" style="color:rgba(255,255,255,.85)">Història de la música</span>
        <h1>${esc(curs.nom)}</h1>
        <p>${esc(curs.tema)}</p>
        <div class="periodes">${curs.periodes.map(p => `<span class="xip">${esc(per[p]?.nom || p)}</span>`).join("")}</div>
      </div>`;

    const color = colors[0];
    const materials = `
      <div class="materials">
        <a class="material" style="--color:${color}" href="${esc(curs.apunts)}" target="_blank" rel="noopener">
          <span class="icona">${ICONES.apunts}</span>
          <span><strong>Apunts</strong><span>Document amb tot el temari</span></span>
        </a>
        <a class="material" style="--color:${colors[colors.length - 1]}" href="${esc(curs.diapositives)}" target="_blank" rel="noopener">
          <span class="icona">${ICONES.diapositives}</span>
          <span><strong>Diapositives</strong><span>Carpeta amb totes les presentacions</span></span>
        </a>
      </div>`;

    // La primera classe d'avui en endavant és la «pròxima»
    const avui = isoAvui();
    const proxima = curs.trimestres.flatMap(t => t.sessions).find(s => s.data && s.data >= avui);

    const trimestres = curs.trimestres.map(t => `
      <section class="trimestre">
        <div class="cap-trimestre">
          <h2>${esc(t.nom)}${t.tema ? ` <span class="tema-trimestre">· ${esc(t.tema)}</span>` : ""}</h2>
          ${t.diapositives ? `<a class="boto secundari petit" style="--color:${colorTrimestre(t)}" href="${esc(t.diapositives)}" target="_blank" rel="noopener">${ICONES.diapositives}Diapositives del trimestre</a>` : ""}
        </div>
        ${t.sessions.length ? `<ul class="sessions">${t.sessions.map(s => targetaSessio(s, per, avui, proxima, colorTrimestre(t))).join("")}</ul>`
                            : `<p class="buit">Pròximament</p>`}
      </section>`).join("");

    cos.innerHTML = materials + trimestres;
  } catch (e) {
    mostraError(cos, e);
  }
}

function isoAvui() {
  const d = new Date();
  return `${d.getFullYear()}-${dosDigits(d.getMonth() + 1)}-${dosDigits(d.getDate())}`;
}

// «dimecres 7 d'octubre»
function dataLlarga(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  const data = new Date(a, m - 1, d);
  const dies = ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"];
  const mes = MESOS[m - 1];
  return `${dies[data.getDay()]} ${d} ${/^[aeiouà]/.test(mes) ? "d'" : "de "}${mes}`;
}

const ICONA_ACTIVITAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3 6.5 7 .9-5.1 4.8 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9z"/></svg>';

// Tot el trimestre amb un sol color: el del període de la primera sessió
function colorTrimestre(t) {
  return colorDe(t.periode || t.sessions.find(s => s.periode)?.periode);
}

function targetaSessio(s, per, avui, proxima, colorBase) {
  // Estat segons la data: feta (passada), pròxima (la següent) o futura
  const feta = s.data && s.data < avui;
  const esProxima = s === proxima;
  const color = feta ? "#9a9a9a" : colorBase;

  let quan = s.data ? dataLlarga(s.data) : "";
  if (feta) quan = `✓ ${quan}`;
  const etiqueta = esProxima ? `<span class="marca-proxima">${s.data === avui ? "Avui" : "Pròxima classe"}</span>` : "";

  const titol = s.titol || "Pròximament";
  const numero = s.activitat
    ? `<span class="numero icona-activitat">${ICONA_ACTIVITAT}</span>`
    : `<span class="numero"><span class="ocult">Sessió </span>${dosDigits(s.numero)}</span>`;
  const contingut = `
    ${numero}
    <span class="info">
      <span class="quan">${esc(quan)}${etiqueta}</span>
      <span class="titol">${esc(titol)}</span>
      ${s.subtitol ? `<span class="estat">${esc(s.subtitol)}</span>` : ""}
    </span>`;

  const classes = ["sessio", feta && "feta", esProxima && "proxima", !s.enllac && !s.activitat && "pendent", s.activitat && "activitat"].filter(Boolean).join(" ");
  if (s.enllac) {
    return `<li><a class="${classes}" style="--color:${color}" href="${esc(s.enllac)}" target="_blank" rel="noopener">${contingut}<span class="fletxa">${ICONES.fletxa}</span></a></li>`;
  }
  return `<li><div class="${classes}" style="--color:${color}">${contingut}</div></li>`;
}

/* ---------- Recursos ---------- */

function urlEmbedSpotify(url) {
  const m = url.match(/open\.spotify\.com\/(playlist|show|episode|album|track)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

// Si l'enllaç és un vídeo de YouTube, en mostra la miniatura
function miniaturaYouTube(url) {
  const m = url.match(/youtube\.com\/watch\?v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
  const id = m && (m[1] || m[2]);
  return id ? `<img class="miniatura" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">` : "";
}

// Targeta d'un recurs: enllaç, llibre o pendent
function targetaRecurs(r) {
  if (r.autor) {
    return `<div class="targeta llibre">
      <strong>${esc(r.titol)}</strong>
      <span class="autor-llibre">${esc(r.autor)}</span>
      ${r.detalls ? `<span class="detalls">${esc(r.detalls)}</span>` : ""}
      ${r.descripcio ? `<span>${esc(r.descripcio)}</span>` : ""}
      ${r.grans ? '<span class="avis">Per als més grans</span>' : ""}
    </div>`;
  }
  if (r.enllac) {
    return `<a class="targeta" href="${esc(r.enllac)}" target="_blank" rel="noopener">${miniaturaYouTube(r.enllac)}<strong>${esc(r.titol)}</strong>${r.descripcio ? `<span>${esc(r.descripcio)}</span>` : ""}</a>`;
  }
  return `<div class="targeta pendent"><strong>${esc(r.titol)}</strong><span>${esc(r.descripcio || "Enllaç pendent")}</span></div>`;
}

// Cada grup ocupa tota l'amplada; els fons alternen blanc i beix (vegeu .grup-recursos al CSS)
function grupRecursos(titol, descripcio, contingut, grans = false) {
  return `
    <section class="grup-recursos">
      <div class="contenidor">
        <header class="titol-seccio">
          <h2>${esc(titol)}${grans ? ' <span class="avis">Per als més grans</span>' : ""}</h2>
          ${descripcio ? `<p>${esc(descripcio)}</p>` : ""}
        </header>
        ${contingut}
      </div>
    </section>`;
}

async function paginaRecursos() {
  const cos = document.getElementById("llista-recursos");
  try {
    const dades = await carrega("recursos.json");
    const spotify = grupRecursos("Spotify", "Música i podcasts per escoltar a casa.", `
      <div class="spotify">
        ${dades.spotify.map(r => {
          const embed = urlEmbedSpotify(r.enllac);
          return `<figure>
            <figcaption>${esc(r.titol)}<span>${esc(r.descripcio)}</span></figcaption>
            ${embed ? `<iframe src="${embed}" loading="lazy" title="${esc(r.titol)} a Spotify" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>` : ""}
            <p><a href="${esc(r.enllac)}" target="_blank" rel="noopener">Obre a Spotify</a></p>
          </figure>`;
        }).join("")}
      </div>`);

    const grups = dades.grups.map(g =>
      grupRecursos(g.titol, g.descripcio, `<div class="targetes">${g.recursos.map(targetaRecurs).join("")}</div>`, g.grans)
    ).join("");

    cos.innerHTML = spotify + grups;
  } catch (e) {
    mostraError(cos, e);
  }
}

/* ---------- Línia del temps ---------- */

async function paginaLinia() {
  const pista = document.getElementById("pista");
  const detall = document.getElementById("detall");
  try {
    const llista = (await periodes())._llista.filter(p => p.linia !== false);

    pista.innerHTML = llista.map((p, i) => `
      <li role="presentation">
        <button class="periode" role="tab" id="tab-${p.id}" aria-controls="detall" aria-selected="false" tabindex="-1"
                data-index="${i}" style="--color:${colorDe(p.id)}">
          <span class="nom">${esc(p.nom)}</span>
          <span class="dates">${esc(p.dates)}</span>
        </button>
      </li>`).join("");

    const botons = [...pista.querySelectorAll(".periode")];

    function selecciona(i, focus = false) {
      const p = llista[i];
      botons.forEach((b, j) => {
        b.setAttribute("aria-selected", j === i);
        b.tabIndex = j === i ? 0 : -1;
      });
      if (focus) botons[i].focus();
      detall.style.setProperty("--color", colorDe(p.id));
      detall.setAttribute("aria-labelledby", `tab-${p.id}`);
      const pagCurs = { "4t": "4t.html", "5è": "5e.html", "6è": "6e.html" }[p.curs];
      detall.innerHTML = `
        <h2>${esc(p.nom)}</h2>
        <p class="dates">${esc(p.dates)}</p>
        <p>${esc(p.resum)}</p>
        <div class="columnes">
          <div><h3>Noms clau</h3><ul class="noms">${p.noms.map(n => `<li>${esc(n)}</li>`).join("")}</ul></div>
          <div><h3>Característiques</h3><ul>${p.caracteristiques.map(n => `<li>${esc(n)}</li>`).join("")}</ul></div>
        </div>
        <div class="peu-detall">
          ${pagCurs ? `<a class="boto" style="--color:${colorDe(p.id)}" href="${pagCurs}">Ho estudiam a ${esc(p.curs)}</a>` : ""}
        </div>
        <div class="navega">
          <button class="boto secundari" data-mou="-1" ${i === 0 ? "disabled hidden" : ""}>← ${esc(llista[i - 1]?.nom || "")}</button>
          <button class="boto secundari" data-mou="1" ${i === llista.length - 1 ? "disabled hidden" : ""}>${esc(llista[i + 1]?.nom || "")} →</button>
        </div>`;
      detall.querySelectorAll("[data-mou]").forEach(b =>
        b.addEventListener("click", () => selecciona(i + Number(b.dataset.mou))));
      history.replaceState(null, "", `#${p.id}`);
    }

    pista.addEventListener("click", e => {
      const b = e.target.closest(".periode");
      if (!b) return;
      selecciona(Number(b.dataset.index));
      // Al mòbil, la fitxa queda sota la llista: hi baixam perquè es vegi
      if (matchMedia("(max-width: 720px)").matches) detall.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    pista.addEventListener("keydown", e => {
      const actual = botons.indexOf(document.activeElement);
      if (actual < 0) return;
      const tecles = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let nou = null;
      if (e.key in tecles) nou = (actual + tecles[e.key] + botons.length) % botons.length;
      if (e.key === "Home") nou = 0;
      if (e.key === "End") nou = botons.length - 1;
      if (nou !== null) { e.preventDefault(); selecciona(nou, true); }
    });

    const inicial = llista.findIndex(p => p.id === location.hash.slice(1));
    selecciona(inicial >= 0 ? inicial : 0);
  } catch (e) {
    mostraError(detall, e);
  }
}

/* ---------- Glossari ---------- */

// Treu accents i majúscules perquè la cerca trobi «melismatic» o «melismàtic»
function normalitza(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/·/g, "");
}

async function paginaGlossari() {
  const llista = document.getElementById("llista-glossari");
  const cerca = document.getElementById("cerca-glossari");
  const filtre = document.getElementById("filtre-periode");
  const recompte = document.getElementById("recompte-glossari");
  try {
    const [termes, per] = await Promise.all([carrega("glossari.json"), periodes()]);
    const ordrePeriodes = per._llista.filter(p => p.linia !== false);
    let periodeActiu = "";

    filtre.innerHTML = `<button type="button" class="xip-filtre" aria-pressed="true" data-periode="">Tots</button>` +
      ordrePeriodes.map(p => `<button type="button" class="xip-filtre" aria-pressed="false" data-periode="${p.id}" style="--color:${colorDe(p.id)}">${esc(p.nom)}</button>`).join("");

    function pinta() {
      const q = normalitza(cerca.value.trim());
      const visibles = termes.filter(t =>
        (!periodeActiu || t.periode === periodeActiu) &&
        (!q || normalitza(t.terme + " " + t.definicio).includes(q)));
      recompte.textContent = `${visibles.length} ${visibles.length === 1 ? "terme" : "termes"}`;
      llista.innerHTML = visibles.length ? visibles.map(t => `
        <article class="terme" style="--color:${colorDe(t.periode)}">
          <header>
            <h2>${esc(t.terme)}</h2>
            <span class="xip">${esc(per[t.periode]?.nom || "")}</span>
          </header>
          <p>${esc(t.definicio)}</p>
          ${t.exemple ? `<a class="exemple" href="${esc(t.exemple.enllac)}" target="_blank" rel="noopener">
            ${ICONES.musica}<span><strong>Escolta'n un exemple</strong> ${esc(t.exemple.autor)} · <em>${esc(t.exemple.obra)}</em></span>
          </a>` : ""}
        </article>`).join("")
        : `<p class="buit">No hi ha cap terme que coincideixi amb la cerca.</p>`;
    }

    cerca.addEventListener("input", pinta);
    filtre.addEventListener("click", e => {
      const b = e.target.closest(".xip-filtre");
      if (!b) return;
      periodeActiu = b.dataset.periode;
      filtre.querySelectorAll(".xip-filtre").forEach(x => x.setAttribute("aria-pressed", x === b));
      pinta();
    });
    pinta();
  } catch (e) {
    mostraError(llista, e);
  }
}

/* ---------- Entrena l'oïda ---------- */

const PERIODES_CURS = {
  "4t": ["antiguitat", "edat-mitjana", "renaixement"],
  "5e": ["barroc", "classicisme"],
  "6e": ["romanticisme", "xx-xxi"]
};
const DURADA_FRAGMENT = 30; // segons

function barreja(llista) {
  const a = [...llista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mmss(segons) {
  const s = Math.max(0, Math.round(segons));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

async function paginaAudicions() {
  const $ = id => document.getElementById(id);
  let obres, per;
  try {
    [obres, per] = await Promise.all([carrega("audicions.json"), periodes()]);
    // Si una obra només té l'arxiu OGG i el navegador no el pot sonar (iPhone), no la feim servir
    const potOgg = new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== "";
    obres = obres.filter(o => o.mp3 || potOgg);
  } catch (e) {
    mostraError($("joc"), e);
    return;
  }

  $("llista-credits").innerHTML = obres.map(o => `
    <li><em>${esc(o.titol)}</em> (${esc(o.autor)}) · ${esc(o.interpret || "Intèrpret desconegut")} ·
      <a href="${esc(o.pagina)}" target="_blank" rel="noopener">${esc(o.llicencia)}</a></li>`).join("");

  const audio = new Audio();
  audio.preload = "auto";
  let partida = null;

  function aturaAudio() {
    audio.pause();
    $("joc-play").classList.remove("sona");
    $("joc-estat").textContent = "Torna a escoltar el fragment";
  }

  function carregaAudio(obra) {
    audio.src = obra.mp3 || obra.original;
    audio.onerror = () => { if (obra.mp3 && audio.src !== obra.original) audio.src = obra.original; };
  }

  function tocaFragment() {
    const p = partida;
    const obra = p.preguntes[p.n];
    const comenca = () => {
      if (p.inici == null) {
        // Un punt d'inici a l'atzar, evitant el principi i el final de l'obra
        const d = audio.duration || 0;
        const marge = Math.min(d * 0.1, 20);
        const max = Math.max(marge, d - DURADA_FRAGMENT - 5);
        p.inici = d > DURADA_FRAGMENT + 10 ? marge + Math.random() * (max - marge) : 0;
      }
      audio.currentTime = p.inici;
      audio.play().catch(() => {});
      $("joc-play").classList.add("sona");
      $("joc-estat").textContent = "Escoltant…";
    };
    if (audio.readyState >= 1) comenca();
    else audio.addEventListener("loadedmetadata", comenca, { once: true });
  }

  audio.addEventListener("timeupdate", () => {
    if (!partida || partida.respost) return;
    const passat = audio.currentTime - (partida.inici || 0);
    $("joc-temps").textContent = `${mmss(passat)} / ${mmss(DURADA_FRAGMENT)}`;
    if (passat >= DURADA_FRAGMENT) aturaAudio();
  });
  audio.addEventListener("ended", aturaAudio);

  $("joc-play").addEventListener("click", () => {
    if (!audio.paused) { aturaAudio(); return; }
    if (partida.respost) { audio.play(); $("joc-play").classList.add("sona"); $("joc-estat").textContent = "Escoltant l'obra"; return; }
    tocaFragment();
  });

  function opcionsPer(tipus, obra, pool) {
    if (tipus === "periode") {
      const ids = [...new Set(pool.map(o => o.periode))];
      return ORDRE_PERIODES.filter(id => ids.includes(id)).map(id => ({ valor: id, text: per[id]?.nom || id }));
    }
    // Compositor o gènere: la correcta i tres més, preferint les del mateix període
    const valors = o => o[tipus];
    const propers = barreja([...new Set(pool.filter(o => o.periode === obra.periode).map(valors))]);
    const altres = barreja([...new Set(pool.map(valors))]);
    const tria = [obra[tipus]];
    for (const v of [...propers, ...altres]) {
      if (tria.length >= 4) break;
      if (!tria.includes(v)) tria.push(v);
    }
    return barreja(tria).map(v => ({ valor: v, text: v }));
  }

  const ENUNCIATS = { periode: "De quin període és?", autor: "Qui l'ha composta?", genere: "Quin gènere és?" };

  function mostraPregunta() {
    const p = partida;
    const obra = p.preguntes[p.n];
    p.respost = false;
    p.inici = null;
    carregaAudio(obra);
    $("joc-progres").textContent = `Pregunta ${p.n + 1} de ${p.preguntes.length}`;
    $("joc-punts").textContent = `${p.encerts} ${p.encerts === 1 ? "encert" : "encerts"}`;
    $("joc-barra").style.width = `${(p.n / p.preguntes.length) * 100}%`;
    $("joc-enunciat").textContent = ENUNCIATS[p.tipus];
    $("joc-estat").textContent = "Escolta el fragment";
    $("joc-temps").textContent = `0:00 / ${mmss(DURADA_FRAGMENT)}`;
    $("joc-play").classList.remove("sona");
    $("joc-solucio").hidden = true;
    $("joc-seguent").hidden = true;
    $("joc-respostes").innerHTML = opcionsPer(p.tipus, obra, p.pool).map(o => {
      const estil = p.tipus === "periode" ? ` style="--color:${colorDe(o.valor)}"` : "";
      return `<button type="button" class="resposta${p.tipus === "periode" ? " de-periode" : ""}" data-valor="${esc(o.valor)}"${estil}>${esc(o.text)}</button>`;
    }).join("");
  }

  $("joc-respostes").addEventListener("click", e => {
    const b = e.target.closest(".resposta");
    const p = partida;
    if (!b || p.respost) return;
    p.respost = true;
    const obra = p.preguntes[p.n];
    const correcta = String(obra[p.tipus]);
    const encert = b.dataset.valor === correcta;
    if (encert) p.encerts++;
    p.resultats.push({ obra, encert });
    $("joc-respostes").querySelectorAll(".resposta").forEach(x => {
      x.disabled = true;
      if (x.dataset.valor === correcta) x.classList.add("correcta");
      else if (x === b) x.classList.add("incorrecta");
    });
    $("joc-punts").textContent = `${p.encerts} ${p.encerts === 1 ? "encert" : "encerts"}`;
    $("joc-solucio").hidden = false;
    $("joc-solucio").style.setProperty("--color", colorDe(obra.periode));
    $("joc-solucio").innerHTML = `
      <p class="veredicte ${encert ? "be" : "malament"}">${encert ? "Correcte!" : "No és correcte."}</p>
      <h3>${esc(obra.titol)}</h3>
      <p class="autor">${esc(obra.autor)} · ${esc(obra.any)} <span class="xip">${esc(per[obra.periode]?.nom || "")}</span></p>
      <p class="genere">Gènere: ${esc(obra.genere)}</p>
      <p class="credit">Enregistrament: ${esc(obra.interpret || "intèrpret desconegut")} · <a href="${esc(obra.pagina)}" target="_blank" rel="noopener">${esc(obra.llicencia)}</a></p>`;
    $("joc-seguent").hidden = false;
    $("joc-seguent").textContent = p.n + 1 < p.preguntes.length ? "Següent" : "Veure el resultat";
    $("joc-estat").textContent = audio.paused ? "Escolta l'obra" : "Escoltant l'obra";
  });

  $("joc-seguent").addEventListener("click", () => {
    audio.pause();
    partida.n++;
    if (partida.n < partida.preguntes.length) mostraPregunta();
    else mostraFinal();
  });

  function mostraFinal() {
    const p = partida;
    const total = p.preguntes.length;
    const missatge = p.encerts >= total * 0.9 ? "Excel·lent! Tens molt bona oïda."
      : p.encerts >= total * 0.7 ? "Molt bé! Vas per bon camí."
      : p.encerts >= total * 0.5 ? "Bé, però encara pots millorar."
      : "Cal escoltar més. Torna-hi!";
    $("joc-pregunta").hidden = true;
    $("joc-final").hidden = false;
    $("joc-final").innerHTML = `
      <p class="nota">${p.encerts}<span>/${total}</span></p>
      <p class="missatge">${missatge}</p>
      <ol class="repas">${p.resultats.map(r => `
        <li class="${r.encert ? "be" : "malament"}"><span aria-hidden="true">${r.encert ? "✓" : "✗"}</span>
          <span><strong>${esc(r.obra.titol)}</strong> · ${esc(r.obra.autor)} <em>(${esc(per[r.obra.periode]?.nom || "")}, ${esc(r.obra.genere)})</em></span></li>`).join("")}
      </ol>
      <div class="accions-final">
        <button class="boto" type="button" id="joc-repeteix">Torna-hi</button>
        <button class="boto secundari" type="button" id="joc-canvia">Canvia les opcions</button>
      </div>`;
    $("joc-repeteix").addEventListener("click", comenca);
    $("joc-canvia").addEventListener("click", () => {
      $("joc-final").hidden = true;
      $("joc-config").hidden = false;
    });
  }

  function comenca() {
    const tipus = document.querySelector('input[name="tipus"]:checked').value;
    const curs = document.querySelector('input[name="curs"]:checked').value;
    const pool = curs ? obres.filter(o => PERIODES_CURS[curs].includes(o.periode)) : obres;
    partida = { tipus, pool, preguntes: barreja(pool).slice(0, 10), n: 0, encerts: 0, resultats: [] };
    $("joc-config").hidden = true;
    $("joc-final").hidden = true;
    $("joc-pregunta").hidden = false;
    mostraPregunta();
  }

  $("joc-comenca").addEventListener("click", comenca);
}

/* ---------- App al mòbil ---------- */

function preparaApp() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(e => console.warn("Service worker:", e));
  }

  const boto = document.getElementById("instal-la");
  if (!boto) return;

  const jaInstallada = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const esMobil = matchMedia("(pointer: coarse)").matches;
  if (jaInstallada || !esMobil) return;

  const esIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);

  if (esIOS) {
    // A l'iPhone no es pot instal·lar amb un botó: mostram com fer-ho
    boto.hidden = false;
    boto.addEventListener("click", () => document.getElementById("dialeg-ios").showModal());
    return;
  }

  // Android (Chrome, Edge, Samsung…): el navegador ens deixa obrir el seu avís d'instal·lació
  let avis = null;
  addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    avis = e;
    boto.hidden = false;
  });
  boto.addEventListener("click", async () => {
    if (!avis) return;
    avis.prompt();
    await avis.userChoice;
    avis = null;
    boto.hidden = true;
  });
  addEventListener("appinstalled", () => { boto.hidden = true; });
}

/* ---------- Arrencada ---------- */

document.addEventListener("DOMContentLoaded", () => {
  pintaCapcalera();
  pintaPeu();
  preparaApp();
  const pagina = document.body.dataset.pagina;
  if (pagina === "inici") paginaInici();
  else if (pagina === "curs") paginaCurs(document.body.dataset.curs);
  else if (pagina === "recursos") paginaRecursos();
  else if (pagina === "linia") paginaLinia();
  else if (pagina === "glossari") paginaGlossari();
  else if (pagina === "audicions") paginaAudicions();
});
