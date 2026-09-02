(function loadGreedyAlgorithm(global) {
  'use strict';

  function calculateDistance(origin, destination) {
    return Math.hypot(destination.x - origin.x, destination.y - origin.y);
  }

  /**
   * Algoritmo Greedy del vecino más cercano.
   * En cada iteración selecciona la entrega pendiente con menor distancia
   * desde la ubicación actual. La lista original nunca se modifica.
   */
  function buildGreedyRoute(start, deliveries) {
    const pending = deliveries.map((delivery) => ({ ...delivery }));
    const steps = [];
    const orderedStops = [];
    let current = start;
    let totalDistance = 0;

    while (pending.length > 0) {
      let closestIndex = 0;
      let closestDistance = calculateDistance(current, pending[0]);

      for (let index = 1; index < pending.length; index += 1) {
        const candidateDistance = calculateDistance(current, pending[index]);
        const isCloser = candidateDistance < closestDistance;
        const isTieWithLowerId =
          candidateDistance === closestDistance &&
          String(pending[index].id).localeCompare(String(pending[closestIndex].id)) < 0;

        if (isCloser || isTieWithLowerId) {
          closestIndex = index;
          closestDistance = candidateDistance;
        }
      }

      const selected = pending.splice(closestIndex, 1)[0];
      totalDistance += closestDistance;
      orderedStops.push(selected);
      steps.push({
        number: steps.length + 1,
        from: current,
        to: selected,
        distance: closestDistance,
      });
      current = selected;
    }

    return { steps, orderedStops, totalDistance };
  }

  global.RutaExpressGreedy = Object.freeze({ calculateDistance, buildGreedyRoute });
})(window);
