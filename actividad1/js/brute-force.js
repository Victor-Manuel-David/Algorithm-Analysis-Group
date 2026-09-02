(function loadBruteForceAlgorithm(global) {
  'use strict';

  const MAX_BRUTE_FORCE_DELIVERIES = 8;

  function permutations(items) {
    if (items.length <= 1) {
      return [items];
    }

    const result = [];

    items.forEach((item, index) => {
      const rest = items.slice(0, index).concat(items.slice(index + 1));
      permutations(rest).forEach((subPermutation) => {
        result.push([item, ...subPermutation]);
      });
    });

    return result;
  }

  function buildStepsForOrder(start, order) {
    const steps = [];
    let current = start;
    let totalDistance = 0;

    order.forEach((stop, index) => {
      const distance = global.RutaExpressGreedy.calculateDistance(current, stop);
      totalDistance += distance;
      steps.push({ number: index + 1, from: current, to: stop, distance });
      current = stop;
    });

    return { steps, totalDistance };
  }

  /**
   * Fuerza bruta: evalúa las n! rutas posibles y devuelve la de menor
   * distancia total. Sirve como referencia del óptimo real para comparar
   * contra el resultado del algoritmo Greedy.
   */
  function buildOptimalRoute(start, deliveries) {
    if (deliveries.length === 0) {
      return { steps: [], orderedStops: [], totalDistance: 0, feasible: true };
    }

    if (deliveries.length > MAX_BRUTE_FORCE_DELIVERIES) {
      return { steps: [], orderedStops: [], totalDistance: null, feasible: false };
    }

    let best = null;

    permutations(deliveries).forEach((order) => {
      const { steps, totalDistance } = buildStepsForOrder(start, order);

      if (!best || totalDistance < best.totalDistance) {
        best = { steps, orderedStops: order, totalDistance };
      }
    });

    return { ...best, feasible: true };
  }

  global.RutaExpressBruteForce = Object.freeze({ MAX_BRUTE_FORCE_DELIVERIES, buildOptimalRoute });
})(window);