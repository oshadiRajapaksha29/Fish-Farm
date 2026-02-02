import React, { useState } from 'react';
import axios from 'axios';
import './TankConfigForm.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TankConfigForm = ({ tank, onConfigUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    tankHeight: tank?.TankConfiguration?.TankHeightCm || (tank?.Height * 100) || 8.0,
    idealWater: tank?.TankConfiguration?.IdealWaterHeightCm || 2.0,
    minWater: tank?.TankConfiguration?.MinWaterHeightCm || 1.0,
    maxWater: tank?.TankConfiguration?.MaxWaterHeightCm || 3.0,
    demoMode: tank?.TankConfiguration?.IsDemoMode !== undefined ? tank.TankConfiguration.IsDemoMode : true,
    tankCode: tank?.TankCode || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.minWater >= formData.idealWater) {
      setError('Minimum water height must be less than ideal water height');
      setLoading(false);
      return;
    }

    if (formData.maxWater <= formData.idealWater) {
      setError('Maximum water height must be greater than ideal water height');
      setLoading(false);
      return;
    }

    if (formData.tankHeight <= formData.maxWater) {
      setError('Tank height must be greater than maximum water height');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Updating tank configuration...', formData);

      // Update tank configuration in database
      const response = await axios.put(`${API_URL}/tanksNew/${tank._id}`, {
        TankConfiguration: {
          TankHeightCm: parseFloat(formData.tankHeight),
          IdealWaterHeightCm: parseFloat(formData.idealWater),
          MinWaterHeightCm: parseFloat(formData.minWater),
          MaxWaterHeightCm: parseFloat(formData.maxWater),
          IsDemoMode: formData.demoMode
        }
      });

      console.log('✅ Database updated:', response.data);

      // Send configuration to ESP32
      try {
        const configResponse = await axios.post(`${API_URL}/tanksNew/${formData.tankCode}/config`, {
          tank_height_cm: parseFloat(formData.tankHeight),
          ideal_water_cm: parseFloat(formData.idealWater),
          min_water_cm: parseFloat(formData.minWater),
          max_water_cm: parseFloat(formData.maxWater),
          demo_mode: formData.demoMode
        }, {
          headers: {
            'x-device-key': 'demo-device-key'
          }
        });
        console.log('✅ ESP32 config updated:', configResponse.data);
      } catch (esp32Error) {
        console.warn('⚠️ ESP32 config update failed (device might be offline):', esp32Error.message);
        // Continue anyway - the device will fetch config on next connection
      }

      alert('Tank configuration updated successfully!');
      onConfigUpdate(response.data.tank);
      onClose();
    } catch (error) {
      console.error('❌ Error updating tank config:', error);
      setError(`Failed to update tank configuration: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
    setError(''); // Clear error when user makes changes
  };

  const calculateVolume = () => {
    const volume = (formData.tankHeight / 100) * tank.Width * tank.Length;
    return volume.toFixed(2);
  };

  const calculateWaterVolume = (height) => {
    const volume = (height / 100) * tank.Width * tank.Length;
    return volume.toFixed(2);
  };

  return (
    <div className="config-form-overlay">
      <div className="config-form-container">
        <div className="config-form-header">
          <h2>Configure Tank Settings - {tank.TankCode}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label htmlFor="tankCode">Tank Code</label>
            <input
              type="text"
              id="tankCode"
              name="tankCode"
              value={formData.tankCode}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tankHeight">Tank Height (cm)</label>
            <input
              type="number"
              id="tankHeight"
              name="tankHeight"
              value={formData.tankHeight}
              onChange={handleChange}
              step="0.1"
              min="1"
              required
            />
            <small>Current physical height: {(tank.Height * 100).toFixed(1)} cm</small>
          </div>

          <div className="form-group">
            <label htmlFor="idealWater">Ideal Water Height (cm)</label>
            <input
              type="number"
              id="idealWater"
              name="idealWater"
              value={formData.idealWater}
              onChange={handleChange}
              step="0.1"
              min="0.1"
              max={formData.tankHeight}
              required
            />
            <small>Water level considered "perfect" {formData.demoMode ? `(100% when ≥ ${formData.idealWater}cm)` : ''}</small>
          </div>

          <div className="form-group">
            <label htmlFor="minWater">Minimum Water Height (cm)</label>
            <input
              type="number"
              id="minWater"
              name="minWater"
              value={formData.minWater}
              onChange={handleChange}
              step="0.1"
              min="0.1"
              max={formData.tankHeight}
              required
            />
            <small>Triggers RED LED warning when below this level</small>
          </div>

          <div className="form-group">
            <label htmlFor="maxWater">Maximum Water Height (cm)</label>
            <input
              type="number"
              id="maxWater"
              name="maxWater"
              value={formData.maxWater}
              onChange={handleChange}
              step="0.1"
              min="0.1"
              max={formData.tankHeight}
              required
            />
            <small>Triggers BOTH LEDs when above this level</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="demoMode"
                checked={formData.demoMode}
                onChange={handleChange}
              />
              Enable Demo Mode
            </label>
            <small>
              {formData.demoMode 
                ? `Demo Mode: ${formData.idealWater}cm water = 100% full`
                : 'Normal Mode: Full tank = 100%'
              }
            </small>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Configuration Summary */}
          <div className="config-summary">
            <h3>Configuration Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Tank Volume:</span>
                <span className="summary-value">{calculateVolume()} m³</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Ideal Water Volume:</span>
                <span className="summary-value">{calculateWaterVolume(formData.idealWater)} m³</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">LED Status:</span>
                <div className="led-summary">
                  <div className="led-indicator red">
                    <div className="led"></div>
                    <span>&lt; {formData.minWater}cm</span>
                  </div>
                  <div className="led-indicator green">
                    <div className="led"></div>
                    <span>{formData.minWater} - {formData.maxWater}cm</span>
                  </div>
                  <div className="led-indicator both">
                    <div className="led"></div>
                    <span>&gt; {formData.maxWater}cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TankConfigForm;