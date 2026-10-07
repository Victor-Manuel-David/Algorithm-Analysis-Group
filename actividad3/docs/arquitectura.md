# Arquitectura del proyecto

Aplicación **web estática** (HTML + CSS + JavaScript puro). No requiere backend,
base de datos ni librerías: se ejecuta abriendo `index.html`.

## Estructura de carpetas
```
agenda-dp/
├── index.html                # Estructura de la página
├── css/
│   └── styles.css            # Estilos
├── js/
│   ├── dp.js                 # Programación Dinámica (lógica pura, sin DOM)
│   └── app.js                # Interfaz: datos, visualizador paso a paso, resultados
├── tests/
│   └── dp.test.js            # Pruebas automáticas (Node), incluye fuerza bruta
├── docs/
│   ├── algoritmo.md          # Estados, recurrencia, casos base, complejidad
│   └── arquitectura.md       # Este documento
├── package.json
├── .gitignore
└── README.md
```

## Capas
```
 ┌─────────────────────────┐
 │ index.html + styles.css │  Presentación
 └───────────┬─────────────┘
             │ eventos / DOM
 ┌───────────▼─────────────┐
 │        app.js           │  Controlador (UI)
 └───────────┬─────────────┘
             │ llama funciones puras
 ┌───────────▼─────────────┐
 │         dp.js           │  agendaOptima (DP) + voraces de comparación
 └─────────────────────────┘
```

## Funciones principales de `dp.js`
| Función | Rol |
|---|---|
| `agendaOptima(charlas)` | **Algoritmo DP**: devuelve `dp`, `p`, pasos, traza de reconstrucción, charlas elegidas y total |
| `agendaMemo(charlas)` | Misma recurrencia en versión top-down (memoización); cuenta llamadas |
| `llamadasSinMemo(charlas)` | Llamadas que haría la recursión sin memoria: `L(j) = 1 + L(j-1) + L(p(j))` |
| `calcularP(ordenadas)` | Calcula `p(i)` con búsqueda binaria |
| `vorazPorFin`, `vorazPorPeso` | Algoritmos voraces, solo para comparar |
| `validar` | Valida nombre, horas y asistentes |

## Decisiones de diseño
- **Separación lógica/UI:** `dp.js` no toca el DOM, por eso se prueba con Node y se explica por aparte.
- **Sin dependencias:** fácil de ejecutar y presentar en cualquier equipo.
- **Horas en minutos:** comparar enteros es más simple que comparar textos.
- **`textContent` en vez de `innerHTML`** para texto del usuario (evita inyección HTML).
- **Visualizador paso a paso:** `app.js` convierte `pasos` (llenado) y `traza` (reconstrucción) en una
  secuencia de estados que se puede reproducir, pausar o recorrer con el teclado. Hace visible la
  recurrencia durante la sustentación.
- **Tema claro/oscuro con variables CSS:** los colores se definen una sola vez en `:root`.

## Flujo de datos
1. El usuario agrega charlas → `app.js` valida con `DP.validar`.
2. Pulsa "Ejecutar" → `DP.agendaOptima(lista)` devuelve `{ordenadas, p, dp, pasos, traza, seleccionadas, total}`.
3. `app.js` arma el visualizador (llenado + reconstrucción) y la tabla DP completa.
4. Con `DP.vorazPorFin`, `DP.vorazPorPeso`, `DP.agendaMemo` y `DP.llamadasSinMemo` dibuja la
   comparación con los voraces y el ahorro de trabajo de la DP.
