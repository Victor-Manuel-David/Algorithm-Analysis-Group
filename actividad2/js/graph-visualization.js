(function loadTemporaryVisualization(global) {
  'use strict';
  global.GraphVisualization = {
    renderGraph: function renderGraph(elements, graph) {
      elements.graphStatus.textContent = 'Visualización pendiente de implementación.';
      elements.graphSize.textContent = `${graph.NODES.length} nodos · ${graph.EDGES.length} conexiones`;
    },
    renderIteration: function renderIteration(elements) {
      elements.nextButton.disabled = true;
      elements.iterationCounter.textContent = '0 / 0';
    },
  };
})(window);
