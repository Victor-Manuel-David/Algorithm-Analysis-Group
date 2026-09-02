(function startTemporaryApplication() {
  'use strict';
  document.addEventListener('DOMContentLoaded', function showInitialState() {
    document.querySelector('#map-status').textContent = 'Estructura lista · módulos JavaScript pendientes';
    document.querySelector('#delivery-list').innerHTML =
      '<li class="empty-list">La gestión de entregas se agregará en los siguientes commits.</li>';
    document.querySelector('#calculate-route').disabled = true;
    document.querySelector('#next-step').hidden = true;
  });
})();
