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
    const deliveryManager = global.RutaExpressDeliveryManager;
    const visualization = global.RutaExpressVisualization;

    if (!data || !greedy || !deliveryManager || !visualization) {
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

    render();
  });
})(window);
