import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';

/**
 * Array of basemap configurations for use with OpenLayers.
 * Each basemap includes information such as id, name, active state,
 * and the OpenLayers TileLayer defining its source.
 */
export const basemaps = [
  /**
   * OpenStreetMap basemap configuration.
   * @property {string} id - Unique identifier for the basemap.
   * @property {string} name - Display name of the basemap.
   * @property {boolean} active - Indicates whether the basemap is active.
   * @property {TileLayer} layer - OpenLayers layer object for the basemap.
   */
  {
    id: 'osm',
    name: 'OpenStreetMap',
    active: true,
    layer: new TileLayer({
      source: new OSM(),
    }),
  },
  {
    /**
     * Google Satellite basemap configuration.
     * @property {string} id - Unique identifier for the basemap.
     * @property {string} name - Display name of the basemap.
     * @property {boolean} active - Indicates whether the basemap is active.
     * @property {TileLayer} layer - OpenLayers layer object for the basemap.
     */
    id: 'google-satellite',
    name: 'Google Satellite',
    active: false,
    layer: new TileLayer({
      source: new XYZ({
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      }),
    }),
  },
];
