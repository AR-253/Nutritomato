import React from 'react';
import ReactDOM from 'react-dom';
import './FoodDetailModal.css';

const FoodDetailModal = ({ isOpen, onClose, food }) => {
  React.useEffect(() => {
    if (isOpen && food) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, food]);

  if (!isOpen || !food) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fadeIn" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <img src={food.image.startsWith('http') ? food.image : `http://127.0.0.1:4000/uploads/${food.image}`} alt={food.name} className="modal-image" />
          <div className="header-info">
            <h2>{food.name}</h2>
            <p className="category-badge">{food.category}</p>
          </div>
        </div>

        <div className="analysis-section">
          <h3>🔍 AI Ingredient Breakdown</h3>
          <p className="analysis-subtitle">A detailed look at what's inside your meal</p>
          
          <div className="ingredients-list">
            {food.ingredients && food.ingredients.length > 0 ? (
              food.ingredients.map((ing, index) => (
                <div className="ingredient-item" key={index}>
                  <div className="ing-name-qty">
                    <span className="ing-name">{ing.name}</span>
                    <span className="ing-qty">({ing.quantity})</span>
                  </div>
                  <div className="ing-cal">{ing.calories} kcal</div>
                </div>
              ))
            ) : (
              <p className="no-data">No detailed ingredient data available for this item.</p>
            )}
          </div>

          <div className="total-analysis">
            <div className="total-row">
              <span>Total Estimated Calories</span>
              <span className="total-val">{food.calories} kcal</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <p>ℹ️ Data analyzed by AI Nutritionist based on standard portion sizes.</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FoodDetailModal;

