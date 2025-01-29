import React, { useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';

/**
 * Component for uploading vector data to the map.
 * @param {Object} props - Modal properties.
 * @param {boolean} props.show - Whether the modal is visible.
 * @param {Function} props.onHide - Function to hide the modal.
 * @param {Function} props.onUpload - Function to handle GeoJSON data upload.
 */
const UploadVectorModal = ({ show, onHide, onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]; // Pobranie pliku
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geoJsonData = JSON.parse(e.target.result); // Parsowanie pliku GeoJSON
          onUpload(geoJsonData, file.name); // Przekazujemy dane GeoJSON wraz z nazwą pliku
          onHide(); // Zamykamy modal
        } catch (error) {
          console.error('Invalid GeoJSON file:', error);
          alert('Invalid GeoJSON format. Please ensure the file is properly formatted.');
        }
      };
      reader.readAsText(file); // Odczyt pliku jako tekst
    }
  }, [onUpload, onHide]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.geojson,application/geo+json', // Akceptujemy pliki GeoJSON
  });

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Upload Vector</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #007bff',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the GeoJSON file here...</p>
          ) : (
            <p>
              Drag and drop a GeoJSON file here, or click to select one.
            </p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadVectorModal;