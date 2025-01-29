/**
 * A handler responsible for managing an attribute table's data and visibility.
 */
class AttributeTableHandler {
  /**
   * Creates an instance of AttributeTableHandler.
   * @param {Function} setAttributeTableData - A function to set the attribute table's data.
   * @param {Function} setShowTable - A function to control the visibility of the attribute table.
   */
  constructor(setAttributeTableData, setShowTable) {
    this.setAttributeTableData = setAttributeTableData;
    this.setShowTable = setShowTable;
  }

  /**
   * Displays the attribute table for a given target layer if it contains valid vector data.
   * @param {Object} targetLayer - The layer to analyze and display data from.
   * @param {boolean} targetLayer.isVector - Specifies if the layer is of vector type.
   * @param {Object} targetLayer.layer - The layer's internal representation.
   * @param {Function} targetLayer.layer.getSource - Retrieves the source of the layer.
   */
  showTable(targetLayer) {
  if (targetLayer && targetLayer.isVector) {
    const source = targetLayer.layer.getSource();
    const features = source.getFeatures();

    // Zamiana danych cech na odpowiednie formaty (bez 'geometry')
    const data = features.map((feature) => {
      const properties = feature.getProperties();
      const sanitizedProperties = {};

      Object.entries(properties).forEach(([key, value]) => {
        if (key !== "geometry") { // Usuń 'geometry'
          // Serializacja obiektów na string
          sanitizedProperties[key] =
            typeof value === "object" ? JSON.stringify(value) : value;
        }
      });

      return sanitizedProperties;
    });

    this.setAttributeTableData(data);
    this.setShowTable(true); // Otwórz tabelę w UI
  } else {
    console.error('Target layer is invalid or not a vector layer.');
  }
}

  /**
   * Closes the attribute table by setting its visibility to false.
   */
  closeTable() {
    this.setShowTable(false);
  }
}

export default AttributeTableHandler;
