(function startCampusPath(global) {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const graph = global.CampusGraph;
    const algorithm = global.DijkstraAlgorithm;
    const controls = global.RouteControls;
    const visualization = global.GraphVisualization;

    if (!graph || !algorithm || !controls || !visualization) {
      throw new Error('No fue posible cargar todos los módulos de CampusPath.');
    }

    const elements = {
      startSelect: document.querySelector('#start-node'),
      endSelect: document.querySelector('#end-node'),
      swapButton: document.querySelector('#swap-route'),
      calculateButton: document.querySelector('#calculate-route'),
      error: document.querySelector('#route-error'),
      svg: document.querySelector('#graph-svg'),
      graphStatus: document.querySelector('#graph-status'),
      graphSize: document.querySelector('#graph-size'),
      emptyResult: document.querySelector('#empty-result'),
      routeResult: document.querySelector('#route-result'),
      resultState: document.querySelector('#result-state'),
      totalCost: document.querySelector('#total-cost'),
      pathNodeCount: document.querySelector('#path-node-count'),
      pathList: document.querySelector('#path-list'),
      nextButton: document.querySelector('#next-iteration'),
      iterationCounter: document.querySelector('#iteration-counter'),
      iterationEmpty: document.querySelector('#iteration-empty'),
      iterationContent: document.querySelector('#iteration-content'),
      iterationNumber: document.querySelector('#iteration-number'),
      selectedNode: document.querySelector('#selected-node'),
      selectedDistance: document.querySelector('#selected-distance'),
      distanceTable: document.querySelector('#distance-table'),
      iterationNote: document.querySelector('#iteration-note'),
    };

    const state = { result: null, visibleIteration: 0 };

    controls.populateLocationSelects(elements.startSelect, elements.endSelect, graph.NODES);
    elements.startSelect.value = 'gate';
    elements.endSelect.value = 'wellness';

    function render() {
      visualization.renderGraph(elements, graph, state.result, state.visibleIteration);
      visualization.renderIteration(elements, graph, state.result, state.visibleIteration);
      if (state.result) controls.renderRouteResult(elements, state.result, graph);
    }

    function calculateRoute() {
      const startId = elements.startSelect.value;
      const endId = elements.endSelect.value;
      const validation = controls.validateRoute(startId, endId);
      controls.showError(elements.error, validation.message);

      if (!validation.valid) return;

      state.result = algorithm.dijkstra(graph, startId, endId);
      state.visibleIteration = state.result.snapshots.length > 0 ? 1 : 0;
      render();
    }

    elements.calculateButton.addEventListener('click', calculateRoute);
    elements.swapButton.addEventListener('click', () => {
      const previousStart = elements.startSelect.value;
      elements.startSelect.value = elements.endSelect.value;
      elements.endSelect.value = previousStart;
      controls.showError(elements.error, '');
    });
    elements.nextButton.addEventListener('click', () => {
      if (state.result && state.visibleIteration < state.result.snapshots.length) {
        state.visibleIteration += 1;
        render();
      }
    });

    render();
  });
})(window);
