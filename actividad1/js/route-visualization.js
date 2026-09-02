(function loadTemporaryVisualization(global) {
  'use strict';
  global.RutaExpressVisualization = {
    formatDistance: function formatDistance() { return '0,0'; },
    renderRouteMap: function renderRouteMap(elements, depot, deliveries, plan, visibleSteps) {
      elements.svg.replaceChildren();
      elements.shownDistance.textContent = '0,0';
      elements.visibleCount.textContent = visibleSteps || 0;
      elements.totalCount.textContent = plan ? plan.steps.length : 0;
      elements.mapStatus.textContent = 'Visualización pendiente de implementación';
    },
    renderRouteSteps: function renderRouteSteps(elements) {
      elements.steps.replaceChildren();
      elements.summary.textContent = 'Resultados pendientes de implementación.';
      elements.nextButton.hidden = true;
    },
  };
})(window);
