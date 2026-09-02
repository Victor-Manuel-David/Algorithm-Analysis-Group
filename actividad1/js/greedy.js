(function loadTemporaryAlgorithm(global) {
  'use strict';
  global.RutaExpressGreedy = {
    calculateDistance: function calculateDistance() { return 0; },
    buildGreedyRoute: function buildGreedyRoute() {
      return { steps: [], orderedStops: [], totalDistance: 0 };
    },
  };
})(window);
