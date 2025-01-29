import { FetchGeoJSON } from './VectorHandler';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

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
 * Class to handle layer-related functionalities (e.g., color picker and styles)
 */
class StyleHandler {
  constructor(layers, setActiveLayerColor, setShowColorPicker) {
    this.layers = layers;
    this.setActiveLayerColor = setActiveLayerColor;
    this.setShowColorPicker = setShowColorPicker;
  }

  /**
   * Toggles visibility of the color picker for a specific layer
   *
   * @param {string} layerId - ID of the layer whose picker should be toggled
   */
  toggleColorPicker(layerId) {
    this.setShowColorPicker((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }

  /**
   * Handles color change for a specific layer
   *
   * @param {string} layerId - ID of the layer to change color
   * @param {Object} color - Color object from the color picker (RGBA format)
   */
  handleColorChange(layerId, color) {
  this.setActiveLayerColor((prev) => ({
    ...prev,
    [layerId]: color.rgb, // Zapisz nowy kolor aktywnej warstwy
  }));

  const layer = this.layers.find((l) => l.id === layerId);

  if (layer && layer.layer) {
    const { r, g, b, a } = color.rgb;

    // Pobierz aktualną kolumnę etykiet (jeśli istnieje)
    const columnName = layer.labelColumn || null;

    // Ustaw nowy styl warstwy z uwzględnieniem etykiet
    layer.layer.setStyle((feature) =>
      generateLayerStyle(feature, { r, g, b, a }, columnName)
    );
  }
}
}

/**
 * Class to handle adding labels to layers
 */
class LabelHandler {
  constructor(layers, activeLayerColor) {
    this.layers = layers;
    this.activeLayerColor = activeLayerColor;
  }

  /**
   * Adds labels to a specific layer based on the specified column
   *
   * @param {string} layerId - ID of the layer to which labels should be added
   * @param {string} columnName - Name of the column to use for the labels
   */
  addLabelsToLayer(layerId, columnName) {
  const layer = this.layers.find((l) => l.id === layerId);

  if (layer && layer.layer) {
    const source = layer.layer.getSource();

    // Pobierz aktywny kolor warstwy
    const activeColor = this.activeLayerColor[layerId] || { r: 120, g: 120, b: 240, a: 0.6 };

    // Zapisz nazwę kolumny etykiet w obiekcie warstwy
    layer.labelColumn = columnName;

    // Ustaw nowy styl warstwy
    layer.layer.setStyle((feature) =>
      generateLayerStyle(feature, activeColor, columnName)
    );

    // Odśwież źródło danych, aby wymusić renderowanie
    source.changed();
  }
}

refreshLabels(layerId) {
  const layer = this.layers.find((l) => l.id === layerId);

  if (layer && layer.layer && layer.layer.getSource()) {
  console.log(`Refreshing labels for layer: ${layerId}`);
    layer.layer.getSource().changed(); // Odśwież dynamicznie źródło danych warstwy
  }
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

// Funkcja generująca styl warstwy, uwzględniająca kolor i etykiety
const generateLayerStyle = (feature, activeColor, columnName = null) => {
  const { r, g, b, a } = activeColor || { r: 120, g: 120, b: 240, a: 0.6 };

  // Tworzenie podstawowego stylu geometrii
  const geometryStyle = new Style({
    fill: new Fill({
      color: `rgba(${r}, ${g}, ${b}, ${a})`, // Kolor wypełnienia
    }),
    stroke: new Stroke({
      color: `rgba(${r}, ${g}, ${b}, ${a})`, // Kolor obrysu
      width: 2,
    }),
    text: columnName
      ? new Text({
          font: '12px Arial',
          text: feature.get(columnName) || '', // Pobranie dynamicznej etykiety
          overflow: true,
          fill: new Fill({
            color: `rgba(${r}, ${g}, ${b}, 1)`, // Kolor tekstu
          }),
          stroke: new Stroke({
            color: 'rgba(255, 255, 255, 1)', // Obrys tekstu
            width: 3,
          }),
          placement: 'point',
          textAlign: 'center',
          offsetY: -10, // Umieszczanie etykiety
        })
      : null, // Brak etykiety, jeśli kolumna nie jest ustawiona
  });

  return geometryStyle;
};

export { ToggleLayerVisibility, StyleHandler, LabelHandler, reorderLayers };
