var hideLabel = function(label) {
    label.labelObject.style.opacity = 0;
    label.labelObject.style.transition = 'opacity 0s';
};
var showLabel = function(label) {
    label.labelObject.style.opacity = 1;
    label.labelObject.style.transition = 'opacity 1s';
};
labelEngine = new labelgun.default(hideLabel, showLabel);

var id = 0;
var labels = [];
var totalMarkers = 0;

function resetLabels(markers) {
    labelEngine.reset();
    var i = 0;
    for (var j = 0; j < markers.length; j++) {
        markers[j].eachLayer(function(label){
            addLabel(label, ++i);
        });
    }
  labelEngine.update();
}

function addLabel(layer, id) {

  // This is ugly but there is no getContainer method on the tooltip :(
  if (layer.getTooltip()) {
      var label = layer.getTooltip()._source._tooltip._container;
      if (label) {

        // We need the bounding rectangle of the label itself
        var rect = label.getBoundingClientRect();

        // We convert the container coordinates (screen space) to Lat/lng
        var bottomLeft = map.containerPointToLatLng([rect.left, rect.bottom]);
        var topRight = map.containerPointToLatLng([rect.right, rect.top]);
        var boundingBox = {
          bottomLeft : [bottomLeft.lng, bottomLeft.lat],
          topRight   : [topRight.lng, topRight.lat]
        };

        // Ingest the label into labelgun itself
        labelEngine.ingestLabel(
          boundingBox,
          id,
          parseInt(Math.random() * (5 - 1) + 1), // Weight
          label,
          "Test " + id,
          false
        );

        // If the label hasn't been added to the map already
        // add it and set the added flag to true
        if (!layer.added) {
          layer.addTo(map);
          layer.added = true;
        }
      }
  }
}

// Ajuste manual del mapa de calor para mejorar la continuidad visual.
window.addEventListener('load', function () {
    if (typeof map === 'undefined' ||
        typeof layer_Siniestrosmapa_calortodoshastaenero_3 === 'undefined' ||
        typeof layer_Siniestrosmapa_calortodoshastaenero_3.setOptions !== 'function') {
        return;
    }

    function ajustarCalorAlZoom() {
        var zoom = map.getZoom();
        var radius = 40;
        var blur = 30;

        if (zoom === 14) {
            radius = 46;
            blur = 34;
        } else if (zoom === 15) {
            radius = 54;
            blur = 38;
        } else if (zoom === 16) {
            radius = 64;
            blur = 44;
        } else if (zoom >= 17) {
            radius = 78;
            blur = 52;
        }

        layer_Siniestrosmapa_calortodoshastaenero_3.setOptions({
            radius: radius,
            blur: blur,
            maxZoom: 17,
            minOpacity: 0.15,
            gradient: {
                0.00: '#ffffb2',
                0.25: '#fed976',
                0.50: '#feb24c',
                0.70: '#fd8d3c',
                0.85: '#f03b20',
                1.00: '#bd0026'
            }
        });

        if (typeof layer_Siniestrosmapa_calortodoshastaenero_3.redraw === 'function') {
            layer_Siniestrosmapa_calortodoshastaenero_3.redraw();
        }
    }

    ajustarCalorAlZoom();
    map.on('zoomend', ajustarCalorAlZoom);
});

// Nombres legibles de las capas y metadatos en español.
document.documentElement.lang = 'es';
document.title = 'Mapa de calor de siniestros viales - Centenario';

window.addEventListener('load', function () {
    function reemplazarTextosDelControl() {
        var control = document.querySelector('.leaflet-control-layers');
        if (!control) {
            return;
        }

        var cambios = {
            'mancha urbana 2021': 'Área urbana',
            'ejido Cente': 'Límite municipal',
            'OSM Standard': 'Mapa base'
        };
        var walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT, null);
        var nodos = [];

        while (walker.nextNode()) {
            nodos.push(walker.currentNode);
        }

        nodos.forEach(function (nodo) {
            var texto = nodo.nodeValue;
            Object.keys(cambios).forEach(function (nombreAnterior) {
                texto = texto.replace(nombreAnterior, cambios[nombreAnterior]);
            });
            nodo.nodeValue = texto;
        });
    }

    reemplazarTextosDelControl();
    window.setTimeout(reemplazarTextosDelControl, 250);
});

// Pestañas para alternar entre los dos mapas.
window.addEventListener('load', function () {
    var contenedor = document.createElement('div');
    contenedor.style.position = 'fixed';
    contenedor.style.top = '10px';
    contenedor.style.left = '50%';
    contenedor.style.transform = 'translateX(-50%)';
    contenedor.style.zIndex = '1000';
    contenedor.style.display = 'flex';
    contenedor.style.background = 'rgba(255,255,255,0.95)';
    contenedor.style.border = '1px solid #888';
    contenedor.style.borderRadius = '6px';
    contenedor.style.overflow = 'hidden';
    contenedor.style.boxShadow = '0 1px 5px rgba(0,0,0,0.35)';
    contenedor.style.fontFamily = 'Arial, sans-serif';

    function crearPestana(texto, enlace, activa) {
        var a = document.createElement('a');
        a.textContent = texto;
        a.href = enlace;
        a.style.padding = '8px 14px';
        a.style.textDecoration = 'none';
        a.style.fontSize = '14px';
        a.style.fontWeight = activa ? 'bold' : 'normal';
        a.style.color = activa ? '#ffffff' : '#333333';
        a.style.background = activa ? '#b30000' : '#ffffff';
        a.style.borderRight = activa ? '1px solid #b30000' : '1px solid #cccccc';
        return a;
    }

    contenedor.appendChild(crearPestana('Mapa de calor', 'index.html', true));
    contenedor.appendChild(crearPestana('Mapa con datos', '../condatos/index.html', false));
    document.body.appendChild(contenedor);
});