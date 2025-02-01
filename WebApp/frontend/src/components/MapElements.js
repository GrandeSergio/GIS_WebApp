import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/MapElements.module.css';

/**
 * Button component to toggle the information display.
 * @param {Object} props - The component props.
 * @param {boolean} props.infoEnabled - State indicating if information is enabled.
 * @param {function} props.toggleInfo - Function to toggle the information state.
 */
export const EnableInformationButton = ({ infoEnabled, toggleInfo }) => (
  <button
    onClick={toggleInfo}
    style={{
      position: 'absolute',
      top: '70px',
      left: '10px',
      width: '40px',
      height: '40px',
      backgroundColor: infoEnabled ? '#28a745' : '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }}
    data-tooltip={infoEnabled ? 'Disable Information' : 'Enable Information'}
  >
    <i className="bi bi-info-circle"></i>
  </button>
);

/**
 * Basemaps panel component with toggle functionality.
 * @param {Object} props - The component props.
 * @param {Array} props.basemapState - Array of basemaps with their states.
 * @param {function} props.handleBasemapChange - Function to handle basemap selection.
 */
export const BasemapContainer = ({ basemapState, handleBasemapChange }) => {
  const [showBasemaps, setShowBasemaps] = useState(false);
  const panelRef = useRef(null); // Referencja dla panelu, aby go wykrywać

  useEffect(() => {
    // Funkcja wykrywająca kliknięcie na zewnątrz panelu
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowBasemaps(false); // Zamknij panel
      }
    };

    // Dodaj globalny "click listener"
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Wyczyść listener po odmontowaniu komponentu
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Zapobiega propagacji zdarzenia
          setShowBasemaps((prev) => !prev);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '50px',
          height: '50px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
        }}
        data-tooltip="Toggle Basemaps"
        data-position="left"
      >
        <i className="bi bi-map"></i>
      </button>

      {showBasemaps && (
        <div
          ref={panelRef} // Referencja do panelu
          onClick={(e) => e.stopPropagation()} // Zapobiega zamknięciu po kliknięciu wewnętrznym
          style={{
            position: 'absolute',
            top: '70px',
            right: '10px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h4>Basemaps</h4>
          {basemapState.map((bm) => (
            <div key={bm.id} className={styles['radio-input']}>
              <label className={styles.label}>
                <input
                  type="radio"
                  name="basemap"
                  className={styles['radio-input__control']}
                  checked={bm.active}
                  onChange={() => handleBasemapChange(bm.id)}
                />
                <span className={styles['radio-input__label']}>{bm.name}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
