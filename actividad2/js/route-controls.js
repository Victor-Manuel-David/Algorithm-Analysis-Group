(function loadTemporaryControls(global) {
  'use strict';
  global.RouteControls = {
    populateLocationSelects: function populateLocationSelects() {},
    validateRoute: function validateRoute() {
      return { valid: false, message: 'Algoritmo pendiente de implementación.' };
    },
    showError: function showError(element, message) { element.textContent = message || ''; },
    renderRouteResult: function renderRouteResult() {},
  };
})(window);
