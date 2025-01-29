import VectorLayer from 'ol/layer/Vector';

/**
 * Class LayerZoom
 * Provides functionality to zoom the map either to the extent of a specific layer
 * based on its id or to a specific feature based on its properties.
 *
 * @param {Object} map - The map object from OpenLayers.
 * @param {Array} layersState - An array representing the current state of layers, containing
 *                              objects with `id` and `layer` properties.
 */
class LayerZoom {
  constructor(map, layersState) {
    this.map = map;
    this.layersState = layersState;
  }

  /**
   * Zooms to the extent of a specific layer on the map.
   *
   * @param {string} layerId - The ID of the target layer to zoom to.
   */
  zoomToLayerExtent(layerId) {
    // Find the target layer in the layersState array using the provided layerId.
    const targetLayer = this.layersState.find((layer) => layer.id === layerId);

    // Check if the target layer exists and is an instance of OpenLayers' VectorLayer.
    if (targetLayer && targetLayer.layer instanceof VectorLayer) {
      // Get the source object of the layer, which contains the features and their geometries.
      const source = targetLayer.layer.getSource();

      // Get the extent (bounding box) of the features in the source layer.
      const extent = source.getExtent();

      // Validate the extent. Ensure it exists, contains valid numbers, and features are present in the layer.
      if (!extent || extent.every(isNaN) || source.getFeatures().length === 0) {
        console.error(
          `Cannot zoom: Layer with id "${layerId}" does not have valid data.`
        );
        return;
      }

      // If both the map object and extent are valid, adjust the view to fit the layer's extent.
      if (this.map && extent) {
        this.map.getView().fit(extent, {
          size: this.map.getSize(),
          maxZoom: 18,
          padding: [20, 20, 20, 20],
        });
      }
    }
  }

  /**
   * Zooms the map to the extent of a specific feature matched by its properties.
   *
   * @param {Object} featureProperties - An object containing key-value pairs to identify the target feature.
   */
  zoomToFeature(featureProperties) {
  // Sprawdź poprawność stanu warstw
  if (!this.layersState || this.layersState.length === 0) {
    console.error('Cannot zoom: layersState is empty or invalid.');
    return;
  }

  let targetFeature = null; // Przechowuje znalezioną cechę

  // Iteruj przez wszystkie wektorowe warstwy
  for (const { layer } of this.layersState) {
    if (layer instanceof VectorLayer) {
      const source = layer.getSource(); // Pobierz źródło warstwy
      const features = source.getFeatures(); // Pobierz wszystkie cechy

      // Próbuj znaleźć cechę po ID, jeśli taka właściwość istnieje
      targetFeature = features.find(
        (feature) => feature.getId() === featureProperties.id
      );

      // Jeśli nie znaleziono po ID, szukaj cechy po właściwościach
      if (!targetFeature) {
        targetFeature = features.find((feature) =>
          Object.keys(featureProperties).every(
            (key) => feature.get(key) === featureProperties[key]
          )
        );
      }

      // Jeśli znaleziono cechę, przerywamy pętlę
      if (targetFeature) break;
    }
  }

  // Jeśli nie znaleziono cechy
  if (!targetFeature) {
    console.error('Feature not found in the available vector layers.');
    return;
  }

  // Powiększ do znalezionej cechy
  const geometry = targetFeature.getGeometry();
  if (geometry) {
    const extent = geometry.getExtent();
    this.map.getView().fit(extent, {
      size: this.map.getSize(),
      maxZoom: 18,
      padding: [20, 20, 20, 20],
    });
  } else {
    console.error('Target feature does not have a valid geometry.');
  }
}
}

export default LayerZoom;
