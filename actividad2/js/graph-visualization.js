(function loadGraphVisualization(global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgElement(tagName, attributes) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    return element;
  }

  function edgeKey(fromId, toId) {
    return [fromId, toId].sort().join('|');
  }

  function getPathEdges(path) {
    const edges = new Set();
    for (let index = 1; index < path.length; index += 1) {
      edges.add(edgeKey(path[index - 1], path[index]));
    }
    return edges;
  }

  function drawEdge(svg, graph, edge, highlighted) {
    const from = graph.getNodeById(edge.from);
    const to = graph.getNodeById(edge.to);
    const line = svgElement('line', {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      stroke: highlighted ? '#a7f35a' : '#344765',
      'stroke-width': highlighted ? 1.6 : 0.75,
      'stroke-linecap': 'round',
    });
    const labelGroup = svgElement('g', {});
    const labelX = (from.x + to.x) / 2;
    const labelY = (from.y + to.y) / 2;
    const labelBackground = svgElement('circle', {
      cx: labelX,
      cy: labelY,
      r: 2.45,
      fill: highlighted ? '#a7f35a' : '#16243c',
      stroke: highlighted ? '#a7f35a' : '#344765',
      'stroke-width': 0.45,
    });
    const label = svgElement('text', {
      x: labelX,
      y: labelY + 0.8,
      'text-anchor': 'middle',
      'font-size': 2.5,
      'font-weight': 900,
      fill: highlighted ? '#08101f' : '#c0cce1',
    });
    label.textContent = edge.weight;
    labelGroup.append(labelBackground, label);
    svg.append(line, labelGroup);
  }

  function drawNode(svg, node, state) {
    const group = svgElement('g', {});
    const isStart = node.id === state.startId;
    const isEnd = node.id === state.endId;
    const isCurrent = node.id === state.currentId;
    const isVisited = state.visited.has(node.id);
    const isPath = state.pathNodes.has(node.id);
    let fill = '#13213a';
    let stroke = '#5ce1e6';

    if (isVisited) fill = '#1a3947';
    if (isPath) {
      fill = '#a7f35a';
      stroke = '#d9ffb0';
    }
    if (isCurrent) {
      fill = '#5ce1e6';
      stroke = '#c5fbfd';
    }

    const halo = svgElement('circle', {
      cx: node.x,
      cy: node.y,
      r: isCurrent ? 6.8 : 5.8,
      fill: 'none',
      stroke: isCurrent ? '#5ce1e6' : isPath ? '#a7f35a' : '#5ce1e6',
      'stroke-opacity': isCurrent || isPath ? 0.3 : 0.1,
      'stroke-width': 1,
    });
    const circle = svgElement('circle', {
      cx: node.x,
      cy: node.y,
      r: 4.25,
      fill,
      stroke,
      'stroke-width': 0.8,
    });
    const abbreviation = svgElement('text', {
      x: node.x,
      y: node.y + 1,
      'text-anchor': 'middle',
      'font-size': 2.8,
      'font-weight': 900,
      fill: isPath || isCurrent ? '#08101f' : '#edf3ff',
    });
    const name = svgElement('text', {
      x: node.x,
      y: node.y + 7.3,
      'text-anchor': 'middle',
      'font-size': 2.6,
      'font-weight': 750,
      fill: '#dce7fa',
    });
    abbreviation.textContent = node.shortName.slice(0, 2).toUpperCase();
    name.textContent = node.shortName;

    if (isStart || isEnd) {
      const marker = svgElement('text', {
        x: node.x,
        y: node.y - 6.3,
        'text-anchor': 'middle',
        'font-size': 2.35,
        'font-weight': 900,
        fill: isStart ? '#5ce1e6' : '#ffcc66',
      });
      marker.textContent = isStart ? 'ORIGEN' : 'DESTINO';
      group.append(marker);
    }

    group.append(halo, circle, abbreviation, name);
    svg.append(group);
  }

  function renderGraph(elements, graph, result, visibleIteration) {
    elements.svg.replaceChildren();
    const snapshot = result && visibleIteration > 0 ? result.snapshots[visibleIteration - 1] : null;
    const pathEdges = result ? getPathEdges(result.path) : new Set();
    const state = {
      startId: result ? result.startId : null,
      endId: result ? result.endId : null,
      currentId: snapshot ? snapshot.currentId : null,
      visited: new Set(snapshot ? snapshot.visited : []),
      pathNodes: new Set(result ? result.path : []),
    };

    graph.EDGES.forEach((edge) => {
      drawEdge(elements.svg, graph, edge, pathEdges.has(edgeKey(edge.from, edge.to)));
    });
    graph.NODES.forEach((node) => drawNode(elements.svg, node, state));

    elements.graphSize.textContent = `${graph.NODES.length} nodos · ${graph.EDGES.length} conexiones`;
    if (!result) {
      elements.graphStatus.textContent = 'Selecciona un origen y un destino.';
    } else if (snapshot) {
      const node = graph.getNodeById(snapshot.currentId);
      elements.graphStatus.textContent = `Iteración ${snapshot.iteration}: se fija ${node.name} con distancia ${snapshot.currentDistance}.`;
    }
  }

  function formatDistance(distance) {
    return distance === Infinity ? '∞' : String(distance);
  }

  function describeUpdates(snapshot, graph) {
    if (snapshot.updates.length === 0) {
      return 'No se encontraron distancias menores desde este nodo.';
    }

    return snapshot.updates
      .map((update) => {
        const node = graph.getNodeById(update.nodeId);
        const previous = update.oldDistance === Infinity ? '∞' : update.oldDistance;
        return `${node.name}: ${previous} → ${update.newDistance}`;
      })
      .join(' · ');
  }

  function renderIteration(elements, graph, result, visibleIteration) {
    const hasIteration = result && visibleIteration > 0;
    elements.iterationEmpty.hidden = hasIteration;
    elements.iterationContent.hidden = !hasIteration;
    elements.nextButton.disabled = !result || visibleIteration >= result.snapshots.length;
    elements.iterationCounter.textContent = result
      ? `${visibleIteration} / ${result.snapshots.length}`
      : '0 / 0';

    if (!hasIteration) return;

    const snapshot = result.snapshots[visibleIteration - 1];
    const currentNode = graph.getNodeById(snapshot.currentId);
    elements.iterationNumber.textContent = snapshot.iteration;
    elements.selectedNode.textContent = currentNode.name;
    elements.selectedDistance.textContent = `${snapshot.currentDistance} min`;
    elements.distanceTable.replaceChildren();

    graph.NODES.forEach((node) => {
      const row = document.createElement('tr');
      const nodeCell = document.createElement('td');
      const distanceCell = document.createElement('td');
      const previousCell = document.createElement('td');
      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      const isCurrent = node.id === snapshot.currentId;
      const isVisited = snapshot.visited.includes(node.id);
      const previousNode = snapshot.previous[node.id]
        ? graph.getNodeById(snapshot.previous[node.id]).name
        : '—';

      nodeCell.textContent = node.name;
      distanceCell.textContent = formatDistance(snapshot.distances[node.id]);
      distanceCell.className = 'distance-value';
      previousCell.textContent = previousNode;
      status.className = `status-chip${isCurrent ? ' current' : isVisited ? ' visited' : ''}`;
      status.textContent = isCurrent ? 'Seleccionado' : isVisited ? 'Visitado' : 'Pendiente';
      statusCell.append(status);
      row.append(nodeCell, distanceCell, previousCell, statusCell);
      elements.distanceTable.append(row);
    });

    elements.iterationNote.textContent = describeUpdates(snapshot, graph);
  }

  global.GraphVisualization = Object.freeze({ renderGraph, renderIteration });
})(window);
