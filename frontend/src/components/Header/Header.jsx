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
            <h2>Order your favourite food here</h2>
            <p>
              Choose from a diverse menu featuring a delectable array of dishes crafted
              with the finest ingredients and culinary expertise — one delicious meal at a time.
            </p>
            <a href='#explore-menu' className="view-menu-link">
              <button>View Menu</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
