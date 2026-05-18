import React, { useContext } from 'react';
import './Header.css';
import headerImg from '../../assets/header_img.png';
import { StoreContext } from '../../context/StoreContext';
import UserDashboard from '../UserDashboard/UserDashboard';

const Header = () => {
  const { token } = useContext(StoreContext);

  return (
    <div className={`header ${token ? 'header-with-dashboard' : 'header-logged-out'}`} style={{ backgroundImage: `url(${headerImg})` }}>
      {token ? (
        <div className="header-dashboard-overlay">
          <UserDashboard />
        </div>
      ) : (
        <div className="header-contents-wrapper">
          <div className="header-contents-glass">
            <div className="header-ai-badge">
              <span className="badge-pulse"></span>
              AI-Driven Nutrition
            </div>
            <h2>Smart Meals for a Smarter You</h2>
            <p>
              Experience the future of food delivery. Our AI analyzes your needs to recommend 
              the perfect dishes for your health and taste — one delicious meal at a time.
            </p>
            <div className="header-btns">
              <a href='#explore-menu' className="view-menu-link">
                <button>View Menu</button>
              </a>
              <a href='/ai-planner' className="ai-planner-link">
                <button className="ai-btn">AI Meal Planner</button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
