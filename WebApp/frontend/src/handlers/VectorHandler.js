import { Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';

// Class to handle geometry simplification based on zoom levels
class SimplifyGeometry {
  /**
   * Handles dynamic geometry simplification based on zoom levels.
   * @param {VectorLayer} vectorLayer - The vector layer containing features to simplify.
   * @param {ol/Map} map - OpenLayers map instance.
   * @param {number} [maxZoom=18] - Maximum zoom level for simplification logic.
   * @param {number} [minZoom=4] - Minimum zoom level for simplification logic.
   * @param {number} [maxTolerance=500] - Maximum tolerance for geometry simplification.
   */
  constructor(vectorLayer, map, maxZoom = 18, minZoom = 4, maxTolerance = 500) {
    if (!(vectorLayer instanceof VectorLayer)) {
      console.error('Provided layer is not a VectorLayer.');
      return;
    }

    this.vectorLayer = vectorLayer;
    this.map = map;
    this.maxZoom = maxZoom;
    this.minZoom = minZoom;
    this.maxTolerance = maxTolerance;
    this.originalGeometries = new Map();

    this.storeOriginalGeometries();
    this.simplifyOnZoomChange = this.simplifyOnZoomChange.bind(this);

    // Add zoom listener
    this.map.getView().on('change:resolution', this.simplifyOnZoomChange);

    // Simplify initially based on the current zoom level
    this.simplifyOnZoomChange();
  }

  /**
   * Saves original geometries of all features in the vector layer.
   */
  storeOriginalGeometries() {
    const source = this.vectorLayer.getSource();
    const features = source.getFeatures();

    features.forEach((feature) => {
      if (!this.originalGeometries.has(feature)) {
        this.originalGeometries.set(feature, feature.getGeometry().clone());
      }
    });
  }

  /**
   * Adjusts geometry simplification dynamically based on current zoom level.
   */
  simplifyOnZoomChange() {
    const zoom = this.map.getView().getZoom();

    // Calculate dynamic tolerance
    const dynamicTolerance = Math.max(
      0,
      this.maxTolerance *
        ((this.maxZoom - zoom) / (this.maxZoom - this.minZoom))
    );

    this.vectorLayer
      .getSource()
      .getFeatures()
      .forEach((feature) => {
        const originalGeometry = this.originalGeometries.get(feature);
        if (!originalGeometry) return;

        if (dynamicTolerance > 0) {
          const simplifiedGeometry =
            originalGeometry.simplify(dynamicTolerance);
          feature.setGeometry(simplifiedGeometry);
        } else {
          // Reset to original geometry at high zoom
          feature.setGeometry(originalGeometry);
        }
      });
  }

  /**
   * Removes zoom change listener and clears stored geometries.
   */
  cleanup() {
    this.map.getView().un('change:resolution', this.simplifyOnZoomChange);
    this.originalGeometries.clear();
  }
}

/**
 * Handles fetching GeoJSON data from a URL and adding it to a vector layer.
 */
class FetchGeoJSON {
  /**
   * Initializes the FetchGeoJSON class.
   * @param {string} url - The URL to fetch GeoJSON data from.
   */
  constructor(url) {
    this.url = url;
  }

  /**
   * Fetches GeoJSON data from the URL and adds it to the specified vector layer.
   * @param {VectorLayer} vectorLayer - Vector layer to which the fetched features will be added.
   */
  async fetchAndAddFeatures(vectorLayer) {
    if (!(vectorLayer instanceof VectorLayer)) {
      console.error('Provided layer is not a VectorLayer.');
      return;
    }

    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      vectorLayer.getSource().addFeatures(
        new GeoJSON().readFeatures(data, {
          dataProjection: 'EPSG:3857',
          featureProjection: 'EPSG:3857',
        })
      );
    } catch (error) {
      console.error('Error fetching or processing GeoJSON:', error);
    }
  }
}

export { SimplifyGeometry, FetchGeoJSON };
