import React, { useState } from 'react';
import axios from 'axios';
import './SmartScanner.css'; 

const SmartScanner = () => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);
    setPrediction(null); 

    const formData = new FormData();
    // This 'image' key must match upload.single('image') in server.js
    formData.append('image', file);

    try {
      // ✅ CHANGED: Port updated to 4000 to match your server.js
      const res = await axios.post('http://localhost:4000/api/food/predict-nutrition', formData);
      
      if (res.data.success) {
        setPrediction(res.data.data);
      }
    } catch (err) {
      console.error("Scan failed", err);
      const errorMessage = err.response?.data?.message || "Backend server se connection nahi ho saka!";
      alert(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h1>AI Model</h1>
        <p>ResNet18 Powered Food Recognition</p>
      </div>

      <div className="upload-card">
        <div className="drop-zone">
          {image ? (
            <img src={image} className="preview-image" alt="Food preview" />
          ) : (
            <div className="placeholder-text">
              <i className="upload-icon">📷</i>
              <p>Select a food image to analyze</p>
            </div>
          )}
        </div>

        <div className="input-group">
          <input type="file" id="file-upload" onChange={handleUpload} hidden />
          <label htmlFor="file-upload" className="custom-file-button">
            {loading ? "Analyzing Food..." : "Upload Image"}
          </label>
        </div>

        {loading && <div className="spinner"></div>}

        {prediction && (
          <div className="result-section">
            <h2 className="food-title">{prediction.Dish_Name}</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Calories</span>
                <span className="stat-value">{prediction.Calories} kcal</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Protein</span>
                <span className="stat-value">{prediction.Protein}g</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Carbs</span>
                <span className="stat-value">{prediction.Carbs}g</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Fats</span>
                <span className="stat-value">{prediction.Fats}g</span>
              </div>
            </div>
            <p className="ai-note">Real-time Nutrition Analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartScanner;