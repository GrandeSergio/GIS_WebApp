import React, { useState, useRef, useEffect } from 'react';

/**
 * A component that displays an interactive attribute table with filtering and resizing functionality.
 *
 * @param {Object[]} data - The array of data objects to be displayed in the table.
 * @param {Function} onClose - Callback function to handle the closing of the table.
 * @param {Function} onZoomToFeature - Callback function to zoom into a specific feature when selected.
 */
const AttributeTable = ({ data, onClose, onZoomToFeature }) => {
  const [tableHeight, setTableHeight] = useState(300);
  const [filters, setFilters] = useState({});
  const [filterInputs, setFilterInputs] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const tableRef = useRef(null);
  const dropdownRef = useRef(null);
  const resizerRef = useRef(null);
  const [tableWidth, setTableWidth] = useState(0);

  /**
   * Handles mouse movement to adjust the table height dynamically.
   *
   * @param {MouseEvent} e - The mouse event triggered during movement.
   */
  const handleMouseMove = (e) => {
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 50 && newHeight < window.innerHeight - 100) {
      setTableHeight(newHeight);
    }
  };

  /**
   * Handles the mouse up event by removing the mousemove and mouseup event listeners.
   */
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  /**
   * Handles clicks outside the dropdown to close the currently open dropdown.
   *
   * @param {MouseEvent} event - The mouse event triggered during the click.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  /**
   * Toggles the visibility of the dropdown menu for filtering a specific column.
   *
   * @param {string} column - The name of the column for which the dropdown is toggled.
   */
  const toggleDropdown = (column) => {
    setOpenDropdown((prev) => (prev === column ? null : column));
  };

  /**
   * Updates the filter input value for a specific column.
   *
   * @param {string} column - The name of the column to be filtered.
   * @param {string} value - The input value entered by the user.
   */
  const handleFilterInputChange = (column, value) => {
    setFilterInputs((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  /**
   * Applies a filter to the specified column using the current input value.
   *
   * @param {string} column - The name of the column to be filtered.
   */
  const applyFilter = (column) => {
    setFilters((prev) => ({
      ...prev,
      [column]: filterInputs[column] || '',
    }));
    setOpenDropdown(null);
  };

  /**
   * Clears the filter applied to the specified column.
   *
   * @param {string} column - The name of the column to clear the filter from.
   */
  const clearFilter = (column) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters[column];
      return updatedFilters;
    });
    setFilterInputs((prev) => ({
      ...prev,
      [column]: '',
    }));
    setOpenDropdown(null);
  };

  /**
   * Filters the table data based on the current filter values for each column.
   *
   * @type {Object[]} - The filtered data to be displayed in the table.
   */
  const filteredData = data.filter((row) => {
    return Object.keys(filters).every((column) => {
      const filterValue = filters[column];
      if (!filterValue) return true;
      return row[column]
        ?.toString()
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });
  });

  useEffect(() => {
    const updateWidth = () => {
      if (tableRef.current) {
        setTableWidth(tableRef.current.scrollWidth); // Pobierz rzeczywistą szerokość tabeli
      }
    };

    updateWidth(); // Ustaw podczas inicjalizacji komponentu

    // Nasłuchiwanie zmiany rozmiaru okna (np. w przypadku resize w przeglądarce)
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth); // Usuń nasłuchiwacz, aby unikać wycieków pamięci
    };
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  /**
   * Retrieves the headers (keys) from the first data row to be used as table column headers.
   *
   * @type {string[]} - An array of column headers.
   */
  const headers = Object.keys(data[0]).filter(
    (header) => header !== 'geometry'
  );

  return (
    <div
      ref={tableRef}
      style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: `${tableHeight}px`,
        backgroundColor: 'white',
        overflowY: 'scroll',
        borderTop: '1px solid #ddd',
        borderLeft: '1px solid #ddd',
        resize: 'none',
      }}
    >
      <div
        ref={resizerRef} // Referencja do resizera
        style={{
          position: 'absolute',
          top: '-5px',
          left: 0,
          width: `${tableWidth}px`, // Dynamiczna szerokość oparta na szerokości tabeli
          height: '12px',
          backgroundColor: '#dddddd',
          opacity: 0.7,
          cursor: 'row-resize',
          zIndex: 1000,
          borderRadius: '5px',
        }}
        onMouseDown={(e) => {
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          e.preventDefault();
        }}
      ></div>

      <div
        style={{
          position: 'sticky',
          top: '0',
          zIndex: 2,
          backgroundColor: 'white',
          borderBottom: '1px solid #ccc',
          padding: '5px',
        }}
      >
        <button
          onClick={onClose}
          className="btn-close"
          aria-label="Close"
          style={{
            position: 'sticky',
            right: '0',
            margin: '5px',
            backgroundColor: 'transparent',
            border: 'none',
            zIndex: 3,
          }}
        ></button>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th
              style={{
                position: 'sticky',
                border: '1px solid #ccc',
                padding: '5px',
                backgroundColor: '#f8f8f8',
                top: '42px',
                zIndex: 2,
              }}
            >
              Actions
            </th>
            {headers.map((header) => (
              <th
                key={header}
                style={{
                  position: 'sticky',
                  border: '1px solid #ccc',
                  padding: '5px',
                  backgroundColor: '#f8f8f8',
                  top: '42px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 2,
                }}
              >
                {header}
                <button
                  style={{
                    width: '0',
                    height: '0',
                    left: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '8px solid #000000',
                    borderBottom: 'none',
                    backgroundColor: 'transparent',
                    padding: '0',
                    marginLeft: '5px',
                    cursor: 'pointer',
                    transform:
                      openDropdown === header ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                    zIndex: 2,
                  }}
                  onClick={() => toggleDropdown(header)}
                ></button>

                {/* filter Dropdown */}
                {openDropdown === header && (
                  <div
                    ref={dropdownRef}
                    style={{
                      position: 'absolute',
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px',
                      zIndex: 10000,
                      width: '200px',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '3px',
                        zIndex: 10,
                      }}
                    >
                      <button
                        className="btn-close"
                        aria-label="Close dropdown menu"
                        title="Close dropdown menu"
                        onClick={() => setOpenDropdown(null)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#333',
                          fontSize: '10px',
                          zIndex: 4,
                          cursor: 'pointer',
                        }}
                      ></button>
                    </div>

                    {/* Input */}
                    <input
                      type="text"
                      placeholder="Type to filter"
                      value={filterInputs[header] || ''}
                      onChange={(e) =>
                        handleFilterInputChange(header, e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        zIndex: 4,
                        marginBottom: '10px',
                      }}
                    />

                    {/* Search and Clear */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <button
                        onClick={() => applyFilter(header)}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          zIndex: 4,
                          cursor: 'pointer',
                        }}
                      >
                        Search
                      </button>
                      <button
                        onClick={() => clearFilter(header)}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td
                style={{
                  border: '1px solid #ccc',
                  padding: '5px',
                  textAlign: 'center',
                }}
              >
                <button
                  onClick={() => onZoomToFeature({ id: row.id, ...row })}
                  aria-label="Zoom to feature"
                  title="Zoom to feature"
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  <i className="bi bi-search" style={{ fontSize: '16px' }}></i>
                </button>
              </td>
              {headers.map((header) => (
                <td
                  key={header}
                  style={{ border: '1px solid #ccc', padding: '5px' }}
                >
                  {row[header] !== null && row[header] !== undefined
                    ? row[header].toString()
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttributeTable;
