import React, { useState } from 'react';
import { Button, Form, Dropdown } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { SmallSpinner } from './Loader';
import { SketchPicker } from 'react-color';
import { StyleHandler, LabelHandler } from '../handlers/LayerHandler';
import { useEffect, useRef } from 'react';
import '../styles/Tooltip.module.css';
import '../styles/Hoover.css';

/**
 * Navigation component to manage layers, their attributes, styles, and related functionalities.
 * @param {Object[]} layers - Array of layer objects, each containing properties like id, name, active, loading, etc.
 * @param {Function} setLayers - Function to update the list of layers with modifications.
 * @param {Function} toggleLayerVisibility - Toggles the visibility of a layer by its ID.
 * @param {Function} zoomToLayer - Zooms to a selected layer by its ID.
 * @param {Function} showAttributeTable - Displays the attribute table for the selected layer.
 * @param {Function} openAddWMSLayerModal - Opens the modal for adding WMS/WMTS layers.
 * @param {Object} dragAndDropHandlers - Contains drag-and-drop handler functions for reordering layers visually.
 * @param {Function} dragAndDropHandlers.handleDragStart - Handles dragStart event with event and index as parameters.
 * @param {Function} dragAndDropHandlers.handleDragOver - Handles dragOver event to handle reordering.
 * @param {Function} dragAndDropHandlers.handleDrop - Handles drop event with event and index for reordering.
 * @param {Function} openUploadModal - Opens the modal for uploading vector layers.
 * @param {Object} styleHandler - An instance of StyleHandler providing methods to manage and change layer styles.
 * @param {Object} labelHandler - An instance of LabelHandler for manipulating and assigning labels to layers.
 * @param {Object} labelHandlerRef - Mutable reference object for the LabelHandler.
 * @param {Object} labelPanel - State object managing the label panel visibility and currently selected layer.
 */
const Navigation = ({
  layers,
  setLayers,
  toggleLayerVisibility,
  zoomToLayer,
  showAttributeTable,
  openAddWMSLayerModal,
  dragAndDropHandlers,
  openUploadModal,
}) => {
  /**
   * State to manage the visibility of the layers panel.
   */
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  /**
   * State to enable or disable reorder mode for layers.
   */
  const [isReorderEnabled, setReorderEnabled] = useState(false);

  /**
   * State to track the active colors for each layer.
   */
  const [activeLayerColor, setActiveLayerColor] = useState({});

  /**
   * State to track the visibility of the color picker for each layer.
   */
  const [showColorPicker, setShowColorPicker] = useState({});

  /**
   * State to track whether a layer's name is being edited.
   */
  const [isEditing, setIsEditing] = useState({});

  /**
   * State to store the temporary editable name of a layer.
   */
  const [editableName, setEditableName] = useState({});

  /**
   * Handles style-related operations for layers.
   */
  const styleHandler = new StyleHandler(
    layers,
    setActiveLayerColor,
    setShowColorPicker
  );

  /**
   * State to manage the visibility of the label panel and associated layer data.
   */
  const [labelPanel, setLabelPanel] = useState({
    isOpen: false,
    layerId: null,
  });

  /**
   * State to store available attributes of the currently selected vector layer.
   */
  const [currentAttributes, setCurrentAttributes] = useState([]);

  /**
   * Mutable reference to the LabelHandler instance for dynamic use.
   */
  const labelHandlerRef = useRef(null);

  /**
   * Function to close the label panel.
   */
  const closeLabelPanel = () => {
    setLabelPanel({ isOpen: false, layerId: null });
  };

  /**
   * Function to open the label panel for a specific layer.
   * If the layer is a vector type, retrieves and filters its attributes excluding `geometry`.
   *
   * @param {string} layerId - The ID of the layer to open the label panel for.
   */
  const openLabelPanel = (layerId) => {
    setLabelPanel({ isOpen: true, layerId });

    const selectedLayer = layers.find((layer) => layer.id === layerId);
    if (selectedLayer && selectedLayer.isVector) {
      const source = selectedLayer.layer.getSource();
      const features = source.getFeatures();

      const attributes =
        features.length > 0
          ? Object.keys(features[0].getProperties()).filter(
              (attr) => attr !== 'geometry'
            )
          : [];

      setCurrentAttributes(attributes);
    } else {
      console.error('Layer is not vector or invalid');
      setCurrentAttributes([]);
    }
  };

  /**
   * Updates the LabelHandler instance when the `layers` or `activeLayerColor` state changes.
   */
  useEffect(() => {
    labelHandlerRef.current = new LabelHandler(layers, activeLayerColor);
  }, [layers, activeLayerColor]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Navigation Sidebar */}
      <div
        style={{
          width: '100px',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
        }}
      >
        {/* Layers button */}
        <Button
          variant="light"
          onClick={() => setShowLayersPanel(!showLayersPanel)}
          data-tooltip="Layers"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="bi bi-layers" style={{ fontSize: '24px' }}></i>
        </Button>

        {/* WMS/WMTS */}
        <Button
          variant="light"
          onClick={openAddWMSLayerModal}
          data-tooltip="Add WMS/WMTS Layer"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="24"
            height="24"
            fill="currentColor"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M49.953 5A45 45 0 0 0 7.758 34.498H2.5A3.002 3.002 0 0 0-.502 37.5v25A3.002 3.002 0 0 0 2.5 65.502h5.256A45 45 0 0 0 50 95a45 45 0 0 0 42.242-29.498H97.5a3.002 3.002 0 0 0 3.002-3.002v-25a3.002 3.002 0 0 0-3.002-3.002h-5.256A45 45 0 0 0 50 5a45 45 0 0 0-.047 0zm2.297 5.113c4.74.807 9.271 4.713 12.84 11.194c1.15 2.089 2.18 4.433 3.068 6.974H52.25V10.113zm-4.5.178v17.99H32.676c.889-2.541 1.916-4.885 3.066-6.974c3.36-6.1 7.571-9.915 12.008-11.016zM37.383 11.51c-2.092 2.116-3.971 4.698-5.584 7.627c-1.512 2.745-2.813 5.819-3.881 9.144h-12.11A40.522 40.522 0 0 1 37.384 11.51zm26.469.416c8.457 3.071 15.586 8.88 20.34 16.355H72.91c-1.066-3.326-2.365-6.4-3.877-9.144c-1.509-2.74-3.251-5.174-5.181-7.211zM13.33 32.78h13.328c-.135.561-.246 1.143-.367 1.717h-13.71a38.51 38.51 0 0 1 .75-1.717zm17.977 0H47.75v1.717H30.908c.131-.574.253-1.158.399-1.717zm20.943 0h17.275c.146.56.268 1.143.399 1.717H52.25V32.78zm21.92 0h12.5c.265.565.512 1.138.75 1.717H74.535c-.12-.574-.23-1.156-.365-1.717zm5.967 9.719c3.004 0 5.264.4 6.777 1.197c1.524.798 2.324 1.862 2.4 3.194l-4.834.127c-.206-.745-.654-1.277-1.34-1.6c-.674-.33-1.691-.496-3.052-.496c-1.404 0-2.504.176-3.299.525c-.512.224-.768.523-.768.899c0 .342.24.637.72.88c.609.31 2.09.633 4.44.97c2.352.336 4.088.686 5.21 1.048c1.132.356 2.015.847 2.646 1.473c.642.62.963 1.388.963 2.304c0 .831-.38 1.61-1.143 2.334c-.762.726-1.84 1.266-3.234 1.622c-1.393.349-3.13.523-5.209.523c-3.026 0-5.35-.422-6.973-1.266c-1.622-.85-2.59-2.085-2.906-3.707l4.703-.277c.283.956.855 1.657 1.715 2.105c.871.449 2.04.672 3.51.672c1.557 0 2.728-.198 3.512-.593c.794-.403 1.191-.869 1.191-1.403c0-.343-.168-.634-.506-.87c-.326-.245-.903-.456-1.73-.634c-.566-.118-1.857-.33-3.871-.632c-2.591-.39-4.408-.867-5.454-1.434c-1.47-.798-2.205-1.771-2.205-2.918c0-.738.344-1.425 1.03-2.064c.696-.647 1.692-1.139 2.988-1.475c1.306-.336 2.879-.504 4.719-.504zM10 42.746h4.947l3.61 9.96l4.377-9.96h5.748l4.197 10.127l3.674-10.127h4.865l-5.813 14.496H30.48l-4.77-10.836l-4.752 10.836h-5.242L10 42.746zm33.803 0h7.234l4.344 9.889l4.295-9.889h7.25v14.496h-4.49v-11.41l-4.752 11.41h-4.655l-4.736-11.41v11.41h-4.49V42.746zM12.58 65.502h13.524c.112.573.214 1.154.341 1.715H13.33a38.624 38.624 0 0 1-.75-1.715zm18.129 0H47.75v1.715H31.082c-.137-.56-.25-1.142-.373-1.715zm21.541 0h17.873c-.123.573-.236 1.155-.373 1.715h-17.5v-1.715zm22.473 0H87.42a38.624 38.624 0 0 1-.75 1.715H74.38c.128-.561.23-1.142.343-1.715zm-58.914 6.215h11.824c1.117 3.675 2.518 7.056 4.166 10.049c1.294 2.35 2.762 4.472 4.369 6.316c-8.466-3.07-15.603-8.884-20.36-16.365zm16.554 0H47.75v18.719c-.277-.016-.55-.044-.826-.065c-4.132-1.35-8.032-5.057-11.182-10.777c-1.285-2.335-2.424-4.984-3.379-7.877zm19.887 0h16.219c-.955 2.893-2.094 5.542-3.38 7.877c-3.084 5.602-6.888 9.278-10.925 10.695c-.634.065-1.272.112-1.914.147v-18.72zm20.947 0h10.994a40.555 40.555 0 0 1-19.105 15.877c1.443-1.728 2.766-3.684 3.947-5.828c1.648-2.993 3.049-6.373 4.164-10.05z"></path>
          </svg>
        </Button>
        {/* Upload vector */}
        <Button
          variant="light"
          onClick={() => openUploadModal(true)}
          data-tooltip="Upload Vector"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="bi bi-upload" style={{ fontSize: '24px' }}></i>
        </Button>
      </div>

      {/* Layers pane */}
      {showLayersPanel && (
        <div
          style={{
            width: '250px',
            backgroundColor: 'white',
            borderLeft: '1px solid #ddd',
            borderRight: '1px solid #ddd',
            padding: '20px',
            position: 'relative',
          }}
        >
          <div
            className="mb-3"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h5>Layers</h5>
            {layers.some((layer) => layer.isVector) && (
              <Button
                variant={
                  isReorderEnabled ? 'outline-danger' : 'outline-primary'
                }
                size="sm"
                onClick={() => setReorderEnabled(!isReorderEnabled)}
                data-tooltip={
                  isReorderEnabled ? 'Disable Reorder' : 'Enable Reorder'
                }
                style={{ marginLeft: '10px' }}
              >
                <i
                  className={
                    isReorderEnabled ? 'bi bi-x-lg' : 'bi bi-arrows-move'
                  }
                ></i>{' '}
              </Button>
            )}
          </div>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {layers.map((layer, index) => (
              <li
                key={layer.id}
                draggable={isReorderEnabled}
                onDragStart={
                  isReorderEnabled
                    ? (e) => dragAndDropHandlers.handleDragStart(e, index)
                    : undefined
                }
                onDragOver={
                  isReorderEnabled
                    ? dragAndDropHandlers.handleDragOver
                    : undefined
                }
                onDrop={
                  isReorderEnabled
                    ? (e) => dragAndDropHandlers.handleDrop(e, index)
                    : undefined
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  cursor: isReorderEnabled ? 'grab' : 'default',
                }}
              >
                {/* Reorder */}
                {isReorderEnabled && (
                  <i
                    className="bi bi-arrows-move"
                    data-tooltip="Reorder"
                    style={{
                      marginRight: '10px',
                    }}
                  ></i>
                )}

                {/* Spinner and Checkbox */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flex: 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {layer.loading && <SmallSpinner loading={true} />}{' '}
                  <Form.Check
                    type="checkbox"
                    id={`layer-${layer.id}`}
                    style={{
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '150px',
                      lineHeight: '1.2',
                    }}
                    disabled={layer.loading}
                    label={
                      layer.name.length > 14 ? (
                        <span>{layer.name}</span>
                      ) : (
                        layer.name
                      )
                    }
                    checked={layer.active}
                    onChange={() => toggleLayerVisibility(layer.id)}
                  />
                </div>
                {layer.isVector && (
                  <Dropdown
                    align="end"
                    onToggle={(isOpen) => {
                      if (!isOpen) {
                        setLabelPanel({ isOpen: false, layerId: null });
                        setIsEditing((prev) => ({
                          ...prev,
                          [layer.id]: false,
                        }));
                        setEditableName((prev) => ({
                          ...prev,
                          [layer.id]: '',
                        }));
                        setShowColorPicker((prev) => ({
                          ...prev,
                          [layer.id]: false,
                        }));
                      }
                    }}
                  >
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      id={`dropdown-${layer.id}`}
                      style={{
                        border: 'none',
                      }}
                    >
                      <i className="bi bi-three-dots"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        className="hover-effect"
                        onClick={() => zoomToLayer(layer.id)}
                        disabled={!layer.active || layer.loading}
                      >
                        <i
                          className="bi bi-zoom-in"
                          style={{ marginRight: '10px' }}
                        ></i>
                        Zoom to Layer
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="hover-effect"
                        onClick={() => showAttributeTable(layer)}
                        disabled={!layer.hasAttributes}
                      >
                        <i
                          className="bi bi-table"
                          style={{ marginRight: '10px' }}
                        ></i>
                        Show Attribute Table
                      </Dropdown.Item>
                      {/* Edit Layer Name */}
                      {isEditing[layer.id] ? (
                        <div
                          style={{
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Form.Control
                            type="text"
                            value={editableName[layer.id] || layer.name}
                            onChange={(e) =>
                              setEditableName({
                                ...editableName,
                                [layer.id]: e.target.value,
                              })
                            }
                            autoFocus
                            style={{ maxWidth: '150px' }}
                          />
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              const newName = (
                                editableName[layer.id] || ''
                              ).trim();
                              if (newName && newName !== layer.name) {
                                const updatedLayers = layers.map((l) =>
                                  l.id === layer.id
                                    ? { ...l, name: newName }
                                    : l
                                );
                                setLayers(updatedLayers);
                              }
                              setEditableName((prev) => ({
                                ...prev,
                                [layer.id]: '',
                              }));
                              setIsEditing((prev) => ({
                                ...prev,
                                [layer.id]: false,
                              }));
                            }}
                          >
                            <i className="bi bi-check"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setEditableName((prev) => ({
                                ...prev,
                                [layer.id]: '',
                              }));
                              setIsEditing((prev) => ({
                                ...prev,
                                [layer.id]: false,
                              }));
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        </div>
                      ) : (
                        <Dropdown.Item
                          className="hover-effect"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing((prev) => ({
                              ...prev,
                              [layer.id]: true,
                            }));
                          }}
                        >
                          <i
                            className="bi bi-pencil"
                            style={{ marginRight: '10px' }}
                          ></i>
                          Edit Name
                        </Dropdown.Item>
                      )}
                      {/* Labeling */}
                      <Dropdown.Item
                        className="hover-effect"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLabelPanel(layer.id);
                        }}
                        disabled={!layer.hasAttributes}
                      >
                        <i
                          className="bi bi-fonts"
                          style={{ marginRight: '10px' }}
                        ></i>
                        Add Label
                      </Dropdown.Item>
                      {/* Styling */}
                      <Dropdown.Item
                        className="hover-effect"
                        onClick={(e) => {
                          e.stopPropagation();
                          styleHandler.toggleColorPicker(layer.id);
                        }}
                      >
                        <i
                          className="bi bi-palette"
                          style={{ marginRight: '10px' }}
                        ></i>
                        Change style
                      </Dropdown.Item>
                      {labelPanel.isOpen && labelPanel.layerId === layer.id && (
                        <div
                          style={{
                            padding: '10px',
                            marginTop: '5px',
                            borderTop: '1px solid #ddd',
                            backgroundColor: '#fff',
                            zIndex: 1050,
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '10px',
                            }}
                          >
                            <h5 style={{ margin: 0 }}>Select Column</h5>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={closeLabelPanel}
                              style={{ color: 'black', padding: 0 }}
                              data-tooltip="Close"
                            >
                              <i
                                className="bi bi-x"
                                style={{ fontSize: '1.25rem' }}
                              ></i>
                            </Button>
                          </div>
                          <Form.Group>
                            <Form.Select
                              onChange={(e) =>
                                labelHandlerRef.current.addLabelsToLayer(
                                  labelPanel.layerId,
                                  e.target.value
                                )
                              }
                            >
                              <option>Select a column</option>
                              {currentAttributes.length > 0 ? (
                                currentAttributes.map((attr) => (
                                  <option key={attr}>{attr}</option>
                                ))
                              ) : (
                                <option disabled>
                                  No attributes available
                                </option>
                              )}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      )}

                      {showColorPicker[layer.id] && (
                        <div
                          style={{
                            padding: '10px',
                            borderTop: '1px solid #ddd',
                            backgroundColor: '#fff',
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '10px',
                            }}
                          >
                            <h5 style={{ margin: 0 }}>Color Picker</h5>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() =>
                                setShowColorPicker((prev) => ({
                                  ...prev,
                                  [layer.id]: false,
                                }))
                              }
                              style={{ color: 'black', padding: 0 }}
                              data-tooltip="Close"
                            >
                              <i
                                className="bi bi-x"
                                style={{ fontSize: '1.25rem' }}
                              ></i>
                            </Button>
                          </div>
                          <SketchPicker
                            color={
                              activeLayerColor[layer.id] || {
                                r: 255,
                                g: 255,
                                b: 255,
                                a: 1,
                              }
                            }
                            onChange={(color) =>
                              styleHandler.handleColorChange(layer.id, color)
                            }
                          />
                        </div>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navigation;
