# 📅 Agenda Óptima — Programación Dinámica (Weighted Interval Scheduling)

Proyecto web de **Análisis de Algoritmos (Examen 3)** que elige las charlas de un
auditorio que **maximizan el número de asistentes**, usando **Programación Dinámica**.

## 🎥 Video de sustentación
https://www.youtube.com/watch?v=nN35wBedY38 

## 1. Problema planteado
Un congreso tiene **un solo auditorio** y varias charlas propuestas. Cada charla tiene
hora de inicio, hora de fin y un número de **asistentes esperados**. Algunas se cruzan
en horario y no pueden darse al mismo tiempo.

**¿Qué charlas elegir para obtener el mayor número total de asistentes?**

Probar todas las combinaciones cuesta O(2ⁿ). Con Programación Dinámica se resuelve en O(n log n).

## 2. Solución
Una aplicación web donde el usuario ingresa charlas (o carga un conjunto de prueba:
congreso de ejemplo, contraejemplo de los voraces o datos aleatorios), ejecuta el algoritmo y ve:
- el **modelo de DP** (estado, caso base, recurrencia, respuesta y complejidad) explicado en la página,
- un **visualizador paso a paso** (con reproducción automática y teclado ← →) que muestra cómo se
  llena cada celda `dp[i]`, de qué celdas depende (`dp[i-1]` y `dp[p(i)]`), qué charlas son
  compatibles o se cruzan, y luego la **reconstrucción** hacia atrás de la agenda,
- la **tabla de Programación Dinámica** completa (clic en una fila para ir a ese paso),
- la **agenda óptima** en un diagrama de Gantt con eje de horas,
- una **comparación** con dos algoritmos voraces que no siempre son óptimos,
- **cuánto trabajo ahorra la DP**: subconjuntos de fuerza bruta vs. llamadas de la recursión sin
  memoización vs. con memoización vs. celdas de la tabla bottom-up,
- el **código** del núcleo del algoritmo. Incluye tema claro/oscuro y diseño adaptable a móvil.

## 3. Algoritmo seleccionado: Programación Dinámica (bottom-up)

### ¿Cómo funciona?
Se ordenan las charlas por hora de fin y se resuelve el problema para las primeras
`1, 2, …, n` charlas, **reutilizando** los resultados de subproblemas ya calculados
(en vez de recalcularlos).

### Estado (subproblema)
`dp[i]` = máximo de asistentes que se pueden lograr usando solo las primeras *i* charlas.

### Caso base
`dp[0] = 0` (sin charlas no hay asistentes).

### Relación de recurrencia
```
dp[i] = max( dp[i-1],                  # no tomar la charla i
             w[i] + dp[p(i)] )         # tomarla: suma sus asistentes + mejor resultado compatible
```
donde `w[i]` son los asistentes de la charla *i* y `p(i)` es la última charla que termina
en o antes del inicio de la *i* (se calcula con búsqueda binaria).

### Respuesta y reconstrucción
La respuesta es `dp[n]`. Para saber **qué** charlas se eligieron se recorre la tabla desde
`n` hacia atrás: si tomar la charla mejora el valor, se toma y se salta a `p(i)`; si no, se baja a `i-1`.

### Complejidad
**O(n log n)** tiempo (ordenar + búsqueda binaria + llenar la tabla) y **O(n)** espacio.

### Bottom-up y top-down
La implementación principal (`agendaOptima`) llena la tabla de `dp[0]` a `dp[n]` (bottom-up).
También se incluye `agendaMemo`, la misma recurrencia escrita como recursión con memoización
(top-down). Sin memoización, la recursión haría `L(j) = 1 + L(j-1) + L(p(j))` llamadas, que
crece exponencialmente porque los mismos subproblemas se repiten; con memoización cada `dp[j]`
se calcula una sola vez.

### ¿Por qué no un algoritmo voraz?
Con pesos, la decisión local falla: dos charlas de 10 asistentes (08–09 y 09–10) suman 20,
pero una charla de 100 asistentes (08–10) es mejor. La DP compara ambas opciones en cada paso.

Más detalle y ejemplo resuelto a mano: [`docs/algoritmo.md`](docs/algoritmo.md).

## 4. Arquitectura
Aplicación estática (HTML + CSS + JS puro), sin dependencias.

```
index.html → js/app.js (interfaz) → js/dp.js (Programación Dinámica)
```
Detalle en [`docs/arquitectura.md`](docs/arquitectura.md).

## 5. Estructura del repositorio
```
├── index.html
├── css/styles.css
├── js/dp.js              # algoritmo de Programación Dinámica
├── js/app.js             # interfaz
├── tests/dp.test.js
├── docs/                 # algoritmo y arquitectura
├── package.json
└── README.md
```

## 6. Cómo ejecutarlo
**Opción A (servidor local, recomendada):**
```bash
npm start            # o: python3 -m http.server 8000
# abre http://127.0.0.1:8000
```

**Opción B:** abrir `index.html` directamente en el navegador.

**Pruebas automáticas (requiere Node.js):**
```bash
npm test
```

## 7. Resultados obtenidos
Con el ejemplo incluido (11 charlas):

| Método | Asistentes | Charlas |
|---|---|---|
| **Programación Dinámica (óptimo)** | **610** | Inteligencia Artificial, Redes 5G, Ciberseguridad, Taller de Git |
| Voraz por hora de fin | 550 | 6 |
| Voraz por más asistentes | 560 | 3 |

Trabajo realizado en el mismo ejemplo:

| Enfoque | Trabajo |
|---|---|
| Fuerza bruta | 2¹¹ = 2.048 subconjuntos |
| Recursión sin memoización | 359 llamadas |
| Top-down con memoización | 23 llamadas |
| Bottom-up (tabla) | 12 celdas (`dp[0..11]`) |

Las pruebas verifican la DP contra **fuerza bruta en 300 casos aleatorios** (y que top-down
y bottom-up coinciden), además de casos borde: lista vacía, una charla, charlas consecutivas,
validaciones, conteo de llamadas y contraejemplos de los voraces.

## 8. Limitaciones y mejoras
- Un solo auditorio (con varios, el problema se complica).
- Las horas se manejan dentro de un mismo día (no hay charlas que pasen la medianoche).
