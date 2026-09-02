(function loadMultiRouteAlgorithm(global) {
  'use strict';

  function splitDeliveriesByAngle(depot, deliveries, driverCount) {
    const groups = Array.from({ length: driverCount }, () => []);

    if (deliveries.length === 0) {
      return groups;
    }

    const sorted = deliveries
      .map((delivery) => ({ delivery, angle: Math.atan2(delivery.y - depot.y, delivery.x - depot.x) }))
      .sort((a, b) => a.angle - b.angle)
      .map((entry) => entry.delivery);

    const baseSize = Math.floor(sorted.length / driverCount);
    const extra = sorted.length % driverCount;
    let cursor = 0;

    groups.forEach((group, index) => {
      const size = baseSize + (index < extra ? 1 : 0);
      for (let i = 0; i < size; i += 1) {
        group.push(sorted[cursor]);
        cursor += 1;
      }
    });

    return groups;
  }

  /**
   * Reparte las entregas entre varios repartidores agrupándolas por ángulo
   * respecto al depósito (barrido angular) y calcula una ruta Greedy
   * independiente para cada grupo.
   */
  function buildMultiRoute(start, deliveries, driverCount) {
    const groups = splitDeliveriesByAngle(start, deliveries, driverCount);

    return groups.map((group, index) => ({
      driver: index + 1,
      ...global.RutaExpressGreedy.buildGreedyRoute(start, group),
    }));
  }

  global.RutaExpressMultiRoute = Object.freeze({ buildMultiRoute });
})(window);
