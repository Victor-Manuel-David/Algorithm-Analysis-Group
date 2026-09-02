(function loadTemporaryManager(global) {
  'use strict';
  global.RutaExpressDeliveryManager = {
    renderDeliveryList: function renderDeliveryList() {},
    readAndValidateForm: function readAndValidateForm() {
      return { valid: false, error: 'Gestión de entregas pendiente.' };
    },
    showFormError: function showFormError(element, message) { element.textContent = message || ''; },
    clearForm: function clearForm(form) { form.reset(); },
  };
})(window);
