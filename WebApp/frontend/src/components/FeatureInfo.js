import 'ol/ol.css';
import { Overlay } from 'ol';
import styles from '../styles/FeatureInfo.module.css'; // Import CSS Module


class FeatureInfo {
/**
   * Creates an instance of FeatureInfo.
   * @param {Object} map - The OpenLayers map object to which the overlay will be attached.
   */
  constructor(map) {
    this.map = map;

    /**
     * The container for displaying feature information.
     * @type {HTMLElement}
     */
    this.infoContainer = document.createElement('div');
    this.infoContainer.className = styles.featureInfoOverlay;

    /**
     * The OpenLayers overlay for showing feature information.
     * @type {Overlay}
     */
    this.overlay = new Overlay({
      element: this.infoContainer,
      autoPan: true,
      autoPanAnimation: { duration: 250 },
    });
    this.map.addOverlay(this.overlay);

    this.handleMapClick = this.handleMapClick.bind(this);
    this.map.on('click', this.handleMapClick);

    this.handleCloseOverlay = this.handleCloseOverlay.bind(this);
    document.addEventListener('closeOverlay', this.handleCloseOverlay);
  }

/**
   * Handles the closing of the overlay by hiding it and updating its ARIA state.
   */
  handleCloseOverlay() {
    this.overlay.setPosition(undefined);
  }

/**
   * Handles the map click event to display feature information overlay.
   * @param {Object} event - The map click event containing the clicked pixel and other data.
   */
  handleMapClick(event) {
    const clickedFeatures = new Set();
    this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
      clickedFeatures.add(feature);
    });

    if (clickedFeatures.size > 0) {
      const featureInfo = Array.from(clickedFeatures).map((feature) =>
      /**
         * Extracts the properties of the clicked feature to display.
         */
        feature.getProperties()
      );
      /**
       * Displays detailed information about the clicked features.
       */
      this.displayFeatureInfo(event.coordinate, featureInfo);
    } else {
    /**
       * Hides the overlay if no features were clicked.
       */
      this.overlay.setPosition(undefined);
    }
  }

  /**
   * Displays detailed feature information in the overlay.
   * @param {Array} coordinate - The coordinate of the map click event.
   * @param {Array} featureInfo - The array of feature properties to display.
   */
  displayFeatureInfo(coordinate, featureInfo) {
    this.infoContainer.innerHTML = `
    <div style="position: relative;">
      <div style="display: flex; justify-content: flex-end;">
        <button
          class="btn-close"
          aria-label="Close feature information overlay"
          title="Click to close overlay window"
          onclick="document.dispatchEvent(new CustomEvent('closeOverlay'))"
          title="Close"
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#333",
            fontSize: "10px",
            cursor: "pointer",
            position: "absolute",
            top: "5px",
            right: "5px",
          }}
        >
        </button>
      </div>
      <h4 id="featureInfoHeader">Feature Information</h4>
      <div class="${styles.featureInfoContent}">
        ${featureInfo
          .map(
            (info, index) => `
              <div class="${styles.featureSection}">
                <strong>Feature ${index + 1}</strong>
                <hr/>
                ${Object.keys(info)
                  .filter((key) => key !== 'geometry')
                  .map(
                    (key) => `
                      <div class="${styles.featureRow}" role="row" aria-labelledby="featureKey-${key}">
                        <span id="featureKey-${key}" class="${styles.featureKey}">${key}:</span>
                        <span class="${styles.featureValue}">${info[key]}</span>
                      </div>
                    `
                  )
                  .join('')}
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  `;
    this.overlay.setPosition(coordinate);
  }

/**
   * Cleans up event listeners and removes the overlay when FeatureInfo is destroyed.
   */
  cleanup() {
    if (this.map) {
      this.map.un('click', this.handleMapClick);
      if (this.overlay) {
        this.map.removeOverlay(this.overlay);
      }
      document.removeEventListener('closeOverlay', this.handleCloseOverlay);
    }
  }
}

export default FeatureInfo;
