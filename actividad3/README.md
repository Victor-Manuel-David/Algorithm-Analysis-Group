# 📅 Agenda Óptima — Programación Dinámica (Weighted Interval Scheduling)

Proyecto web de **Análisis de Algoritmos (Examen 3)** que elige las charlas de un
auditorio que **maximizan el número de asistentes**, usando **Programación Dinámica**.

## 👥 Integrantes
| Integrante | Aporte principal |
|---|---|
| Integrante 1 – _nombre_ | Algoritmo de Programación Dinámica, pruebas y explicación formal |
| Integrante 2 – _nombre_ | Interfaz web, tabla DP y demostración |
| Integrante 3 – _nombre_ | Arquitectura, README y guion de sustentación |

## 🎥 Video de sustentación
> **Enlace:** _pegar aquí el link del video (YouTube / Drive / archivo en el repo)_

## 1. Problema planteado
Un congreso tiene **un solo auditorio** y varias charlas propuestas. Cada charla tiene
hora de inicio, hora de fin y un número de **asistentes esperados**. Algunas se cruzan
en horario y no pueden darse al mismo tiempo.

**¿Qué charlas elegir para obtener el mayor número total de asistentes?**

Probar todas las combinaciones cuesta O(2ⁿ). Con Programación Dinámica se resuelve en O(n log n).

## 2. Solución
Una aplicación web donde el usuario ingresa charlas (o carga un ejemplo), ejecuta el
algoritmo y ve:
- la **tabla de Programación Dinámica** paso a paso (decisión *tomar / no tomar* en cada fila),
- la **agenda óptima** en una línea de tiempo,
- una **comparación** con dos algoritmos voraces que no siempre son óptimos.

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
├── docs/                 # algoritmo, arquitectura, guion, commits
├── package.json
└── README.md
```

## 6. Cómo ejecutarlo
**Opción A (más simple):** abrir `index.html` en el navegador.

**Opción B (servidor local):**
```bash
npm start            # o: python3 -m http.server 8000
# abrir http://localhost:8000
```

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

Las pruebas verifican la DP contra **fuerza bruta en 300 casos aleatorios**, además de
casos borde: lista vacía, una charla, charlas consecutivas, validaciones y contraejemplos de los voraces.

## 8. Limitaciones y mejoras
- Un solo auditorio (con varios, el problema se complica).
- Mejora posible: visualizar el árbol de recursión sin memoización para mostrar el ahorro.

## 9. Sustentación
Guion dividido entre los 3 integrantes: [`docs/guion-sustentacion.md`](docs/guion-sustentacion.md).
Estrategia de commits: [`docs/estrategia-commits.md`](docs/estrategia-commits.md).
