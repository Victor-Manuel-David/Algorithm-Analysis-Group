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

  function generateRandomDeliveries(count) {
    const names = ['Punto A', 'Punto B', 'Punto C', 'Punto D', 'Punto E', 'Punto F', 'Punto G', 'Punto H'];
    return Array.from({ length: count }, (_, index) => ({
      id: createDeliveryId(),
      name: names[index] || `Punto ${index + 1}`,
      x: Math.round(Math.random() * 100),
      y: Math.round(Math.random() * 100),
    }));
  }
  function sliceRoutesToVisibleSteps(routes, totalVisible) {
    let remaining = totalVisible;
    return routes.map((route) => {
      const stepsToShow = Math.max(0, Math.min(route.steps.length, remaining));
      remaining -= stepsToShow;
      return {
        ...route,
        steps: route.steps.slice(0, stepsToShow),
        orderedStops: route.orderedStops.slice(0, stepsToShow),
      };
    });
  }

  function countTotalSteps(routes) {
    return routes.reduce((total, route) => total + route.steps.length, 0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const data = global.RutaExpressData;
    const greedy = global.RutaExpressGreedy;
    const bruteForce = global.RutaExpressBruteForce;
    const multiRoute = global.RutaExpressMultiRoute;
    const deliveryManager = global.RutaExpressDeliveryManager;
    const visualization = global.RutaExpressVisualization;

    if (!data || !greedy || !bruteForce || !multiRoute || !deliveryManager || !visualization) {
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
      randomizeButton: document.querySelector('#randomize-deliveries'),
      nextButton: document.querySelector('#next-step'),
      svg: document.querySelector('#route-svg'),
      mapStatus: document.querySelector('#map-status'),
      legend: document.querySelector('#map-legend'),
      metricLabelDistance: document.querySelector('#metric-label-distance'),
      metricLabelCount: document.querySelector('#metric-label-count'),
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
      driverCountInput: document.querySelector('#driver-count'),
      generateMultiRouteButton: document.querySelector('#generate-multi-route'),
      multiRouteError: document.querySelector('#multi-route-error'),
    };

    const state = {
      deliveries: copySampleDeliveries(data.SAMPLE_DELIVERIES),
      plan: greedy.buildGreedyRoute(data.DEPOT, data.SAMPLE_DELIVERIES),
      visibleSteps: data.SAMPLE_DELIVERIES.length,
      mode: 'single',
      multiRoutes: [],
      multiVisibleSteps: 0,
    };

    function render() {
      elements.deliveryCount.textContent = state.deliveries.length;
      elements.depotName.textContent = data.DEPOT.name;
      elements.depotCoordinates.textContent = `Inicio · (${data.DEPOT.x}, ${data.DEPOT.y})`;
      elements.calculateButton.disabled = state.deliveries.length === 0;
      elements.generateMultiRouteButton.disabled = state.deliveries.length === 0;

      deliveryManager.renderDeliveryList(elements.deliveryList, state.deliveries, removeDelivery);

      if (state.mode === 'multi') {
        const visibleRoutes = sliceRoutesToVisibleSteps(state.multiRoutes, state.multiVisibleSteps);
        const totalSteps = countTotalSteps(state.multiRoutes);

        visualization.renderMultiRouteMap(elements, data.DEPOT, visibleRoutes);
        visualization.renderMultiRouteSteps(elements, visibleRoutes);
        elements.nextButton.hidden = state.multiVisibleSteps >= totalSteps;
      } else {
        visualization.renderRouteMap(elements, data.DEPOT, state.deliveries, state.plan, state.visibleSteps);
        visualization.renderRouteSteps(elements, state.plan, state.visibleSteps);
      }
    }

    function recalculate(showOnlyFirstStep) {
      const driverCount = Number(elements.driverCountInput.value) || 1;

      if (driverCount > 1) {
        state.multiRoutes = multiRoute.buildMultiRoute(data.DEPOT, state.deliveries, driverCount);
        const totalSteps = countTotalSteps(state.multiRoutes);
        state.multiVisibleSteps = showOnlyFirstStep && totalSteps > 0 ? 1 : totalSteps;
        state.mode = 'multi';
      } else {
        state.plan = greedy.buildGreedyRoute(data.DEPOT, state.deliveries);
        state.visibleSteps = showOnlyFirstStep && state.plan.steps.length > 0 ? 1 : state.plan.steps.length;
        state.mode = 'single';
      }

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
      elements.driverCountInput.value = 1;
      deliveryManager.showFormError(elements.formError, '');
      elements.form.reset();
      recalculate(false);
    });

    elements.randomizeButton.addEventListener('click', () => {
      state.deliveries = generateRandomDeliveries(5);
      elements.driverCountInput.value = Math.floor(Math.random() * 5) + 1; // entre 1 y 5
      deliveryManager.showFormError(elements.formError, '');
      recalculate(false);
    });

    elements.nextButton.addEventListener('click', () => {
      if (state.mode === 'multi') {
        const totalSteps = countTotalSteps(state.multiRoutes);
        if (state.multiVisibleSteps < totalSteps) {
          state.multiVisibleSteps += 1;
          render();
        }
      } else if (state.visibleSteps < state.plan.steps.length) {
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

    elements.generateMultiRouteButton.addEventListener('click', () => {
      const driverCount = Number(elements.driverCountInput.value);

      if (!Number.isInteger(driverCount) || driverCount < 1) {
        elements.multiRouteError.textContent = 'Ingresa un número entero de repartidores mayor o igual a 1.';
        return;
      }

      elements.multiRouteError.textContent = '';
      state.multiRoutes = multiRoute.buildMultiRoute(data.DEPOT, state.deliveries, driverCount);
      state.mode = 'multi';
      render();
    });

    render();
  });
})(window);
