(function loadRouteVisualization(global) {
  'use strict';

  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  function formatDistance(value) {
    return value.toFixed(1).replace('.', ',');
  }

  function createSvgElement(tagName, attributes) {
    const element = document.createElementNS(SVG_NAMESPACE, tagName);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    return element;
  }

  function drawDepot(svg, depot) {
    const group = createSvgElement('g', {});
    const halo = createSvgElement('circle', {
      cx: depot.x,
      cy: depot.y,
      r: 7,
      fill: 'none',
      stroke: '#20243b',
      'stroke-opacity': 0.18,
    });
    const point = createSvgElement('circle', {
      cx: depot.x,
      cy: depot.y,
      r: 4.2,
      fill: '#20243b',
    });
    const label = createSvgElement('text', {
      x: depot.x,
      y: depot.y + 1.35,
      'text-anchor': 'middle',
      'font-size': 4,
      'font-weight': 900,
      fill: '#ffffff',
    });
    label.textContent = 'C';
    group.append(halo, point, label);
    svg.append(group);
  }

  function drawDelivery(svg, delivery, order, visited) {
    const group = createSvgElement('g', {});
    const point = createSvgElement('circle', {
      cx: delivery.x,
      cy: delivery.y,
      r: 4,
      fill: visited ? '#4a4fc4' : '#ffffff',
      stroke: '#4a4fc4',
      'stroke-width': 1,
    });
    const label = createSvgElement('text', {
      x: delivery.x,
      y: delivery.y + 1.3,
      'text-anchor': 'middle',
      'font-size': 3.7,
      'font-weight': 900,
      fill: visited ? '#ffffff' : '#4a4fc4',
    });
    const title = createSvgElement('title', {});

    label.textContent = order || '·';
    title.textContent = `${order || 'Pendiente'}. ${delivery.name} (${delivery.x}, ${delivery.y})`;
    group.append(point, label, title);
    svg.append(group);
  }

  function renderRouteMap(elements, depot, deliveries, plan, visibleSteps) {
    const shownSteps = plan.steps.slice(0, visibleSteps);
    const routeOrder = new Map(plan.orderedStops.map((stop, index) => [stop.id, index + 1]));
    const visitedIds = new Set(shownSteps.map((step) => step.to.id));
    const shownDistance = shownSteps.reduce((total, step) => total + step.distance, 0);

    elements.svg.replaceChildren();

    shownSteps.forEach((step) => {
      const line = createSvgElement('line', {
        class: 'route-line',
        x1: step.from.x,
        y1: step.from.y,
        x2: step.to.x,
        y2: step.to.y,
        stroke: '#4a4fc4',
        'stroke-width': 1.3,
        'stroke-linecap': 'round',
        pathLength: 160,
      });
      elements.svg.append(line);
    });

    drawDepot(elements.svg, depot);
    deliveries.forEach((delivery) => {
      drawDelivery(elements.svg, delivery, routeOrder.get(delivery.id), visitedIds.has(delivery.id));
    });

    elements.shownDistance.textContent = formatDistance(shownDistance);
    elements.visibleCount.textContent = visibleSteps;
    elements.totalCount.textContent = plan.steps.length;
    elements.mapStatus.textContent =
      visibleSteps === plan.steps.length
        ? 'Ruta completa'
        : `Mostrando ${visibleSteps} de ${plan.steps.length} decisiones`;
  }

  function createStepItem(step) {
    const item = document.createElement('li');
    item.className = 'route-step';

    const content = document.createElement('div');
    content.className = 'step-content';

    const number = document.createElement('span');
    number.className = 'step-number';
    number.textContent = step.number;

    const description = document.createElement('div');
    description.className = 'step-description';

    const route = document.createElement('div');
    route.className = 'step-route';

    const origin = document.createElement('span');
    origin.textContent = step.from.name;

    const arrow = document.createElement('span');
    arrow.className = 'step-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    const destination = document.createElement('span');
    destination.textContent = step.to.name;

    const explanation = document.createElement('p');
    explanation.textContent = `Elige la entrega pendiente más cercana: ${formatDistance(step.distance)} unidades.`;

    route.append(origin, arrow, destination);
    description.append(route, explanation);
    content.append(number, description);
    item.append(content);
    return item;
  }

  function renderRouteSteps(elements, plan, visibleSteps) {
    const shownSteps = plan.steps.slice(0, visibleSteps);
    elements.steps.replaceChildren();
    elements.summary.replaceChildren();

    if (shownSteps.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-steps';
      empty.textContent = 'No hay decisiones que mostrar todavía.';
      elements.steps.append(empty);
    } else {
      shownSteps.forEach((step) => elements.steps.append(createStepItem(step)));
    }

    elements.nextButton.hidden = visibleSteps >= plan.steps.length;

    if (plan.steps.length > 0 && visibleSteps === plan.steps.length) {
      const card = document.createElement('div');
      card.className = 'summary-card';

      const text = document.createElement('span');
      const label = document.createElement('small');
      const result = document.createElement('strong');
      const arrow = document.createElement('span');

      label.textContent = 'Resultado final';
      result.textContent = `${plan.steps.length} entregas · ${formatDistance(plan.totalDistance)} unidades`;
      arrow.textContent = '›';
      arrow.setAttribute('aria-hidden', 'true');

      text.append(label, result);
      card.append(text, arrow);
      elements.summary.append(card);
    }
  }

  global.RutaExpressVisualization = Object.freeze({
    formatDistance,
    renderRouteMap,
    renderRouteSteps,
  });
})(window);
