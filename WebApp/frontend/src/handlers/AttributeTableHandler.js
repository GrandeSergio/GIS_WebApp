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

      const data = features.map((feature) => {
        const properties = feature.getProperties();
        delete properties.geometry;
        return properties;
      });

      this.setAttributeTableData(data);
      this.setShowTable(true);
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
