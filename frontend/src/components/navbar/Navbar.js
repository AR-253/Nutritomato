import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useHistory } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = () => {
  const [menu, setMenu] = useState("Home");
  const [showSearch, setShowSearch] = useState(false);
  const { getTotalCartAmount, setSearchTerm, token, setToken, setShowLogin } = useContext(StoreContext);
  const history = useHistory();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setSearchTerm(""); // Clear search on logout
    history.push("/");
  }

  const toggleSearch = () => {
    if (showSearch) {
      setSearchTerm(""); // Clear search filter when closing bar
    }
    setShowSearch(!showSearch);
  }

  return (
    <div className='navbar'>
      <div className="navbar-container">
        <Link to='/' className="logo-text">
          Nutri<span>Tomato</span>
        </Link>
        <ul className='navbar-menu'>
          <Link to='/' onClick={() => { setMenu("Home"); setSearchTerm(""); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={menu === "Home" ? "active" : ""}>Home</Link>
          <a href='#explore-menu' onClick={() => { setMenu("Menu"); setSearchTerm(""); }} className={menu === "Menu" ? "active" : ""}>Menu</a>
          <Link to='/diet-planner' onClick={() => { setMenu("Diet Planner"); setSearchTerm(""); }} className={menu === "Diet Planner" ? "active" : ""}>Diet Planner</Link>
          <Link to='/ai-planner' onClick={() => { setMenu("AI Planner"); setSearchTerm(""); }} className={menu === "AI Planner" ? "active" : ""}>AI Planner</Link>
          <Link to='/' onClick={() => { setMenu("Contact us"); setSearchTerm(""); setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 300); }} className={menu === "Contact us" ? "active" : ""}>Contact us</Link>
        </ul>
        <div className="navbar-right">
          {showSearch && <input type="text" placeholder='Search dishes...' className='navbar-search-input' onChange={(e) => setSearchTerm(e.target.value)} autoFocus />}
          <img src={assets.search_icon} alt="" onClick={toggleSearch} className='navbar-search-icon-img' />
          <Link to='/cart' className="navbar-search-icon">
            <img src={assets.basket_icon} alt="" />
            <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
          </Link>
          {!token ? <button onClick={() => setShowLogin(true)}>Sign in</button>
            : <div className='navbar-profile'>
              <img src={assets.profile_icon} alt="" />
              <ul className="nav-profile-dropdown">
                <li onClick={() => history.push('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                <hr />
                <li onClick={() => history.push('/history')}><img src={assets.bag_icon} alt="" /><p>History</p></li>
                <hr />
                <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
              </ul>
            </div>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;