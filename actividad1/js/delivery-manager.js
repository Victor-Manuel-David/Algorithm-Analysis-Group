(function loadDeliveryManager(global) {
  'use strict';

  function renderDeliveryList(container, deliveries, onRemove) {
    container.replaceChildren();

    if (deliveries.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'empty-list';
      emptyItem.textContent = 'Agrega al menos una entrega para calcular una ruta.';
      container.append(emptyItem);
      return;
    }

    deliveries.forEach((delivery) => {
      const item = document.createElement('li');
      item.className = 'delivery-item';

      const pin = document.createElement('span');
      pin.className = 'delivery-pin';
      pin.setAttribute('aria-hidden', 'true');
      pin.textContent = '●';

      const info = document.createElement('span');
      info.className = 'delivery-info';

      const name = document.createElement('strong');
      name.textContent = delivery.name;

      const coordinates = document.createElement('small');
      coordinates.textContent = `Coordenada (${delivery.x}, ${delivery.y})`;

      const removeButton = document.createElement('button');
      removeButton.className = 'remove-button';
      removeButton.type = 'button';
      removeButton.setAttribute('aria-label', `Eliminar ${delivery.name}`);
      removeButton.textContent = '×';
      removeButton.addEventListener('click', () => onRemove(delivery.id));

      info.append(name, coordinates);
      item.append(pin, info, removeButton);
      container.append(item);
    });
  }

  function readAndValidateForm(form) {
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const rawX = String(formData.get('x') || '').trim();
    const rawY = String(formData.get('y') || '').trim();
    const x = Number(rawX);
    const y = Number(rawY);

    if (!name) {
      return { valid: false, error: 'Escribe un nombre para la entrega.' };
    }

    if (!rawX || !rawY || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) {
      return { valid: false, error: 'Las coordenadas X y Y deben estar entre 0 y 100.' };
    }

    return { valid: true, delivery: { name, x, y } };
  }

  function showFormError(errorElement, message) {
    errorElement.textContent = message || '';
  }

  function clearForm(form, errorElement) {
    form.reset();
    showFormError(errorElement, '');
    form.elements.name.focus();
  }

  global.RutaExpressDeliveryManager = Object.freeze({
    renderDeliveryList,
    readAndValidateForm,
    showFormError,
    clearForm,
  });
})(window);
