/**
 * A utility class to handle operations on basemap layers for an OpenLayers map.
 */
class BasemapHandler {
  /**
   * Initializes the BasemapHandler instance.
   *
   * @param {Object} map - The OpenLayers map instance.
   * @param {Array} basemapState - Array of basemap configuration objects.
   * @param {Function} setBasemaps - Function to update the state of basemaps.
   */
  constructor(map, basemapState, setBasemaps) {
    this.map = map;
    this.basemapState = basemapState;
    this.setBasemaps = setBasemaps;
  }

  /**
   * Updates the active basemap layer on the map.
   *
   * @param {string} id - The unique identifier of the basemap to activate.
   */
  changeBasemap(id) {
    this.setBasemaps((prevBasemaps) =>
      prevBasemaps.map((bm) => {
        const isActive = bm.id === id;

        if (this.map) {
          if (!this.map.getLayers().getArray().includes(bm.layer)) {
            this.map.addLayer(bm.layer);
          }

          bm.layer.setVisible(isActive);

          if (isActive) {
            bm.layer.setZIndex(0);
          }
        }

        return { ...bm, active: isActive };
      })
    );
  }

  /**
   * Sets the ZIndex of all basemap layers to ensure they are behind other layers.
   */
  setBasemapsZIndex() {
    this.basemapState.forEach((bm) => {
      if (bm.layer) {
        bm.layer.setZIndex(-1);
      }
    });
  }
}

export default BasemapHandler;
