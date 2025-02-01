import React, { useEffect, useState, useRef } from 'react';
import 'ol/ol.css';
import Navigation from './Navigation';
import Loader from './Loader';
import { basemaps } from '../constants/basemaps';
import { layers } from '../constants/layers';
import FeatureInfo from './FeatureInfo';
import AttributeTable from './AttributeTable';
import { EnableInformationButton, BasemapContainer } from './MapElements';
import {
  ToggleLayerVisibility,
  reorderLayers,
  LabelHandler,
} from '../handlers/LayerHandler';
import LayerZoom from '../handlers/MapInteractions';
import BasemapHandler from '../handlers/BasemapHandler';
import AttributeTableHandler from '../handlers/AttributeTableHandler';
import { initializeMap } from '../handlers/MapInitializer';
import AddWMSLayerModal from './AddWMSLayerModal';
import WMSHandler from '../handlers/WMSHandler';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import UploadVectorModal from './UploadVectorModal';
import handleVectorUpload from '../handlers/UploadVector';

const MapComponent = () => {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [showAddWMSLayerModal, setShowAddWMSLayerModal] = useState(false);
  const featureInfoRef = useRef(null);
  const toggleLayerVisibilityInstance = useRef(null);
  const LayerZoomRef = useRef(null);
  const basemapHandlerRef = useRef(null);
  const attributeTableHandlerRef = useRef(null);
  const wmsHandlerRef = useRef(null);

  const [attributeTableData, setAttributeTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const [basemapState, setBasemaps] = useState(basemaps);
  const [layersState, setLayers] = useState(layers);

  const [infoEnabled, setInfoEnabled] = useState(false);
  const labelHandlerRef = useRef(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  /**
   * Initializes the map on the component's first render.
   * Cleans up the map instance when the component unmounts.
   */
  useEffect(() => {
    const initialMap = initializeMap(
      mapRef,
      basemapState,
      layersState,
      setLoading
    );
    setMap(initialMap);

    initialMap.on('moveend', () => {
      layersState.forEach((layer) => {
        if (
          layer.layer &&
          layer.layer.getVisible() &&
          layer.isVector &&
          labelHandlerRef.current
        ) {
          labelHandlerRef.current.refreshLabels(layer.id);
        }
      });
    });

    return () => {
      initialMap.setTarget(null); // Cleanup
    };
  }, []);

  /**
   * Toggles the feature info functionality based on the `infoEnabled` state.
   */
  useEffect(() => {
    if (infoEnabled) {
      if (!featureInfoRef.current) {
        featureInfoRef.current = new FeatureInfo(map);
      }
    } else {
      if (featureInfoRef.current) {
        featureInfoRef.current.cleanup();
        featureInfoRef.current = null;
      }
    }
  }, [infoEnabled, map]);

  /**
   * Initializes map handlers once the map instance is available.
   */
  useEffect(() => {
    if (map) {
      toggleLayerVisibilityInstance.current = new ToggleLayerVisibility(
        map,
        layersState,
        setLayers
      );
      LayerZoomRef.current = new LayerZoom(map, layersState);
      basemapHandlerRef.current = new BasemapHandler(
        map,
        basemapState,
        setBasemaps
      );
      basemapHandlerRef.current.setBasemapsZIndex();
      attributeTableHandlerRef.current = new AttributeTableHandler(
        setAttributeTableData,
        setShowTable
      );
      wmsHandlerRef.current = new WMSHandler(
        map,
        setLayers,
        setShowAddWMSLayerModal
      );
      labelHandlerRef.current = new LabelHandler(layersState);
      map.on('moveend', () => {
        layersState.forEach((layer) => {
          if (
            layer.layer &&
            layer.layer.getVisible() &&
            layer.isVector &&
            labelHandlerRef.current
          ) {
            labelHandlerRef.current.refreshLabels(layer.id);
          }
        });
      });
    }
  }, [map, layersState, basemapState]);

  /**
   * Toggles the visibility of a layer on the map.
   * @param {string} layerId - The ID of the layer to toggle.
   */
  const handleToggleLayerVisibility = (layerId) => {
    if (toggleLayerVisibilityInstance.current) {
      toggleLayerVisibilityInstance.current.toggle(layerId);
    }
  };

  /**
   * Zooms the map to the extent of a given layer.
   * @param {string} layerId - The ID of the layer to zoom to.
   */
  const handleZoomToLayer = (layerId) => {
    if (LayerZoomRef.current) {
      LayerZoomRef.current.zoomToLayerExtent(layerId);
    }
  };

  /**
   * Zooms the map to the extent of a specific feature.
   * @param {Object} featureProperties - Properties of the feature to zoom to.
   */
  const handleZoomToFeature = (featureProperties) => {
    if (LayerZoomRef.current) {
      LayerZoomRef.current.zoomToFeature(featureProperties);
    }
  };

  /**
   * Changes the active basemap on the map.
   * @param {string} id - The ID of the basemap to switch to.
   */
  const handleBasemapChange = (id) => {
    if (basemapHandlerRef.current) {
      basemapHandlerRef.current.changeBasemap(id);
    }
  };

  /**
   * Displays the attribute table for the target layer.
   * @param {Object} targetLayer - The layer whose attributes are displayed.
   */
  const handleShowAttributeTable = (targetLayer) => {
    if (attributeTableHandlerRef.current) {
      const features = targetLayer.layer.getSource().getFeatures();
      const attributeData = features.map((feature) => feature.getProperties());

      setAttributeTableData(attributeData);
      setShowTable(true);
    }
  };

  /**
   * Adds a new WMS (Web Map Service) layer to the map.
   * @param {Object} layerData - Configuration data for the WMS layer.
   */
  const handleAddWMSLayer = (layerData) => {
    if (wmsHandlerRef.current) {
      wmsHandlerRef.current.addWMSLayer(layerData);
    }
  };

  /**
   * Tracks the source index when dragging a layer in the layer list.
   * @param {DragEvent} e - The drag event.
   * @param {number} index - The index of the layer being dragged.
   */
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('sourceIndex', index);
  };

  /**
   * Updates the layer order after a drag-and-drop operation finishes.
   * @param {DragEvent} e - The drop event.
   * @param {number} destinationIndex - The index where the dragged layer is dropped.
   */
  const handleDrop = (e, destinationIndex) => {
    e.preventDefault();

    const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'), 10);

    if (sourceIndex !== destinationIndex) {
      setLayers((prevLayers) => {
        const updatedLayers = reorderLayers(
          prevLayers,
          sourceIndex,
          destinationIndex
        );
        return updatedLayers;
      });
    }
  };
  /**
   * Prevents the default drag-over behavior during a drag-and-drop operation.
   * @param {DragEvent} e - The drag-over event.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Navigation
        layers={layersState}
        setLayers={setLayers}
        toggleLayerVisibility={handleToggleLayerVisibility}
        zoomToLayer={handleZoomToLayer}
        toggleInfo={setInfoEnabled}
        dragAndDropHandlers={{
          handleDragStart,
          handleDragOver,
          handleDrop,
        }}
        showAttributeTable={handleShowAttributeTable}
        openAddWMSLayerModal={() => setShowAddWMSLayerModal(true)}
        openUploadModal={openUploadModal}
        aria-label="Layer navigation"
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <Loader loading={loading} />
        <div
          ref={mapRef}
          id="map"
          aria-label="Interactive map"
          style={{ width: '100%', height: '100%' }}
        />

        <EnableInformationButton
          aria-label={
            infoEnabled
              ? 'Disable feature information'
              : 'Enable feature information'
          }
          infoEnabled={infoEnabled}
          toggleInfo={() => setInfoEnabled(!infoEnabled)}
        />

        <BasemapContainer
          aria-label="Choose a basemap"
          basemapState={basemapState}
          handleBasemapChange={handleBasemapChange}
        />
        {showTable && (
          <AttributeTable
            data={attributeTableData}
            onClose={() => attributeTableHandlerRef.current.closeTable()}
            onZoomToFeature={handleZoomToFeature}
          />
        )}

        <AddWMSLayerModal
          aria-labelledby="add-wms-layer-modal"
          show={showAddWMSLayerModal}
          onHide={() => setShowAddWMSLayerModal(false)}
          onSubmit={handleAddWMSLayer}
          wmsHandler={wmsHandlerRef.current}
        />
        <UploadVectorModal
          show={showUploadModal}
          onHide={() => setShowUploadModal(false)}
          onUpload={(geoJsonData, fileName) =>
            handleVectorUpload(geoJsonData, fileName, map, setLayers)
          }
        />
      </div>
    </div>
  );
};

export default MapComponent;
