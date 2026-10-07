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
│   └── app.js                # Interfaz: eventos, tablas, línea de tiempo
├── tests/
│   └── dp.test.js            # Pruebas automáticas (Node), incluye fuerza bruta
├── docs/
│   ├── algoritmo.md          # Estados, recurrencia, casos base, complejidad
│   ├── arquitectura.md       # Este documento
│   ├── guion-sustentacion.md
│   └── estrategia-commits.md
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
| `agendaOptima(charlas)` | **Algoritmo DP**: devuelve `dp`, `p`, pasos, charlas elegidas y total |
| `calcularP(ordenadas)` | Calcula `p(i)` con búsqueda binaria |
| `vorazPorFin`, `vorazPorPeso` | Algoritmos voraces, solo para comparar |
| `validar` | Valida nombre, horas y asistentes |

## Decisiones de diseño
- **Separación lógica/UI:** `dp.js` no toca el DOM, por eso se prueba con Node y se explica por aparte.
- **Sin dependencias:** fácil de ejecutar y presentar en cualquier equipo.
- **Horas en minutos:** comparar enteros es más simple que comparar textos.
- **`textContent` en vez de `innerHTML`** para texto del usuario (evita inyección HTML).
- **La UI muestra la tabla `dp` paso a paso:** hace visible la recurrencia durante la sustentación.

## Flujo de datos
1. El usuario agrega charlas → `app.js` valida con `DP.validar`.
2. Pulsa "Ejecutar" → `DP.agendaOptima(lista)` devuelve `{ordenadas, p, dp, pasos, seleccionadas, total}`.
3. `app.js` dibuja la tabla DP, la línea de tiempo y la comparación con los voraces.
