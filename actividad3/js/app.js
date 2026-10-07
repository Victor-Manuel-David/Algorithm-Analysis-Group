/**
 * app.js — Capa de interfaz (DOM). No contiene la lógica del algoritmo:
 * la Programación Dinámica vive en js/dp.js (objeto global DP).
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

  let actividades = [];

  const $ = (id) => document.getElementById(id);
  const el = {
    form: $("form-actividad"), nombre: $("nombre"), inicio: $("inicio"), fin: $("fin"), peso: $("peso"),
    error: $("error"), tabla: $("tabla-actividades"), vacio: $("vacio"),
    resultado: $("resultado"), resumen: $("resumen"), tablaDp: $("tabla-dp").querySelector("tbody"),
    timeline: $("linea-tiempo"), comparacion: $("comparacion"), nota: $("comparacion-nota"),
  };

  const mostrarError = (msg) => { el.error.textContent = msg || ""; };

  function celda(texto, clase) {
    const td = document.createElement("td");
    td.textContent = texto;
    if (clase) td.className = clase;
    return td;
  }

  function renderTabla() {
    el.tabla.innerHTML = "";
    actividades.forEach((a, i) => {
      const tr = document.createElement("tr");
      tr.append(celda(a.nombre), celda(DP.aHHMM(a.inicio)), celda(DP.aHHMM(a.fin)), celda(a.peso));
      const td = document.createElement("td");
      const btn = document.createElement("button");
      btn.type = "button"; btn.title = "Eliminar"; btn.textContent = "✕";
      btn.addEventListener("click", () => { actividades.splice(i, 1); renderTabla(); el.resultado.hidden = true; });
      td.appendChild(btn); tr.appendChild(td);
      el.tabla.appendChild(tr);
    });
    el.vacio.hidden = actividades.length > 0;
  }

  function agregar(nombre, inicioHHMM, finHHMM, peso) {
    const nueva = { nombre: nombre.trim(), inicio: DP.aMinutos(inicioHHMM), fin: DP.aMinutos(finHHMM), peso: Number(peso) };
    DP.validar(nueva); // lanza Error si es inválida
    actividades.push(nueva);
  }

  function renderTablaDP(r) {
    el.tablaDp.innerHTML = "";
    // Fila del caso base
    const base = document.createElement("tr");
    base.append(celda("0"), celda("(caso base)"), celda("—"), celda("—"), celda("—"), celda("0"), celda("dp[0] = 0"));
    el.tablaDp.appendChild(base);
    r.pasos.forEach((s) => {
      const tr = document.createElement("tr");
      tr.append(
        celda(s.i), celda(s.actividad.nombre), celda(s.p),
        celda(s.sinTomar, s.toma ? "" : "toma"),
        celda(`${s.actividad.peso} + ${r.dp[s.p]} = ${s.tomando}`, s.toma ? "toma" : "salta"),
        celda(s.valor),
        celda(s.toma ? "TOMAR" : "NO tomar")
      );
      el.tablaDp.appendChild(tr);
    });
  }

  function renderTimeline(r) {
    const elegidas = new Set(r.seleccionadas);
    const min = Math.min(...r.ordenadas.map((a) => a.inicio));
    const rango = Math.max(...r.ordenadas.map((a) => a.fin)) - min;
    el.timeline.innerHTML = "";
    r.ordenadas.forEach((a) => {
      const fila = document.createElement("div"); fila.className = "fila";
      const etiqueta = document.createElement("span"); etiqueta.className = "etiqueta";
      etiqueta.textContent = `${a.nombre} (${a.peso})`;
      const pista = document.createElement("div"); pista.className = "pista";
      const barra = document.createElement("div");
      barra.className = "barra " + (elegidas.has(a) ? "ok" : "no");
      barra.style.left = ((a.inicio - min) / rango) * 100 + "%";
      barra.style.width = ((a.fin - a.inicio) / rango) * 100 + "%";
      pista.appendChild(barra); fila.append(etiqueta, pista);
      el.timeline.appendChild(fila);
    });
  }

  function renderComparacion(r, porFin, porPeso) {
    const metodos = [
      { titulo: "Programación Dinámica", res: { total: r.total, seleccionadas: r.seleccionadas }, detalle: "Óptimo garantizado" },
      { titulo: "Voraz por hora de fin", res: porFin, detalle: "Maximiza nº de charlas, ignora asistentes" },
      { titulo: "Voraz por más asistentes", res: porPeso, detalle: "Elige la más grande primero" },
    ];
    el.comparacion.innerHTML = "";
    metodos.forEach((m) => {
      const div = document.createElement("div");
      div.className = "metodo" + (m.res.total === r.total ? " mejor" : "");
      const h = document.createElement("h4"); h.textContent = m.titulo;
      const t = document.createElement("div"); t.className = "total"; t.textContent = `${m.res.total} asistentes`;
      const s = document.createElement("small"); s.textContent = `${m.res.seleccionadas.length} charlas · ${m.detalle}`;
      div.append(h, t, s); el.comparacion.appendChild(div);
    });
    const peor = Math.min(porFin.total, porPeso.total);
    el.nota.textContent = peor < r.total
      ? `La Programación Dinámica supera al mejor voraz por ${r.total - Math.max(porFin.total, porPeso.total)} asistentes: decidir "lo mejor ahora" no basta, hay que comparar subproblemas.`
      : "En este conjunto los voraces coinciden con el óptimo, pero no siempre ocurre (prueba el ejemplo).";
  }

  function resolver() {
    mostrarError("");
    if (actividades.length === 0) return mostrarError("Agrega al menos una charla.");
    const r = DP.agendaOptima(actividades);
    el.resumen.textContent =
      `Máximo posible: ${r.total} asistentes con ${r.seleccionadas.length} de ${actividades.length} charlas: ` +
      r.seleccionadas.map((a) => a.nombre).join(" → ");
    renderTablaDP(r);
    renderTimeline(r);
    renderComparacion(r, DP.vorazPorFin(actividades), DP.vorazPorPeso(actividades));
    el.resultado.hidden = false;
  }

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      agregar(el.nombre.value, el.inicio.value, el.fin.value, el.peso.value);
      mostrarError(""); el.form.reset(); el.resultado.hidden = true; renderTabla();
    } catch (err) { mostrarError(err.message); }
  });

  $("btn-ejemplo").addEventListener("click", () => {
    actividades = [];
    EJEMPLO.forEach(([n, i, f, p]) => agregar(n, i, f, p));
    mostrarError(""); el.resultado.hidden = true; renderTabla();
  });

  $("btn-limpiar").addEventListener("click", () => {
    actividades = []; mostrarError(""); el.resultado.hidden = true; renderTabla();
  });

  $("btn-resolver").addEventListener("click", resolver);
  renderTabla();
})();
