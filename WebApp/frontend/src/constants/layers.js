import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

/**
 * @typedef {Object} Layer
 * @property {number} id - Unique identifier for the layer.
 * @property {string} name - Display name of the layer.
 * @property {boolean} active - Indicates whether the layer is currently active.
 * @property {boolean} isVector - Indicates if the layer is a vector layer.
 * @property {string} apiUrl - URL for fetching GeoJSON data of the layer.
 * @property {import('ol/layer/Vector').default} layer - OpenLayers VectorLayer instance.
 */

/**
 * An array of layer configurations.
 * @type {Layer[]}
 */
export const layers = [
  {
    id: 1,
    name: 'Korytarze Ekologiczne',
    active: false,
    isVector: true,
    apiUrl: 'http://localhost:8000/WebApp/api/layers/korytarze/',
    layer: new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 123, 255, 0.5)',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(0, 123, 255, 0.5)',
        }),
      }),
    }),
  },
  {
    id: 2,
    name: 'JCWPRzeczne',
    active: false,
    isVector: true,
    apiUrl: 'http://localhost:8000/WebApp/api/layers/jcwprzeczne/',
    layer: new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 123, 255, 0.5)',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(0, 123, 255, 0.5)',
        }),
      }),
    }),
  },
];
