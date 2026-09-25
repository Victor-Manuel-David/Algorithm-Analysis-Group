(function loadDijkstra(global) {
  'use strict';

  function findClosestUnvisited(nodeIds, distances, visited) {
    let closestId = null;
    let closestDistance = Infinity;

    nodeIds.forEach((nodeId) => {
      if (!visited.has(nodeId) && distances[nodeId] < closestDistance) {
        closestId = nodeId;
        closestDistance = distances[nodeId];
      }
    });

    return closestId;
  }

  function reconstructPath(previous, startId, endId) {
    const path = [];
    let currentId = endId;

    while (currentId !== null) {
      path.unshift(currentId);
      if (currentId === startId) return path;
      currentId = previous[currentId];
    }

    return [];
  }

  /**
   * Dijkstra para grafos ponderados con pesos no negativos.
   * Devuelve el camino mínimo y una fotografía de cada iteración para
   * evidenciar las decisiones del algoritmo en la interfaz.
   */
  function dijkstra(graph, startId, endId) {
    const nodeIds = graph.NODES.map((node) => node.id);
    const adjacency = graph.buildAdjacencyList();
    const distances = Object.fromEntries(nodeIds.map((nodeId) => [nodeId, Infinity]));
    const previous = Object.fromEntries(nodeIds.map((nodeId) => [nodeId, null]));
    const visited = new Set();
    const visitedOrder = [];
    const snapshots = [];

    distances[startId] = 0;

    while (visited.size < nodeIds.length) {
      const currentId = findClosestUnvisited(nodeIds, distances, visited);

      if (currentId === null || distances[currentId] === Infinity) break;

      visited.add(currentId);
      visitedOrder.push(currentId);
      const updates = [];

      if (currentId !== endId) {
        adjacency[currentId].forEach((connection) => {
          if (visited.has(connection.nodeId)) return;

          const candidateDistance = distances[currentId] + connection.weight;

          if (candidateDistance < distances[connection.nodeId]) {
            updates.push({
              nodeId: connection.nodeId,
              oldDistance: distances[connection.nodeId],
              newDistance: candidateDistance,
              via: currentId,
            });
            distances[connection.nodeId] = candidateDistance;
            previous[connection.nodeId] = currentId;
          }
        });
      }

      snapshots.push({
        iteration: snapshots.length + 1,
        currentId,
        currentDistance: distances[currentId],
        distances: { ...distances },
        previous: { ...previous },
        visited: [...visited],
        updates,
      });

      if (currentId === endId) break;
    }

    const path = distances[endId] === Infinity ? [] : reconstructPath(previous, startId, endId);

    return {
      startId,
      endId,
      path,
      totalCost: distances[endId],
      distances,
      previous,
      visitedOrder,
      snapshots,
    };
  }

  global.DijkstraAlgorithm = Object.freeze({ dijkstra });
})(window);
