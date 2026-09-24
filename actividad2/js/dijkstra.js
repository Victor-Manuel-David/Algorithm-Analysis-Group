(function loadTemporaryAlgorithm(global) {
  'use strict';
  global.DijkstraAlgorithm = {
    dijkstra: function dijkstra(startId, endId) {
      return { startId, endId, path: [], totalCost: Infinity, snapshots: [] };
    },
  };
})(window);
