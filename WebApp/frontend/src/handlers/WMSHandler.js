import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import {
  get as getProjection,
  Projection,
  transformExtent,
  addProjection,
} from 'ol/proj';
import proj4 from 'proj4';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles the integration and management of WMS layers on a map.
 * @class
 */
class WMSHandler {
  /**
   * @param {Object} map - The map instance to which WMS layers will be added.
   * @param {Function} setLayers - A setter function to manage the state of map layers.
   * @param {Function} setShowAddWMSLayerModal - A function to toggle the WMS layer modal visibility.
   */
  constructor(map, setLayers, setShowAddWMSLayerModal) {
    this.map = map;
    this.setLayers = setLayers;
    this.setShowAddWMSLayerModal = setShowAddWMSLayerModal;
  }

  /**
   * Extracts a list of available layers from WMS GetCapabilities response.
   * @param {XMLDocument} capabilities - The WMS capabilities XML document.
   * @returns {Array<Object>} An array of unique layers with their name and title.
   * @throws {Error} If an error occurs during parsing.
   */
  getAvailableLayers(capabilities) {
    try {
      const layers = capabilities.getElementsByTagName('Layer');
      const availableLayers = [];

      for (let i = 0; i < layers.length; i++) {
        const layerName =
          layers[i].getElementsByTagName('Name')[0]?.textContent;
        const title =
          layers[i].getElementsByTagName('Title')[0]?.textContent || layerName;

        if (layerName) {
          availableLayers.push({
            name: layerName,
            title,
          });
        }
      }

      const uniqueLayers = Array.from(
        new Map(availableLayers.map((layer) => [layer.name, layer])).values()
      );
      return uniqueLayers;
    } catch (error) {
      console.error(
        'Error fetching available layers from capabilities:',
        error
      );
      return [];
    }
  }

  /**
   * Fetches and parses the list of available layers from a WMS server.
   * @param {string} url - The URL of the WMS server.
   * @returns {Promise<Array<Object>>} A promise resolving to an array of available layers.
   * @throws {Error} If an error occurs during the fetch operation.
   */
  async fetchAvailableLayers(url) {
    try {
      const capabilities = await this.fetchCapabilities(url);
      if (!capabilities) return [];

      return this.getAvailableLayers(capabilities);
    } catch (error) {
      console.error('Error fetching available layers:', error);
      return [];
    }
  }

  /**
   * Fetches the WMS GetCapabilities document from the server.
   * @param {string} url - The URL of the WMS server.
   * @returns {Promise<XMLDocument|null>} A promise resolving to the WMS capabilities document, or null if fetching fails.
   * @throws {Error} If the fetch fails or encounters CORS issues.
   */
  async fetchCapabilities(url) {
    try {
      let response = await fetch(`${url}?SERVICE=WMS&REQUEST=GetCapabilities`, {
        mode: 'cors',
      });

      if (!response.ok) {
        console.warn('Direct fetch failed, trying with proxy...');
        const corsProxy = 'https://cors-anywhere.herokuapp.com/';
        const proxiedUrl = `${corsProxy}${url}`;
        response = await fetch(
          `${proxiedUrl}?SERVICE=WMS&REQUEST=GetCapabilities`,
          { mode: 'cors' }
        );

        if (!response.ok) throw new Error('CORS fetch failed even with proxy.');
      }

      const text = await response.text();

      const parser = new DOMParser();
      const capabilities = parser.parseFromString(text, 'text/xml');
      return capabilities;
    } catch (error) {
      console.error('Error fetching WMS Capabilities:', error);
      return null;
    }
  }

  /**
   * Parses the WMS Capabilities document to extract information for a specific layer.
   * @param {XMLDocument} capabilities - The WMS capabilities XML document.
   * @param {string} targetLayer - The name of the target layer to retrieve details for.
   * @returns {Object} An object containing details about the layer, including CRS and bounding box.
   * @throws {Error} If the target layer is not found.
   */
  parseCapabilities(capabilities, targetLayer) {
    const layers = capabilities.getElementsByTagName('Layer');
    for (let i = 0; i < layers.length; i++) {
      const layerName = layers[i].getElementsByTagName('Name')[0]?.textContent;
      if (layerName === targetLayer) {
        const crsElements = layers[i].getElementsByTagName('CRS');
        const crsList = Array.from(crsElements).map((crs) => crs.textContent);

        const bboxElements = layers[i].getElementsByTagName('BoundingBox');
        const bbox = {};
        Array.from(bboxElements).forEach((bboxElement) => {
          const crs =
            bboxElement.getAttribute('CRS') || bboxElement.getAttribute('SRS');
          const minx = parseFloat(bboxElement.getAttribute('minx'));
          const miny = parseFloat(bboxElement.getAttribute('miny'));
          const maxx = parseFloat(bboxElement.getAttribute('maxx'));
          const maxy = parseFloat(bboxElement.getAttribute('maxy'));
          bbox[crs] = [minx, miny, maxx, maxy];
        });

        return {
          layerName,
          crsList,
          bbox,
        };
      }
    }

    throw new Error(`Layer "${targetLayer}" not found in WMS Capabilities.`);
  }

  /**
   * Ensures that a projection is registered in the map for a given CRS code.
   * @param {string} crsCode - The CRS code (e.g., 'EPSG:4326') to ensure is registered.
   * @param {string} crsDef - The projection definition string in proj4 format.
   */
  ensureProjection(crsCode, crsDef) {
    if (!getProjection(crsCode)) {
      proj4.defs(crsCode, crsDef);
      addProjection(new Projection({ code: crsCode }));
    }
  }

  /**
   * Handles the addition and integration of WMS layers into the map.
   * @param {string} url - The URL of the WMS server.
   * @param {Array<string>} selectedLayers - Array of layer names to be added.
   * @returns {Promise<Array<Object>>} A promise resolving to a list of available layers after processing.
   * @throws {Error} If fetching or processing the WMS layers fails.
   */
  async handleWMSLayers(url, selectedLayers) {
    if (!this.map) {
      console.error('Map is not ready, wait for full initialization');
      return;
    }

    try {
      const capabilities = await this.fetchCapabilities(url);
      if (!capabilities)
        throw new Error('Cannot fetch capabilities! Check your URL.');

      const availableLayers = this.getAvailableLayers(capabilities);

      const addedLayers = [];
      let combinedExtent = null;

      for (const layerName of selectedLayers) {
        const { crsList, bbox } = this.parseCapabilities(
          capabilities,
          layerName
        );
        const mapProjection = this.map.getView().getProjection().getCode();

        const layerProjection = crsList.includes(mapProjection)
          ? mapProjection
          : crsList.includes('EPSG:3857')
            ? 'EPSG:3857'
            : crsList[0];

        if (!layerProjection)
          throw new Error(`Not supported projection for layer: ${layerName}`);

        const newLayer = new TileLayer({
          source: new TileWMS({
            url,
            params: {
              LAYERS: layerName,
              FORMAT: 'image/png',
              CRS: layerProjection,
              TRANSPARENT: true,
            },
          }),
        });

        newLayer.setZIndex(1);
        this.map.addLayer(newLayer);

        this.setLayers((prev) => [
          ...prev,
          {
            id: uuidv4(),
            name: layerName,
            layer: newLayer,
            isVector: false,
            active: true,
          },
        ]);

        addedLayers.push(newLayer);

        if (bbox) {
          const layerExtent = bbox[mapProjection];
          if (layerExtent) {
            combinedExtent = combinedExtent
              ? [...combinedExtent, ...layerExtent]
              : layerExtent;
          }
        }
      }

      if (combinedExtent) {
        this.map.getView().fit(combinedExtent, { size: this.map.getSize() });
      }

      return availableLayers;
    } catch (error) {
      console.error('Error handling WMS layer:', error);
      throw error;
    }
  }

  /**
   * Adds a single WMS layer to the map.
   * @param {Object} layerData - The data object containing the layer name and URL.
   * @param {string} layerData.name - The name of the layer to be added.
   * @param {string} layerData.url - The URL of the WMS server.
   * @param {boolean} [skipFit=false] - Indicates whether to skip adjusting the map's view to the layer's extent.
   * @returns {Promise<Object|null>} A promise resolving to the bounding box information or null on failure.
   * @throws {Error} If the addition of the WMS layer fails.
   */
  async addWMSLayer(layerData, skipFit = false) {
    const { name, url } = layerData;

    if (!this.map) {
      console.error('Map is not ready, wait for full initialization');
      alert('Map still loading. Wait a moment and try again.');
      return null;
    }

    try {
      const capabilities = await this.fetchCapabilities(url);
      if (!capabilities)
        throw new Error('Cannot fetch capabilities! Check your URL.');

      const { crsList, bbox } = this.parseCapabilities(capabilities, name);
      const mapProjection = this.map.getView().getProjection().getCode();

      const layerProjection = crsList.includes(mapProjection)
        ? mapProjection
        : crsList.includes('EPSG:3857')
          ? 'EPSG:3857'
          : crsList[0];

      if (!layerProjection)
        throw new Error(`Not supported projection for layer: ${name}`);

      if (!getProjection(layerProjection)) {
        const crsDefinition = proj4.defs(layerProjection);
        if (!crsDefinition)
          throw new Error(`Projection ${layerProjection} is not supported.`);
        this.ensureProjection(layerProjection, crsDefinition);
      }

      const newLayer = new TileLayer({
        source: new TileWMS({
          url,
          params: {
            LAYERS: name,
            FORMAT: 'image/png',
            CRS: layerProjection,
            TRANSPARENT: true,
          },
          serverType: 'geoserver',
        }),
      });

      newLayer.setZIndex(1);

      this.map.addLayer(newLayer);

      this.setLayers((prev) => [
        ...prev,
        {
          id: uuidv4(),
          name,
          layer: newLayer,
          isVector: false,
          active: true,
        },
      ]);

      return { bbox };
    } catch (error) {
      console.error('Error adding WMS layer:', error);
      alert(`Error adding WMS layer: ${error.message}`);
      return null;
    }
  }
}

export default WMSHandler;
