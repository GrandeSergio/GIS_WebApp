import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { baseVectorStyle } from '../styles/VectorStyles';

/**
 * Handles the upload of a GeoJSON vector file and adds it as a layer to the map.
 *
 * @param {Object} geoJsonData - The loaded GeoJSON data.
 * @param {Object} map - The OpenLayers map instance.
 * @param {Function} setLayers - Function to update the layers state.
 */
const handleVectorUpload = (geoJsonData, fileName, map, setLayers) => {
  const layerName = fileName.replace(/\.[^/.]+$/, '');
  const features = new GeoJSON().readFeatures(geoJsonData, {
    featureProjection: 'EPSG:3857',
  });

  features.forEach((feature, index) => {
    const properties = feature.getProperties();
    if (!properties.id) {
      feature.setId(`feature-${Date.now()}-${index}`);
    }
  });

  const vectorSource = new VectorSource({
    features,
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: baseVectorStyle(),
  });

  map.addLayer(vectorLayer);

  const attributes =
    features.length > 0
      ? Object.keys(features[0].getProperties()).filter(
          (attr) => attr !== 'geometry'
        )
      : [];

  setLayers((prevLayers) => [
    ...prevLayers,
    {
      id: `vector-${Date.now()}`,
      name: layerName,
      layer: vectorLayer,
      isVector: true,
      hasAttributes: attributes.length > 0,
      attributes,
      active: true,
    },
  ]);
};

export default handleVectorUpload;
