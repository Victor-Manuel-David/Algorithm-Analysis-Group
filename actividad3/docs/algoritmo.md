# Algoritmo: Programación Dinámica — Agenda ponderada (Weighted Interval Scheduling)

## Problema formal
Dadas *n* charlas, cada una con hora de inicio `s_i`, hora de fin `f_i` y un peso
`w_i` (asistentes esperados), y **un solo auditorio**, elegir el subconjunto de
charlas **sin cruces** que **maximice la suma de pesos**.

Probar todos los subconjuntos cuesta O(2ⁿ). Con Programación Dinámica se resuelve en O(n log n).

## ¿Por qué Programación Dinámica y no Greedy?
Un algoritmo voraz toma la mejor decisión *local* y no la revisa. Aquí falla:

| Charla | Horario | Asistentes |
|---|---|---|
| A | 08:00–09:00 | 10 |
| B | 09:00–10:00 | 10 |
| Grande | 08:00–10:00 | 100 |

El voraz por hora de fin elige A y B (20 asistentes). El óptimo es **Grande (100)**.
Para decidir bien hay que **comparar subproblemas**: eso es Programación Dinámica.

## Subestructura óptima y subproblemas solapados
- **Subestructura óptima:** la solución óptima para las primeras *i* charlas contiene
  soluciones óptimas de subproblemas más pequeños.
- **Subproblemas solapados:** sin guardar resultados, `dp[i]` se recalcularía muchas veces
  (el árbol de recursión crece exponencialmente). La tabla `dp` evita repetir trabajo.

## Definición formal

1. **Preparación:** ordenar las charlas por hora de fin → charlas 1..n.
2. **p(i):** número de charlas que terminan en o antes del inicio de la charla *i*
   (la última charla compatible con *i*). Se calcula con búsqueda binaria.
3. **Estado / subproblema:** `dp[i]` = máximo de asistentes usando solo las charlas `1..i`.
4. **Casos base:** `dp[0] = 0` (sin charlas no hay asistentes).
5. **Recurrencia:** para `i = 1..n`

```
dp[i] = max( dp[i-1],                 # opción 1: NO tomar la charla i
             w[i] + dp[p(i)] )        # opción 2: tomarla y sumar el mejor
                                      #           resultado compatible
```
6. **Respuesta:** `dp[n]`.
7. **Reconstrucción** (qué charlas se eligieron): desde `i = n`, si `w[i] + dp[p(i)] > dp[i-1]`
   se toma la charla y se salta a `p(i)`; si no, se baja a `i-1`.

## Pseudocódigo
```
ordenar(charlas) por fin
calcular p[1..n]
dp[0] = 0
para i = 1..n:
    dp[i] = max(dp[i-1], w[i] + dp[p[i]])
retornar dp[n]
```

## Ejemplo resuelto a mano
| i | Charla | Horario | w | p(i) | No tomar `dp[i-1]` | Tomar `w + dp[p(i)]` | `dp[i]` |
|---|---|---|---|---|---|---|---|
| 0 | — | — | — | — | — | — | **0** (base) |
| 1 | A | 08–10 | 5 | 0 | 0 | 5 + 0 = 5 | **5** |
| 2 | B | 09–11 | 6 | 0 | 5 | 6 + 0 = 6 | **6** |
| 3 | C | 10–12 | 5 | 1 | 6 | 5 + dp[1] = 10 | **10** |
| 4 | D | 11–13 | 4 | 2 | 10 | 4 + dp[2] = 10 | **10** |

Respuesta: `dp[4] = 10` (charlas A y C). Esta tabla es exactamente la que muestra la aplicación web.

## Complejidad
| Parte | Costo |
|---|---|
| Ordenar por fin | O(n log n) |
| Calcular `p(i)` (búsqueda binaria) | O(n log n) |
| Llenar la tabla `dp` | O(n) |
| Reconstruir la solución | O(n) |
| **Total** | **O(n log n)** tiempo, **O(n)** espacio |

## Verificación
`npm test` compara el resultado de la DP contra una solución de **fuerza bruta (2ⁿ)** en
300 casos aleatorios, y comprueba que la DP nunca es peor que los algoritmos voraces.
