(function loadRouteControls(global) {
  'use strict';

  function populateLocationSelects(startSelect, endSelect, nodes) {
    [startSelect, endSelect].forEach((select) => {
      select.replaceChildren();
      nodes.forEach((node) => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.name;
        select.append(option);
      });
    });
  }

  function validateRoute(startId, endId) {
    if (!startId || !endId) {
      return { valid: false, message: 'Selecciona un origen y un destino.' };
    }

    if (startId === endId) {
      return { valid: false, message: 'El origen y el destino deben ser diferentes.' };
    }

    return { valid: true, message: '' };
  }

  function showError(errorElement, message) {
    errorElement.textContent = message || '';
  }

  function findEdgeWeight(graph, fromId, toId) {
    const edge = graph.EDGES.find(
      (candidate) =>
        (candidate.from === fromId && candidate.to === toId) ||
        (candidate.from === toId && candidate.to === fromId),
    );
    return edge ? edge.weight : 0;
  }

  function renderRouteResult(elements, result, graph) {
    const hasPath = result.path.length > 0 && Number.isFinite(result.totalCost);
    elements.emptyResult.hidden = hasPath;
    elements.routeResult.hidden = !hasPath;
    elements.resultState.textContent = hasPath ? 'Completada' : 'Sin ruta';
    elements.resultState.classList.toggle('success', hasPath);
    elements.pathList.replaceChildren();

    if (!hasPath) {
      elements.emptyResult.querySelector('p').textContent =
        'No existe un camino entre los lugares seleccionados.';
      return;
    }

    elements.totalCost.textContent = result.totalCost;
    elements.pathNodeCount.textContent = result.path.length;

    result.path.forEach((nodeId, index) => {
      const node = graph.getNodeById(nodeId);
      const item = document.createElement('li');
      item.className = 'path-item';

      const order = document.createElement('span');
      order.className = 'path-index';
      order.textContent = index + 1;

      const description = document.createElement('span');
      const name = document.createElement('strong');
      const detail = document.createElement('small');
      name.textContent = node.name;

      if (index === 0) {
        detail.textContent = 'Punto de partida';
      } else {
        const weight = findEdgeWeight(graph, result.path[index - 1], nodeId);
        detail.textContent = `Conexión de ${weight} min`;
      }

      description.append(name, detail);
      item.append(order, description);
      elements.pathList.append(item);
    });
  }

  global.RouteControls = Object.freeze({
    populateLocationSelects,
    validateRoute,
    showError,
    renderRouteResult,
  });
})(window);
