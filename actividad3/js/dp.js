/**
 * dp.js — Núcleo del proyecto (sin dependencias, sin DOM).
 *
 * PROBLEMA: Weighted Interval Scheduling (agenda ponderada).
 * Hay un solo auditorio y n charlas; cada una tiene hora de inicio,
 * hora de fin y un peso (asistentes esperados). Se debe elegir el
 * subconjunto SIN cruces que maximice el total de asistentes.
 *
 * PROGRAMACIÓN DINÁMICA (bottom-up):
 *   - Se ordenan las charlas por hora de fin: 1..n.
 *   - ESTADO:      dp[i] = máximo de asistentes usando solo las charlas 1..i.
 *   - CASO BASE:   dp[0] = 0  (sin charlas no hay asistentes).
 *   - RECURRENCIA: dp[i] = max( dp[i-1],                 // NO tomar la charla i
 *                               peso[i] + dp[p(i)] )     // SÍ tomarla
 *     donde p(i) = cantidad de charlas que terminan a tiempo
 *     (fin <= inicio de la charla i), es decir, la última compatible.
 *   - RESPUESTA:   dp[n]; las charlas elegidas se reconstruyen hacia atrás.
 *
 * Funciona en el navegador (window.DP) y en Node (require).
 * Las horas se manejan en minutos desde las 00:00.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DP = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** "09:30" -> 570 */
  function aMinutos(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  /** 570 -> "09:30" */
  function aHHMM(minutos) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0");
    const m = String(minutos % 60).padStart(2, "0");
    return `${h}:${m}`;
  }

  /** Lanza error si una actividad no es válida. */
  function validar(a) {
    if (!a || !a.nombre) throw new Error("La charla necesita un nombre.");
    if (!Number.isFinite(a.inicio) || !Number.isFinite(a.fin))
      throw new Error(`Horas inválidas en "${a.nombre}".`);
    if (a.fin <= a.inicio)
      throw new Error(`"${a.nombre}": la hora de fin debe ser mayor que la de inicio.`);
    if (!Number.isFinite(a.peso) || a.peso < 0)
      throw new Error(`"${a.nombre}": los asistentes deben ser un número mayor o igual a 0.`);
  }

  /** Orden por hora de fin (desempate: inicio, luego nombre) — copia, no muta. */
  function ordenarPorFin(actividades) {
    return [...actividades].sort(
      (a, b) => a.fin - b.fin || a.inicio - b.inicio || a.nombre.localeCompare(b.nombre)
    );
  }

  /**
   * p[i] (i = 1..n): cuántas charlas terminan en o antes del inicio de la i-ésima.
   * Búsqueda binaria sobre las horas de fin ya ordenadas -> O(log n) por charla.
   */
  function calcularP(ordenadas) {
    const n = ordenadas.length;
    const p = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
      const inicio = ordenadas[i - 1].inicio;
      let lo = 0, hi = n; // primer índice (0-based) con fin > inicio
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (ordenadas[mid].fin <= inicio) lo = mid + 1;
        else hi = mid;
      }
      p[i] = lo;
    }
    return p;
  }

  /**
   * ALGORITMO DE PROGRAMACIÓN DINÁMICA (óptimo).
   * Complejidad: O(n log n) (ordenar + calcular p) + O(n) (llenar la tabla).
   * @returns {{ordenadas, p, dp, pasos, seleccionadas, total}}
   */
  function agendaOptima(actividades) {
    actividades.forEach(validar);
    const ordenadas = ordenarPorFin(actividades);
    const n = ordenadas.length;
    const p = calcularP(ordenadas);

    const dp = new Array(n + 1).fill(0); // dp[0] = 0  (caso base)
    const pasos = [];                    // para mostrar la tabla en la UI

    for (let i = 1; i <= n; i++) {
      const sinTomar = dp[i - 1];
      const tomando = ordenadas[i - 1].peso + dp[p[i]];
      dp[i] = Math.max(sinTomar, tomando);
      pasos.push({
        i, actividad: ordenadas[i - 1], p: p[i],
        sinTomar, tomando, valor: dp[i], toma: tomando > sinTomar,
      });
    }

    // Reconstrucción hacia atrás: ¿qué decisión produjo dp[n]?
    const seleccionadas = [];
    let i = n;
    while (i > 0) {
      if (ordenadas[i - 1].peso + dp[p[i]] > dp[i - 1]) {
        seleccionadas.push(ordenadas[i - 1]);
        i = p[i]; // saltar a la última charla compatible
      } else {
        i -= 1;
      }
    }
    seleccionadas.reverse();

    return { ordenadas, p, dp, pasos, seleccionadas, total: dp[n] };
  }

  /**
   * COMPARACIÓN 1 (voraz): ordena por hora de fin e ignora los pesos.
   * Maximiza el NÚMERO de charlas, no los asistentes.
   */
  function vorazPorFin(actividades) {
    actividades.forEach(validar);
    const seleccionadas = [];
    let ultimoFin = -Infinity;
    for (const a of ordenarPorFin(actividades)) {
      if (a.inicio >= ultimoFin) { seleccionadas.push(a); ultimoFin = a.fin; }
    }
    return { seleccionadas, total: sumar(seleccionadas) };
  }

  /**
   * COMPARACIÓN 2 (voraz): toma siempre la charla con más asistentes
   * que no se cruce con las ya elegidas.
   */
  function vorazPorPeso(actividades) {
    actividades.forEach(validar);
    const porPeso = [...actividades].sort((a, b) => b.peso - a.peso || a.fin - b.fin);
    const elegidas = [];
    for (const a of porPeso) {
      if (elegidas.every((e) => a.fin <= e.inicio || a.inicio >= e.fin)) elegidas.push(a);
    }
    elegidas.sort((a, b) => a.inicio - b.inicio);
    return { seleccionadas: elegidas, total: sumar(elegidas) };
  }

  function sumar(lista) { return lista.reduce((s, a) => s + a.peso, 0); }

  return { aMinutos, aHHMM, validar, ordenarPorFin, calcularP, agendaOptima, vorazPorFin, vorazPorPeso };
});
