// src/components/FoodItem.jsx

import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import FoodDetailModal from '../FoodDetailModal/FoodDetailModal';

const FoodItem = ({ id, name, price, description, image, calories, protein, carbs, fats, weight, ingredients, category }) => {
  const { cartItems, addToCart, removeFromCart, url, recommendedItems } = useContext(StoreContext);
  const isRecommended = recommendedItems.some(item => item._id === id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <div className={`food-item ${isRecommended ? 'ai-glow' : ''}`} onClick={() => setIsModalOpen(true)}>
      <div className="food-item-image-container">
        <img className="food-item-image" src={image.startsWith('http') ? image : url + "/uploads/" + image} alt="" />
        {isRecommended && (
          <div className="smart-pick-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">AI Recommended</span>
          </div>
        )}

        {!(cartItems && cartItems[id]) ? (
          <div 
            className="add" 
            onClick={(e) => { e.stopPropagation(); addToCart(id); }}
          >
          </div>
        ) : (
          <div className="food-item-counter" onClick={(e) => e.stopPropagation()}>
            <div className="counter-btn" onClick={() => removeFromCart(id)}>−</div>
            <p>{cartItems ? cartItems[id] : 0}</p>
            <div className="counter-btn" onClick={() => addToCart(id)}>+</div>
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-header">
          <p className="food-item-name">{name}</p>
          <p className="food-item-price">Rs. {price}</p>
        </div>
        
        <p className="food-item-desc">{description}</p>

        <div className="food-item-nutrition-box">
          <div className="nutrition-main">
            <div className="calories-display">
              <span className="cal-num">{calories}</span>
              <span className="cal-text">CALORIES</span>
            </div>
            <div className="divider"></div>
            <div className="nutrition-label">Nutrition</div>
          </div>
          
          <div className="macro-pills">
            <div className="macro-pill protein">
              <span className="pill-icon">🥚</span>
              <div className="pill-text">
                <span className="label">Proteins</span>
                <span className="value">{protein}g</span>
              </div>
            </div>
            <div className="macro-pill carbs">
              <span className="pill-icon">🌾</span>
              <div className="pill-text">
                <span className="label">Carbs</span>
                <span className="value">{carbs}g</span>
              </div>
            </div>
            <div className="macro-pill fats">
              <span className="pill-icon">🥑</span>
              <div className="pill-text">
                <span className="label">Fats</span>
                <span className="value">{fats}g</span>
              </div>
            </div>
          </div>
        </div>

        <div className="food-item-footer">
          <p className="portion-size">Portion Size: <span className="p-val">1 Serving ({weight || "250g"})</span></p>
        </div>
      </div>
    </div>

    <FoodDetailModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      food={{ id, name, price, description, image, calories, protein, carbs, fats, weight, ingredients, category }} 
    />
    </>
  );
};

export default FoodItem;
