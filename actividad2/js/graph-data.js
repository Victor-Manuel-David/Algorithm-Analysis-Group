(function loadCampusGraph(global) {
  'use strict';

  const NODES = Object.freeze([
    Object.freeze({ id: 'gate', name: 'Portería', shortName: 'Portería', x: 10, y: 54 }),
    Object.freeze({ id: 'library', name: 'Biblioteca', shortName: 'Biblioteca', x: 29, y: 28 }),
    Object.freeze({ id: 'parking', name: 'Parqueadero', shortName: 'Parqueadero', x: 28, y: 82 }),
    Object.freeze({ id: 'cafeteria', name: 'Cafetería', shortName: 'Cafetería', x: 48, y: 59 }),
    Object.freeze({ id: 'labs', name: 'Laboratorios', shortName: 'Laboratorios', x: 56, y: 20 }),
    Object.freeze({ id: 'hall', name: 'Auditorio', shortName: 'Auditorio', x: 75, y: 51 }),
    Object.freeze({ id: 'block-a', name: 'Bloque A', shortName: 'Bloque A', x: 68, y: 84 }),
    Object.freeze({ id: 'wellness', name: 'Bienestar', shortName: 'Bienestar', x: 90, y: 27 }),
  ]);

  const EDGES = Object.freeze([
    Object.freeze({ from: 'gate', to: 'library', weight: 4 }),
    Object.freeze({ from: 'gate', to: 'parking', weight: 3 }),
    Object.freeze({ from: 'library', to: 'cafeteria', weight: 3 }),
    Object.freeze({ from: 'library', to: 'labs', weight: 6 }),
    Object.freeze({ from: 'parking', to: 'cafeteria', weight: 4 }),
    Object.freeze({ from: 'parking', to: 'block-a', weight: 8 }),
    Object.freeze({ from: 'cafeteria', to: 'labs', weight: 4 }),
    Object.freeze({ from: 'cafeteria', to: 'hall', weight: 5 }),
    Object.freeze({ from: 'cafeteria', to: 'block-a', weight: 4 }),
    Object.freeze({ from: 'labs', to: 'hall', weight: 3 }),
    Object.freeze({ from: 'labs', to: 'wellness', weight: 6 }),
    Object.freeze({ from: 'hall', to: 'wellness', weight: 2 }),
    Object.freeze({ from: 'block-a', to: 'hall', weight: 3 }),
    Object.freeze({ from: 'block-a', to: 'wellness', weight: 5 }),
  ]);

  function getNodeById(id) {
    return NODES.find((node) => node.id === id);
  }

  function buildAdjacencyList() {
    const adjacency = Object.fromEntries(NODES.map((node) => [node.id, []]));

    EDGES.forEach((edge) => {
      adjacency[edge.from].push({ nodeId: edge.to, weight: edge.weight });
      adjacency[edge.to].push({ nodeId: edge.from, weight: edge.weight });
    });

    return adjacency;
  }

  global.CampusGraph = Object.freeze({ NODES, EDGES, getNodeById, buildAdjacencyList });
})(window);
