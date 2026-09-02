(function loadTemporaryData(global) {
  'use strict';
  global.RutaExpressData = {
    DEPOT: { id: 'depot', name: 'Centro logístico', x: 12, y: 52 },
    SAMPLE_DELIVERIES: [],
  };
})(window);

(function loadSampleData(global) {
  'use strict';

  const DEPOT = Object.freeze({
    id: 'depot',
    name: 'Centro logístico',
    x: 12,
    y: 52,
  });

  const SAMPLE_DELIVERIES = Object.freeze([
    Object.freeze({ id: 'a', name: 'Librería Central', x: 30, y: 27 }),
    Object.freeze({ id: 'b', name: 'Café Aurora', x: 49, y: 70 }),
    Object.freeze({ id: 'c', name: 'Clínica Norte', x: 76, y: 22 }),
    Object.freeze({ id: 'd', name: 'Mercado Verde', x: 87, y: 63 }),
    Object.freeze({ id: 'e', name: 'Edificio Luna', x: 60, y: 46 }),
  ]);

  global.RutaExpressData = Object.freeze({ DEPOT, SAMPLE_DELIVERIES });
})(window);