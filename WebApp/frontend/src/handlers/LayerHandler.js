import { FetchGeoJSON } from './VectorHandler';

/**
 * Class to handle toggling visibility and actions related to map layers
 *
 * @param {Object} map - A reference to the map object
 * @param {Array} layers - Current state of layers with metadata
 * @param {Function} setLayers - Method to update the layer state
 */

class ToggleLayerVisibility {
  constructor(map, layers, setLayers) {
    this.map = map;
    this.layers = layers;
    this.setLayers = setLayers;
  }

  /**
   * Toggles the visibility of a specified layer and triggers actions if necessary
   *
   * @param {string} layerId - Unique identifier for the layer
   */
  toggle(layerId) {
    this.setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          const isActive = !layer.active;

          if (this.map && layer.layer) {
            // Updates the visibility state of the layer on the map
            layer.layer.setVisible(isActive);

            if (isActive && layer.isVector) {
              // Retrieves the data source for the vector layer
              const source = layer.layer.getSource();

              if (source.getFeatures().length === 0) {
                // Marks the layer as loading by updating its state
                this.setLayers((prev) =>
                  prev.map((l) =>
                    l.id === layerId ? { ...l, loading: true } : l
                  )
                );

                // Instance for handling GeoJSON feature fetch operations
                const fetchHandler = new FetchGeoJSON(layer.apiUrl);
                fetchHandler.fetchAndAddFeatures(layer.layer).then(() => {
                  console.log(
                    `Dane dla warstwy "${layer.name}" zostały wczytane.`
                  );

                  this.setLayers((prev) =>
                    prev.map((l) =>
                      l.id === layerId
                        ? {
                            ...l,
                            loading: false,
                            hasAttributes: true,
                            active: true,
                          }
                        : l
                    )
                  );
                });

                return { ...layer, loading: true };
              }
            }
          }

          return { ...layer, active: isActive }; // Ustawiamy aktywność
        }
        return layer;
      })
    );
  }
}

/**
 * Reorders the layers in the UI and updates their z-indexes
 *
 * @param {Array} layers - List of current layers
 * @param {number} sourceIndex - Index of the layer being moved
 * @param {number} destinationIndex - Target position of the layer
 * @returns {Array} - Updated list of layers with adjusted z-indexes
 */
const reorderLayers = (layers, sourceIndex, destinationIndex) => {
  const updatedLayers = Array.from(layers);

  const [movedLayer] = updatedLayers.splice(sourceIndex, 1);
  updatedLayers.splice(destinationIndex, 0, movedLayer);

  updatedLayers.forEach((layer, index) => {
    if (layer.layer) {
      // Assigns z-index based on the inverse order in the array
      layer.layer.setZIndex(updatedLayers.length - index);
    }
  });

  return updatedLayers;
};

export { ToggleLayerVisibility, reorderLayers };
