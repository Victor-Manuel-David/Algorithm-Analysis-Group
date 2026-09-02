(function startApplication(global) {
  'use strict';

  function createDeliveryId() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }
    return `delivery-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function copySampleDeliveries(sampleDeliveries) {
    return sampleDeliveries.map((delivery) => ({ ...delivery }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const data = global.RutaExpressData;
    const greedy = global.RutaExpressGreedy;
    const bruteForce = global.RutaExpressBruteForce;
    const deliveryManager = global.RutaExpressDeliveryManager;
    const visualization = global.RutaExpressVisualization;

    if (!data || !greedy || !bruteForce || !deliveryManager || !visualization) {
      throw new Error('No fue posible cargar todos los módulos de RutaExpress.');
    }

    const elements = {
      form: document.querySelector('#delivery-form'),
      formError: document.querySelector('#form-error'),
      deliveryList: document.querySelector('#delivery-list'),
      deliveryCount: document.querySelector('#delivery-count'),
      depotName: document.querySelector('#depot-name'),
      depotCoordinates: document.querySelector('#depot-coordinates'),
      calculateButton: document.querySelector('#calculate-route'),
      resetButton: document.querySelector('#reset-example'),
      nextButton: document.querySelector('#next-step'),
      svg: document.querySelector('#route-svg'),
      mapStatus: document.querySelector('#map-status'),
      shownDistance: document.querySelector('#shown-distance'),
      visibleCount: document.querySelector('#visible-count'),
      totalCount: document.querySelector('#total-count'),
      steps: document.querySelector('#route-steps'),
      summary: document.querySelector('#route-summary'),
      compareButton: document.querySelector('#compare-optimal'),
      comparisonResult: document.querySelector('#comparison-result'),
      greedyDistance: document.querySelector('#greedy-distance'),
      optimalDistance: document.querySelector('#optimal-distance'),
      comparisonSummary: document.querySelector('#comparison-summary'),
    };

    const state = {
      deliveries: copySampleDeliveries(data.SAMPLE_DELIVERIES),
      plan: greedy.buildGreedyRoute(data.DEPOT, data.SAMPLE_DELIVERIES),
      visibleSteps: data.SAMPLE_DELIVERIES.length,
    };

    function render() {
      elements.deliveryCount.textContent = state.deliveries.length;
      elements.depotName.textContent = data.DEPOT.name;
      elements.depotCoordinates.textContent = `Inicio · (${data.DEPOT.x}, ${data.DEPOT.y})`;
      elements.calculateButton.disabled = state.deliveries.length === 0;

      deliveryManager.renderDeliveryList(elements.deliveryList, state.deliveries, removeDelivery);
      visualization.renderRouteMap(elements, data.DEPOT, state.deliveries, state.plan, state.visibleSteps);
      visualization.renderRouteSteps(elements, state.plan, state.visibleSteps);
    }

    function recalculate(showOnlyFirstStep) {
      state.plan = greedy.buildGreedyRoute(data.DEPOT, state.deliveries);
      state.visibleSteps = showOnlyFirstStep && state.plan.steps.length > 0 ? 1 : state.plan.steps.length;
      render();
    }

    function removeDelivery(id) {
      state.deliveries = state.deliveries.filter((delivery) => delivery.id !== id);
      deliveryManager.showFormError(elements.formError, '');
      recalculate(false);
    }

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = deliveryManager.readAndValidateForm(elements.form);

      if (!result.valid) {
        deliveryManager.showFormError(elements.formError, result.error);
        return;
      }

      state.deliveries.push({ id: createDeliveryId(), ...result.delivery });
      deliveryManager.clearForm(elements.form, elements.formError);
      recalculate(false);
    });

    elements.calculateButton.addEventListener('click', () => recalculate(true));

    elements.resetButton.addEventListener('click', () => {
      state.deliveries = copySampleDeliveries(data.SAMPLE_DELIVERIES);
      deliveryManager.showFormError(elements.formError, '');
      elements.form.reset();
      recalculate(false);
    });

    elements.nextButton.addEventListener('click', () => {
      if (state.visibleSteps < state.plan.steps.length) {
        state.visibleSteps += 1;
        render();
      }
    });

    elements.compareButton.addEventListener('click', () => {
      const optimal = bruteForce.buildOptimalRoute(data.DEPOT, state.deliveries);

      elements.comparisonResult.hidden = false;
      elements.greedyDistance.textContent = visualization.formatDistance(state.plan.totalDistance);

      if (!optimal.feasible) {
        elements.optimalDistance.textContent = '—';
        elements.comparisonSummary.textContent =
          `Fuerza bruta desactivada: hay ${state.deliveries.length} entregas y el límite es ${bruteForce.MAX_BRUTE_FORCE_DELIVERIES} (probar todas las rutas posibles tomaría demasiado tiempo).`;
        return;
      }

      const difference = state.plan.totalDistance - optimal.totalDistance;
      elements.optimalDistance.textContent = visualization.formatDistance(optimal.totalDistance);
      elements.comparisonSummary.textContent =
        difference <= 0.001
          ? 'Greedy encontró la ruta óptima en este caso.'
          : `Greedy recorre ${visualization.formatDistance(difference)} unidades más que la ruta óptima.`;
    });

    render();
  });
})(window);
