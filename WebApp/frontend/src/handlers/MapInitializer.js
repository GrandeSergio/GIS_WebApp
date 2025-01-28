import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { get as getProjection } from 'ol/proj';
/**
 * Function to initialize a map with basemap and vector layers.
 * @param {object} mapRef - React reference to the DOM element for the map.
 * @param {Array} basemapState - Array of basemap objects. Each object should have:
 *   - {boolean} active: Indicates if the basemap is active.
 *   - {object} layer: OpenLayers layer object.
 * @param {Array} layersState - Array of vector layer objects. Each object should have:
 *   - {object} layer: OpenLayers vector layer object.
 * @param {function} setLoading - Function to set loading state (false when loading is done).
 * @returns {object} OpenLayers Map instance.
 */
export const initializeMap = (
  mapRef,
  basemapState,
  layersState,
  setLoading
) => {
  const map = new Map({
    target: mapRef.current,
    layers: [
      ...basemapState.filter((bm) => bm.active).map((bm) => bm.layer),
      ...layersState.map((l) => l.layer),
    ],
    view: new View({
      center: fromLonLat([19, 52]),
      zoom: 6,
      projection: getProjection('EPSG:3857'),
    }),
  });

  basemapState.forEach((bm) => {
    bm.layer.setZIndex(0);
  });
  layersState.forEach((layer, index) => {
    if (layer.layer) {
      layer.layer.setZIndex(index + 1);
    }
  });

  setLoading(false);

  return map;
};
