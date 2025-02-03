import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

/**
 * Returns a base style for all vector layers.
 * @param {Object} [options] - Optional parameters to customize the style.
 * @param {string} [options.fillColor='rgba(0, 123, 255, 0.5)'] - Fill color of vector features.
 * @param {string} [options.strokeColor='#007bff'] - Stroke color for vector borders.
 * @param {number} [options.strokeWidth=2] - Border stroke width.
 * @param {string} [options.text=''] - Default label text.
 */
const baseVectorStyle = (options = {}) => {
  const {
    fillColor = 'rgba(0, 123, 255, 0.5)',
    strokeColor = '#007bff',
    strokeWidth = 2,
    text = '',
  } = options;

  return new Style({
    fill: new Fill({
      color: fillColor,
    }),
    stroke: new Stroke({
      color: strokeColor,
      width: strokeWidth,
    }),
    text: new Text({
      font: '14px Arial, sans-serif',
      fill: new Fill({
        color: 'black',
      }),
      stroke: new Stroke({
        color: 'white',
        width: 2,
      }),
      text: text,
    }),
  });
};

// Function to extract fill color from baseVectorStyle
const getBaseColor = () => {
  const style = baseVectorStyle(); // Pobieramy bazowy styl
  const rgbaColor = style.getFill().getColor();

  if (typeof rgbaColor === 'string' && rgbaColor.startsWith('rgba')) {
    const [r, g, b, a] = rgbaColor
      .replace(/rgba|\(|\)|\s/g, '')
      .split(',')
      .map(Number);
    return { r, g, b, a };
  }

  if (Array.isArray(rgbaColor)) {
    const [r, g, b, a] = rgbaColor;
    return { r, g, b, a };
  }

  return { r: 0, g: 0, b: 0, a: 1 };
};

export { baseVectorStyle, getBaseColor };
