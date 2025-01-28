import React from 'react';
import { BounceLoader } from 'react-spinners';

/**
 * Loader component for displaying a full-screen spinner overlay.
 *
 * @param {boolean} loading - Controls whether the loader is visible.
 * @param {string} [color='#007bff'] - The color of the spinner.
 * @returns {JSX.Element|null} The loader overlay or null if not loading.
 */
const Loader = ({ loading, color = '#007bff' }) => {
  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <BounceLoader color={color} />
    </div>
  );
};

/**
 * SmallSpinner component for a lightweight inline spinner.
 *
 * @param {boolean} loading - Controls whether the spinner is visible.
 * @param {string} [color='#007bff'] - The color of the spinner.
 * @param {number} [size=15] - The size of the spinner.
 * @returns {JSX.Element|null} The spinner or null if not loading.
 */
export const SmallSpinner = ({ loading, color = '#007bff', size = 15 }) => {
  if (!loading) return null;

  return (
    <BounceLoader
      role="status"
      color={color}
      size={size}
      cssOverride={{
        display: 'inline-block',
        marginLeft: '10px',
      }}
    />
  );
};

export default Loader;
