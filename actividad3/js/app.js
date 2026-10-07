/**
 * app.js — Capa de interfaz (DOM). No contiene la lógica del algoritmo:
 * la Programación Dinámica vive en js/dp.js (objeto global DP).
 *
 * Secciones: datos de entrada, visualizador paso a paso (llenado de la tabla
 * dp + reconstrucción), resultados (agenda, comparación con voraces, ahorro).
 */
(function () {
  "use strict";

  const EJEMPLO = [
    ["Apertura", "08:00", "09:30", 120],
    ["Inteligencia Artificial", "09:00", "10:30", 200],
    ["Big Data", "09:30", "11:00", 90],
    ["Redes 5G", "10:30", "12:00", 80],
    ["Cloud Computing", "11:00", "12:30", 100],
    ["Ciberseguridad", "12:00", "13:30", 180],
    ["Desarrollo Web", "13:00", "14:30", 110],
    ["Apps Móviles", "14:30", "16:00", 70],
    ["Taller de Git", "15:00", "17:00", 150],
    ["Cierre", "16:00", "17:30", 60],
    ["Hackathon (maratón)", "07:30", "13:00", 300],
  ];

  // Caso pequeño donde los dos voraces fallan: sirve para explicar en la sustentación.
  const TRAMPA = [
    ["Charla A", "08:00", "09:00", 10],
    ["Charla B", "09:00", "10:00", 10],
    ["Charla grande", "08:00", "10:00", 100],
    ["Panel X", "10:00", "12:00", 50],
    ["Panel Y", "12:00", "14:00", 50],
    ["Keynote", "10:00", "14:00", 60],
  ];

  const TEMAS = [
    "Machine Learning", "Blockchain", "UX Research", "DevOps", "Robótica", "Computación Cuántica",
    "Realidad Virtual", "Bases de Datos", "IoT", "Visión por Computador", "Videojuegos", "Ética en IA",
    "Microservicios", "Ciencia de Datos", "Rust", "Startups",
  ];

  let actividades = [];
  let r = null;          // resultado de DP.agendaOptima
  let pasos = [];        // pasos del visualizador
  let paso = 0;
  let temporizador = null;

  const $ = (id) => document.getElementById(id);
  const el = {
    form: $("form-actividad"), nombre: $("nombre"), inicio: $("inicio"), fin: $("fin"), peso: $("peso"),
    error: $("error"), tabla: $("tabla-actividades"), vacio: $("vacio"), contador: $("contador"),
    resultado: $("resultado"), resumen: $("resumen"), tablaDp: $("tabla-dp").querySelector("tbody"),
    timeline: $("linea-tiempo"), comparacion: $("comparacion"), nota: $("comparacion-nota"),
    kpis: $("kpis"), ahorro: $("ahorro"),
    vCeldas: $("v-celdas"), vGantt: $("v-gantt"), vLeyenda: $("v-leyenda"), vFormula: $("v-formula"),
    vFase: $("v-fase"), vTexto: $("v-texto"), vContador: $("v-contador"), vBarra: $("v-barra"),
    vPlay: $("v-play"), vPrev: $("v-prev"), vNext: $("v-next"), vInicio: $("v-inicio"), vFin: $("v-fin"), vVel: $("v-vel"),
  };

  /* ---------- utilidades ---------- */
  const fmt = (x) => (typeof x === "bigint" ? x : Number(x)).toLocaleString("es-CO");

  function crear(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  /** Construye HTML a partir de partes; los textos se escapan (evita inyección). */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const mostrarError = (msg) => { el.error.textContent = msg || ""; };

  /* ---------- datos de entrada ---------- */
  function renderTabla() {
    el.tabla.innerHTML = "";
    actividades.forEach((a, i) => {
      const tr = crear("tr");
      tr.append(
        crear("td", "", a.nombre), crear("td", "", DP.aHHMM(a.inicio)),
        crear("td", "", DP.aHHMM(a.fin)), crear("td", "der", fmt(a.peso))
      );
      const td = crear("td", "der");
      const btn = crear("button", "quitar", "✕");
      btn.type = "button"; btn.title = `Eliminar "${a.nombre}"`;
      btn.addEventListener("click", () => { actividades.splice(i, 1); invalidar(); });
      td.appendChild(btn); tr.appendChild(td);
      el.tabla.appendChild(tr);
    });
    const n = actividades.length;
    el.vacio.hidden = n > 0;
    el.contador.textContent = n
      ? `${n} charla${n === 1 ? "" : "s"} · ${fmt(2n ** BigInt(n))} combinaciones posibles para fuerza bruta`
      : "";
  }

  function agregar(nombre, inicioHHMM, finHHMM, peso) {
    if (!inicioHHMM || !finHHMM) throw new Error("Indica la hora de inicio y de fin.");
    const nueva = { nombre: nombre.trim(), inicio: DP.aMinutos(inicioHHMM), fin: DP.aMinutos(finHHMM), peso: Number(peso) };
    DP.validar(nueva); // lanza Error si es inválida
    actividades.push(nueva);
  }

  function cargar(lista) {
    actividades = [];
    lista.forEach(([n, i, f, p]) => agregar(n, i, f, p));
    invalidar();
  }

  function aleatorio() {
    const temas = [...TEMAS].sort(() => Math.random() - 0.5).slice(0, 7 + Math.floor(Math.random() * 4));
    actividades = temas.map((nombre) => {
      const inicio = 7 * 60 + Math.floor(Math.random() * 20) * 30;
      const fin = inicio + (2 + Math.floor(Math.random() * 5)) * 30;
      return { nombre, inicio, fin, peso: 40 + Math.floor(Math.random() * 27) * 10 };
    });
    invalidar();
  }

  /** Cuando cambian los datos, el resultado anterior deja de ser válido. */
  function invalidar() {
    detener();
    mostrarError("");
    el.resultado.hidden = true;
    r = null;
    renderTabla();
  }

  /* ---------- diagrama de Gantt ---------- */
  function renderGantt(cont, lista, claseDe, opciones = {}) {
    cont.innerHTML = "";
    if (!lista.length) return;
    const min = Math.floor(Math.min(...lista.map((a) => a.inicio)) / 60) * 60;
    const max = Math.ceil(Math.max(...lista.map((a) => a.fin)) / 60) * 60;
    const rango = Math.max(max - min, 60);
    const pct = (m) => ((m - min) / rango) * 100;

    const cuerpo = crear("div", "g-cuerpo");
    lista.forEach((a, k) => {
      const fila = crear("div", "g-fila");
      const nombre = crear("div", "g-nombre");
      if (opciones.numerar) nombre.appendChild(crear("b", "", String(k + 1)));
      nombre.appendChild(document.createTextNode(a.nombre));
      nombre.title = `${a.nombre} · ${DP.aHHMM(a.inicio)}–${DP.aHHMM(a.fin)} · ${a.peso} asistentes`;
      const pista = crear("div", "g-pista");
      const barra = crear("div", "g-barra " + claseDe(a, k + 1), String(a.peso));
      barra.style.left = pct(a.inicio) + "%";
      barra.style.width = pct(a.fin) - pct(a.inicio) + "%";
      barra.title = nombre.title;
      pista.appendChild(barra);
      fila.append(nombre, pista);
      cuerpo.appendChild(fila);
    });

    // Eje de horas, alineado con las pistas
    const eje = crear("div", "g-fila");
    eje.appendChild(crear("div"));
    const marcas = crear("div", "g-eje");
    const salto = rango > 10 * 60 ? 120 : 60;
    for (let m = min; m <= max; m += salto) {
      const s = crear("span", "", DP.aHHMM(m));
      s.style.left = pct(m) + "%";
      marcas.appendChild(s);
    }
    eje.appendChild(marcas);
    cont.append(cuerpo, eje);

    // Línea guía vertical (inicio de la charla actual)
    if (opciones.guia !== undefined) {
      const primera = cuerpo.querySelector(".g-pista");
      const guia = crear("div", "g-guia");
      guia.style.left = `calc(${primera.offsetLeft}px + ${pct(opciones.guia) / 100} * ${primera.offsetWidth}px)`;
      cuerpo.appendChild(guia);
    }
  }

  /* ---------- visualizador paso a paso ---------- */
  function construirPasos() {
    pasos = [{ tipo: "base" }];
    r.pasos.forEach((s) => pasos.push({ tipo: "llenado", s }));
    r.traza.forEach((t, k) => pasos.push({ tipo: "recon", t, k }));
    pasos.push({ tipo: "fin" });
  }

  function leyenda(items) {
    el.vLeyenda.innerHTML = items.map(([c, t]) => `<span><i class="mk ${c}"></i> ${t}</span>`).join("");
  }

  function renderCeldas(estado) {
    el.vCeldas.innerHTML = "";
    r.dp.forEach((v, j) => {
      const info = estado(j);
      const c = crear("div", "celda " + (info.clase || ""));
      c.append(crear("div", "idx", `dp[${j}]`), crear("div", "val", info.oculto ? "?" : fmt(v)));
      if (info.tag) c.appendChild(crear("span", "tag", info.tag));
      el.vCeldas.appendChild(c);
    });
    const actual = el.vCeldas.querySelector(".actual");
    if (actual) {
      const cont = el.vCeldas.parentElement;
      cont.scrollLeft = actual.offsetLeft - cont.clientWidth / 2 + actual.offsetWidth / 2;
    }
  }

  function renderPaso() {
    const P = pasos[paso];
    const n = r.ordenadas.length;
    let filaActiva = -1;

    if (P.tipo === "base") {
      el.vFase.textContent = "Caso base"; el.vFase.className = "pill";
      el.vTexto.textContent = "Antes de mirar cualquier charla, el mejor resultado posible es 0.";
      el.vFormula.innerHTML = `<span class="res">dp[0] = 0</span> <span class="linea2">← sin charlas no hay asistentes</span>`;
      renderCeldas((j) => (j === 0 ? { clase: "actual", tag: "base" } : { clase: "vacia", oculto: true }));
      renderGantt(el.vGantt, r.ordenadas, () => "pendiente", { numerar: true });
      leyenda([["desc", "Aún no evaluada"]]);
      filaActiva = 0;
    } else if (P.tipo === "llenado") {
      const s = P.s, i = s.i, a = s.actividad, pi = s.p;
      el.vFase.textContent = `Llenando la tabla · i = ${i}`; el.vFase.className = "pill";
      el.vTexto.innerHTML = `¿Conviene programar <strong>${esc(a.nombre)}</strong> (${DP.aHHMM(a.inicio)}–${DP.aHHMM(a.fin)}, ${fmt(a.peso)} asistentes)? ` +
        (pi === 0 ? "Ninguna charla anterior termina antes de que empiece, así que p(i) = 0."
          : pi === 1 ? `Solo la charla 1 termina antes de que empiece, así que p(${i}) = 1.`
          : `Las charlas 1..${pi} terminan antes de que empiece, así que p(${i}) = ${pi}.`);
      const gana = s.toma ? "si" : "no";
      el.vFormula.innerHTML =
        `dp[${i}] = max( <span class="op no ${gana === "no" ? "gana" : ""}">dp[${i - 1}]</span> , ` +
        `<span class="op si ${gana === "si" ? "gana" : ""}">w<sub>${i}</sub> + dp[${pi}]</span> )<br>` +
        `<span class="linea2">= max( ${fmt(s.sinTomar)} , ${fmt(a.peso)} + ${fmt(r.dp[pi])} ) = max( ${fmt(s.sinTomar)} , ${fmt(s.tomando)} ) =</span> ` +
        `<span class="res">${fmt(s.valor)}</span> <span class="linea2">→ ${s.toma ? "TOMAR la charla" : "NO tomarla"}</span>`;
      renderCeldas((j) => {
        if (j === i) return { clase: "actual", tag: "calculando" };
        if (j > i) return { clase: "vacia", oculto: true };
        if (j === pi && j === i - 1) return { clase: "dep-si", tag: "ambas" };
        if (j === pi) return { clase: "dep-si", tag: "tomar" };
        if (j === i - 1) return { clase: "dep-no", tag: "no tomar" };
        return {};
      });
      renderGantt(el.vGantt, r.ordenadas, (_, k) =>
        k === i ? "actual" : k > i ? "pendiente" : k <= pi ? "compatible" : "choca",
      { numerar: true, guia: a.inicio });
      leyenda([["actual", "Charla i"], ["compatible", "Compatibles (1..p(i))"], ["choca", "Se cruzan con i"], ["desc", "Aún no evaluadas"]]);
      filaActiva = i;
    } else if (P.tipo === "recon") {
      const t = P.t, a = r.ordenadas[t.i - 1];
      const elegidas = new Set(r.traza.slice(0, P.k + 1).filter((x) => x.toma).map((x) => x.i));
      const visitadas = new Set(r.traza.slice(0, P.k + 1).map((x) => x.i));
      el.vFase.textContent = "Reconstrucción"; el.vFase.className = "pill recon";
      el.vTexto.innerHTML = t.toma
        ? `Tomar <strong>${esc(a.nombre)}</strong> mejora el resultado, así que forma parte de la agenda. Saltamos a p(${t.i}) = ${t.siguiente}.`
        : `No tomar <strong>${esc(a.nombre)}</strong> da el mismo valor o uno mejor, así que se descarta. Bajamos a i − 1 = ${t.siguiente}.`;
      el.vFormula.innerHTML =
        `i = ${t.i}: &nbsp; w<sub>${t.i}</sub> + dp[${r.p[t.i]}] = ${fmt(a.peso + r.dp[r.p[t.i]])} ` +
        `${t.toma ? "&gt;" : "≤"} dp[${t.i - 1}] = ${fmt(r.dp[t.i - 1])} <span class="linea2">→</span> ` +
        `<span class="res">${t.toma ? `tomar y saltar a ${t.siguiente}` : `descartar y bajar a ${t.siguiente}`}</span>`;
      renderCeldas((j) => (j === t.i ? { clase: "actual", tag: t.toma ? "tomar" : "descartar" } : visitadas.has(j) ? { clase: "camino" } : {}));
      renderGantt(el.vGantt, r.ordenadas, (_, k) => (k === t.i ? "actual" : elegidas.has(k) ? "sel" : k > t.i ? "desc" : "pendiente"), { numerar: true });
      leyenda([["actual", "Revisando"], ["sel", "Elegida"], ["desc", "Descartada"]]);
      filaActiva = t.i;
    } else {
      const elegidas = new Set(r.traza.filter((x) => x.toma).map((x) => x.i));
      el.vFase.textContent = "Resultado"; el.vFase.className = "pill recon";
      el.vTexto.innerHTML = `La respuesta es <strong>dp[${n}] = ${fmt(r.total)}</strong> asistentes con ${r.seleccionadas.length} charlas.`;
      el.vFormula.innerHTML = `<span class="res">dp[${n}] = ${fmt(r.total)}</span> <span class="linea2">→ ` +
        (r.seleccionadas.map((x) => esc(x.nombre)).join(" → ") || "ninguna charla") + "</span>";
      renderCeldas((j) => (j === n ? { clase: "actual", tag: "respuesta" } : elegidas.has(j) ? { clase: "camino" } : {}));
      renderGantt(el.vGantt, r.ordenadas, (_, k) => (elegidas.has(k) ? "sel" : "desc"), { numerar: true });
      leyenda([["sel", "Seleccionada"], ["desc", "Descartada"]]);
    }

    el.tablaDp.querySelectorAll("tr").forEach((tr, k) => tr.classList.toggle("activa", k === filaActiva));
    el.vContador.textContent = `Paso ${paso + 1} de ${pasos.length}`;
    el.vBarra.style.width = (paso / (pasos.length - 1 || 1)) * 100 + "%";
    el.vPrev.disabled = el.vInicio.disabled = paso === 0;
    el.vNext.disabled = el.vFin.disabled = paso === pasos.length - 1;
  }

  function irA(k) {
    paso = Math.max(0, Math.min(pasos.length - 1, k));
    renderPaso();
  }

  function detener() {
    clearTimeout(temporizador);
    temporizador = null;
    el.vPlay.textContent = "▶ Reproducir";
  }

  function reproducir() {
    if (temporizador) return detener();
    if (paso === pasos.length - 1) irA(0);
    el.vPlay.textContent = "⏸ Pausar";
    const tick = () => {
      if (paso >= pasos.length - 1) return detener();
      irA(paso + 1);
      temporizador = setTimeout(tick, Number(el.vVel.value));
    };
    temporizador = setTimeout(tick, Number(el.vVel.value));
  }

  /* ---------- tabla dp completa ---------- */
  function renderTablaDP() {
    el.tablaDp.innerHTML = "";
    const base = crear("tr");
    base.append(crear("td", "", "0"), crear("td", "", "(caso base)"), crear("td", "", "—"),
      crear("td", "der", "—"), crear("td", "der", "—"), crear("td", "der gana", "0"), crear("td", "", "dp[0] = 0"));
    base.addEventListener("click", () => { detener(); irA(0); });
    el.tablaDp.appendChild(base);
    r.pasos.forEach((s, k) => {
      const tr = crear("tr");
      const dec = crear("td");
      dec.appendChild(crear("span", "dec " + (s.toma ? "si" : "no"), s.toma ? "TOMAR" : "NO TOMAR"));
      tr.append(
        crear("td", "", s.i), crear("td", "", s.actividad.nombre), crear("td", "", s.p),
        crear("td", "der" + (s.toma ? "" : " gana"), fmt(s.sinTomar)),
        crear("td", "der" + (s.toma ? " gana" : ""), `${fmt(s.actividad.peso)} + ${fmt(r.dp[s.p])} = ${fmt(s.tomando)}`),
        crear("td", "der", fmt(s.valor)), dec
      );
      tr.addEventListener("click", () => { detener(); irA(k + 1); });
      el.tablaDp.appendChild(tr);
    });
  }

  /* ---------- resultados ---------- */
  function kpi(etq, val, det, destacado) {
    const d = crear("div", "kpi" + (destacado ? " destacado" : ""));
    d.append(crear("div", "k-etq", etq), crear("div", "k-val", val), crear("div", "k-det", det));
    return d;
  }

  function barra(titulo, valor, ancho, clase, detalle) {
    const f = crear("div", "b-fila");
    const cab = crear("div", "b-cab");
    cab.append(crear("span", "", titulo), crear("strong", "", valor));
    const pista = crear("div", "b-pista");
    const relleno = crear("div", "b-relleno " + (clase || ""));
    relleno.style.width = "0%";
    pista.appendChild(relleno);
    f.append(cab, pista);
    if (detalle) f.appendChild(crear("div", "b-det", detalle));
    requestAnimationFrame(() => requestAnimationFrame(() => { relleno.style.width = Math.max(ancho, 1.5) + "%"; }));
    return f;
  }

  function renderResultados() {
    const n = actividades.length;
    const porFin = DP.vorazPorFin(actividades);
    const porPeso = DP.vorazPorPeso(actividades);
    const memo = DP.agendaMemo(actividades);
    const sinMemo = DP.llamadasSinMemo(actividades);
    const mejorVoraz = Math.max(porFin.total, porPeso.total);
    const combinaciones = 2n ** BigInt(n);

    el.resumen.innerHTML = `Máximo posible: <strong>${fmt(r.total)} asistentes</strong> con ${r.seleccionadas.length} de ${n} charlas.`;

    el.kpis.innerHTML = "";
    el.kpis.append(
      kpi("Asistentes (óptimo)", fmt(r.total), `${r.seleccionadas.length} de ${n} charlas`, true),
      kpi("Ventaja sobre el mejor voraz", (r.total - mejorVoraz > 0 ? "+" : "") + fmt(r.total - mejorVoraz),
        r.total > mejorVoraz ? "asistentes adicionales" : "en este conjunto empatan"),
      kpi("Subproblemas resueltos", fmt(n + 1), `vs ${fmt(combinaciones)} subconjuntos`),
      kpi("Llamadas recursivas", fmt(memo.llamadas), `con memoria · ${fmt(sinMemo)} sin memoria`)
    );

    const elegidas = new Set(r.seleccionadas);
    renderGantt(el.timeline, [...actividades].sort((a, b) => a.inicio - b.inicio || a.fin - b.fin),
      (a) => (elegidas.has(a) ? "sel" : "desc"));

    const tope = Math.max(r.total, mejorVoraz, 1);
    el.comparacion.innerHTML = "";
    [
      ["Programación Dinámica", r, "Óptimo garantizado"],
      ["Voraz por hora de fin", porFin, "Maximiza el número de charlas, ignora asistentes"],
      ["Voraz por más asistentes", porPeso, "Toma la más grande que no choque"],
    ].forEach(([titulo, res, det]) => {
      const clase = res.total === r.total ? "mejor" : "malo";
      el.comparacion.appendChild(barra(titulo, `${fmt(res.total)} asist.`, (res.total / tope) * 100, clase,
        `${res.seleccionadas.length} charlas · ${det}`));
    });
    el.nota.textContent = mejorVoraz < r.total
      ? `La DP supera al mejor voraz por ${fmt(r.total - mejorVoraz)} asistentes: elegir "lo mejor ahora" no basta, hay que comparar subproblemas.`
      : "En este conjunto algún voraz coincide con el óptimo, pero no siempre ocurre (prueba el contraejemplo).";

    // Escala logarítmica: 2^n crece demasiado para una escala lineal.
    const log = (x) => Math.log10(Number(x) + 1);
    const logComb = n * Math.log10(2);
    const topeLog = Math.max(logComb, log(sinMemo), 1);
    el.ahorro.innerHTML = "";
    el.ahorro.append(
      barra("Fuerza bruta (subconjuntos)", fmt(combinaciones), (logComb / topeLog) * 100, "malo", "O(2ⁿ)"),
      barra("Recursión sin memoización (llamadas)", fmt(sinMemo), (log(sinMemo) / topeLog) * 100, "malo", "Recalcula los mismos dp[j]"),
      barra("Top-down con memoización (llamadas)", fmt(memo.llamadas), (log(memo.llamadas) / topeLog) * 100, "mejor", "Cada subproblema una sola vez"),
      barra("Bottom-up (celdas de la tabla)", fmt(n + 1), (log(n + 1) / topeLog) * 100, "mejor", "O(n) después de ordenar")
    );
  }

  function resolver() {
    detener();
    mostrarError("");
    if (actividades.length === 0) return mostrarError("Agrega al menos una charla.");
    r = DP.agendaOptima(actividades);
    construirPasos();
    renderTablaDP();
    el.resultado.hidden = false;
    renderResultados();
    irA(0);
    $("visualizador").scrollIntoView();
  }

  /* ---------- tema claro / oscuro ---------- */
  function iniciarTema() {
    try {
      const guardado = localStorage.getItem("tema");
      if (guardado) document.documentElement.dataset.theme = guardado;
    } catch (_) { /* sin almacenamiento: se usa el tema del sistema */ }
    $("btn-tema").addEventListener("click", () => {
      const actual = document.documentElement.dataset.theme ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const nuevo = actual === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nuevo;
      try { localStorage.setItem("tema", nuevo); } catch (_) { /* ignorar */ }
    });
  }

  /* ---------- eventos ---------- */
  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      agregar(el.nombre.value, el.inicio.value, el.fin.value, el.peso.value);
      el.form.reset(); invalidar(); el.nombre.focus();
    } catch (err) { mostrarError(err.message); }
  });

  $("btn-ejemplo").addEventListener("click", () => cargar(EJEMPLO));
  $("btn-trampa").addEventListener("click", () => cargar(TRAMPA));
  $("btn-aleatorio").addEventListener("click", aleatorio);
  $("btn-limpiar").addEventListener("click", () => { actividades = []; invalidar(); });
  $("btn-resolver").addEventListener("click", resolver);

  el.vPlay.addEventListener("click", reproducir);
  el.vPrev.addEventListener("click", () => { detener(); irA(paso - 1); });
  el.vNext.addEventListener("click", () => { detener(); irA(paso + 1); });
  el.vInicio.addEventListener("click", () => { detener(); irA(0); });
  el.vFin.addEventListener("click", () => { detener(); irA(pasos.length - 1); });

  document.addEventListener("keydown", (e) => {
    if (!r || el.resultado.hidden || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") { detener(); irA(paso + 1); }
    else if (e.key === "ArrowLeft") { detener(); irA(paso - 1); }
    else if (e.key === " " && e.target === document.body) { e.preventDefault(); reproducir(); }
  });

  // La línea guía del Gantt depende del ancho: redibujar al cambiar el tamaño.
  let redimension;
  window.addEventListener("resize", () => {
    clearTimeout(redimension);
    redimension = setTimeout(() => { if (r && !el.resultado.hidden) renderPaso(); }, 150);
  });

  iniciarTema();
  cargar(EJEMPLO);
})();
