// Ejecutar con: npm test   (o: node tests/dp.test.js)
const assert = require("assert");
const DP = require("../js/dp.js");

const act = (nombre, i, f, peso) => ({ nombre, inicio: DP.aMinutos(i), fin: DP.aMinutos(f), peso });
const nombres = (l) => l.map((a) => a.nombre);

// 1) Caso base: lista vacía
let r = DP.agendaOptima([]);
assert.strictEqual(r.total, 0);
assert.deepStrictEqual(r.seleccionadas, []);
assert.deepStrictEqual(r.dp, [0]);

// 2) Una sola charla
r = DP.agendaOptima([act("A", "08:00", "09:00", 50)]);
assert.strictEqual(r.total, 50);

// 3) Charlas consecutivas (fin == inicio) son compatibles
r = DP.agendaOptima([act("A", "08:00", "09:00", 10), act("B", "09:00", "10:00", 20)]);
assert.strictEqual(r.total, 30);

// 4) Contraejemplo del voraz: una charla grande vale más que dos pequeñas
const trampa = [act("A", "08:00", "09:00", 10), act("B", "09:00", "10:00", 10), act("Grande", "08:00", "10:00", 100)];
r = DP.agendaOptima(trampa);
assert.strictEqual(r.total, 100);
assert.deepStrictEqual(nombres(r.seleccionadas), ["Grande"]);
assert.strictEqual(DP.vorazPorFin(trampa).total, 20); // el voraz por fin pierde

// 5) Contraejemplo del voraz por peso
const trampa2 = [act("Media", "08:00", "12:00", 60), act("X", "08:00", "10:00", 50), act("Y", "10:00", "12:00", 50)];
assert.strictEqual(DP.agendaOptima(trampa2).total, 100);
assert.strictEqual(DP.vorazPorPeso(trampa2).total, 60);

// 6) Tabla dp y p(i) en un caso pequeño verificable a mano
const peq = [act("A", "08:00", "10:00", 5), act("B", "09:00", "11:00", 6), act("C", "10:00", "12:00", 5), act("D", "11:00", "13:00", 4)];
r = DP.agendaOptima(peq);
assert.deepStrictEqual(r.p, [0, 0, 0, 1, 2]);
assert.deepStrictEqual(r.dp, [0, 5, 6, 10, 10]);
assert.strictEqual(r.total, 10);

// 7) Validaciones
assert.throws(() => DP.agendaOptima([act("X", "10:00", "09:00", 5)]));
assert.throws(() => DP.agendaOptima([{ nombre: "", inicio: 1, fin: 2, peso: 1 }]));
assert.throws(() => DP.agendaOptima([act("X", "08:00", "09:00", -3)]));

// 8) No modifica el arreglo original
const original = [act("B", "10:00", "11:00", 1), act("A", "08:00", "09:00", 1)];
DP.agendaOptima(original);
assert.strictEqual(original[0].nombre, "B");

// 9) VERIFICACIÓN CONTRA FUERZA BRUTA (2^n) con datos pseudoaleatorios
function fuerzaBruta(lista) {
  let mejor = 0;
  for (let mask = 0; mask < 1 << lista.length; mask++) {
    const sub = lista.filter((_, k) => mask & (1 << k));
    const ok = sub.every((a, x) => sub.every((b, y) => x >= y || a.fin <= b.inicio || b.fin <= a.inicio));
    if (ok) mejor = Math.max(mejor, sub.reduce((s, a) => s + a.peso, 0));
  }
  return mejor;
}
let semilla = 12345;
const rnd = (max) => { semilla = (semilla * 1103515245 + 12345) % 2147483648; return semilla % max; };
for (let t = 0; t < 300; t++) {
  const n = 1 + rnd(10);
  const lista = Array.from({ length: n }, (_, k) => {
    const inicio = rnd(20) * 30, dur = (1 + rnd(8)) * 30;
    return { nombre: "T" + k, inicio, fin: inicio + dur, peso: rnd(200) };
  });
  const res = DP.agendaOptima(lista);
  assert.strictEqual(res.total, fuerzaBruta(lista), "DP distinto de fuerza bruta");
  // la selección reconstruida no tiene cruces y suma el total
  const sel = res.seleccionadas;
  for (let i = 1; i < sel.length; i++) assert.ok(sel[i].inicio >= sel[i - 1].fin);
  assert.strictEqual(sel.reduce((s, a) => s + a.peso, 0), res.total);
  // DP nunca es peor que los voraces
  assert.ok(res.total >= DP.vorazPorFin(lista).total);
  assert.ok(res.total >= DP.vorazPorPeso(lista).total);
}

console.log("✔ Todas las pruebas pasaron (incluye 300 casos contra fuerza bruta)");
