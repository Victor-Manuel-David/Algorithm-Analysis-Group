(function startTemporaryInterface() {
  'use strict';
  document.addEventListener('DOMContentLoaded', function showInitialState() {
    document.querySelector('#graph-status').textContent =
      'Interfaz lista · algoritmo y visualización pendientes.';
    document.querySelector('#calculate-route').disabled = true;
    document.querySelector('#next-iteration').disabled = true;
  });
})();
