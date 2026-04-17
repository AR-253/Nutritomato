// src/components/FoodItem.jsx

import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image, calories, protein, carbs, fats }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const [showMacros, setShowMacros] = useState(false);

  return (
    <div className="food-item">
      <div className="food-item-image-container">
        <img className="food-item-image" src={url + "/uploads/" + image} alt="" />

        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt=""
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt=""
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt=""
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="" />
        </div>
      </div>

      <p className="food-item-desc">{description}</p>
      <div className="food-item-price-rating">
        <p className="food-item-price">Rs. {price}</p>
        {calories && (
          <p
            className="food-item-calories"
            onClick={() => setShowMacros(!showMacros)}
            title="Click to view details"
          >
            {calories} kcal {showMacros ? '▲' : '▼'}
          </p>
        )}
      </div>
      {showMacros && protein && carbs && fats && (
        <div className="food-item-macros">
          <div className="macro-item">
            <span className="macro-label">Protein</span>
            <span className="macro-value">{protein}g ({Math.round((protein * 4 / calories) * 100)}%)</span>
          </div>
          <div className="macro-item">
            <span className="macro-label">Carbs</span>
            <span className="macro-value">{carbs}g ({Math.round((carbs * 4 / calories) * 100)}%)</span>
          </div>
          <div className="macro-item">
            <span className="macro-label">Fats</span>
            <span className="macro-value">{fats}g ({Math.round((fats * 9 / calories) * 100)}%)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItem;
