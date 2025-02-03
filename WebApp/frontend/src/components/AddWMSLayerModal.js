import React, { useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import SmallSpinner from './Loader';

/**
 * Component for displaying a modal to add WMS/WMTS layers.
 * @param {Object} props - Component props.
 * @param {boolean} props.show - Whether the modal is visible or not.
 * @param {Function} props.onHide - Function to close the modal.
 * @param {Object} props.wmsHandler - Handler for WMS interactions.
 */
const AddWMSLayerModal = ({ show, onHide, wmsHandler }) => {
  /**
   * State for storing the WMS server URL entered by the user.
   * @type {[string, Function]}
   */
  const [layerUrl, setLayerUrl] = useState('');

  /**
   * State for storing the list of available layers fetched from the server.
   * @type {[Array<Object>, Function]}
   */
  const [availableLayers, setAvailableLayers] = useState([]);

  /**
   * State for tracking the layers selected by the user.
   * Uses a Set for efficiency.
   * @type {[Set<string>, Function]}
   */
  const [selectedLayers, setSelectedLayers] = useState(new Set());

  /**
   * State for tracking whether a loading operation is ongoing.
   * @type {[boolean, Function]}
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches and displays the available WMS layers based on the provided server URL.
   * Resets selected layers and handles loading state.
   * Logs an error if the fetch fails.
   */
  const fetchAndDisplayLayers = async () => {
    if (layerUrl) {
      setIsLoading(true);
      try {
        const layers = await wmsHandler.fetchAvailableLayers(layerUrl);
        setAvailableLayers(layers);
        setSelectedLayers(new Set());
      } catch (err) {
        console.error('Error loading layers:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Handles the addition of selected WMS layers.
   * Resets the modal state and closes the modal on success.
   * Logs an error if the operation fails.
   */
  const handleAddLayers = async () => {
    setIsLoading(true);
    try {
      const layersArray = Array.from(selectedLayers);
      await wmsHandler.handleWMSLayers(layerUrl, layersArray);
      setLayerUrl('');
      setAvailableLayers([]);
      setSelectedLayers(new Set());
      onHide();
    } catch (err) {
      console.error('Error loading layers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggles the selection of a specific WMS layer.
   * @param {string} layerName - Name of the layer to toggle selection.
   */
  const toggleLayerSelection = (layerName) => {
    const newSelection = new Set(selectedLayers);
    if (newSelection.has(layerName)) {
      newSelection.delete(layerName);
    } else {
      newSelection.add(layerName);
    }
    setSelectedLayers(newSelection);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-label="Add WMS/WMTS Layers Modal"
    >
      <Modal.Header closeButton aria-label="Close Modal">
        <Modal.Title>Add WMS/WMTS Layers</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="layerUrl">
            <Form.Label htmlFor="layerUrlInput">WMS Server URL</Form.Label>
            <Form.Control
              type="text"
              id="layerUrlInput"
              placeholder="Enter WMS Server URL"
              value={layerUrl}
              onChange={(e) => setLayerUrl(e.target.value)}
              aria-label="WMS Server URL Input"
              title="Please enter the URL for the WMS Server"
            />
          </Form.Group>
          <Button
            variant="info"
            className="mt-2"
            onClick={fetchAndDisplayLayers}
            disabled={!layerUrl || isLoading}
            aria-label="Fetch Layers Button"
            title="Fetch available layers from the WMS Server"
            style={{
              backgroundColor: !layerUrl || isLoading ? '#e0e0e0' : '#17a2b8',
              color: !layerUrl || isLoading ? '#6c757d' : '#fff',
              borderColor: !layerUrl || isLoading ? '#d6d6d6' : '#17a2b8',
              cursor: !layerUrl || isLoading ? 'not-allowed' : 'pointer',
              opacity: !layerUrl || isLoading ? 0.65 : 1,
            }}
          >
            Fetch Layers
          </Button>
        </Form>

        {/* Spinner and table view */}
        {isLoading ? (
          <div className="d-flex justify-content-center mt-4">
            <SmallSpinner loading={isLoading} />
          </div>
        ) : (
          availableLayers.length > 0 && (
            <div className="mt-4">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Layer Name</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {availableLayers.map((layer, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          id={`selectLayerCheckbox-${index}`}
                          checked={selectedLayers.has(layer.name)}
                          onChange={() => toggleLayerSelection(layer.name)}
                          aria-label={`Select layer ${layer.title}`}
                          title={`Select or deselect the layer with title: ${layer.title}`}
                        />
                      </td>
                      <td>{layer.name}</td>
                      <td>{layer.title}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          aria-label="Cancel Button"
          title="Close modal"
          onClick={onHide}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAddLayers}
          aria-label="Add Selected Layers Button"
          title="Add the selected layers to the application"
          disabled={selectedLayers.size === 0 || isLoading}
          style={{
            backgroundColor:
              selectedLayers.size === 0 || isLoading ? '#e0e0e0' : '#007bff',
            color: selectedLayers.size === 0 || isLoading ? '#6c757d' : '#fff',
            borderColor:
              selectedLayers.size === 0 || isLoading ? '#d6d6d6' : '#007bff',
            cursor:
              selectedLayers.size === 0 || isLoading
                ? 'not-allowed'
                : 'pointer',
            opacity: selectedLayers.size === 0 || isLoading ? 0.65 : 1,
          }}
        >
          Add Selected Layers
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddWMSLayerModal;
