import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useHistory } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = () => {
  const [menu, setMenu] = useState("Home");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { getTotalCartAmount, setSearchTerm, token, setToken, setShowLogin } = useContext(StoreContext);
  const history = useHistory();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  }

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setSearchTerm(""); 
    history.push("/");
  }

  const toggleSearch = () => {
    if (showSearch) {
      setSearchTerm(""); 
    }
    setShowSearch(!showSearch);
  }

  // Scroll detection logic
  React.useEffect(() => {
    const handleScroll = () => {
      // Only run scroll detection if we are on the Home page
      if (window.location.pathname === '/') {
        const scrollPosition = window.scrollY;
        const menuSection = document.getElementById('explore-menu');
        
        // Define thresholds
        const footerThreshold = document.body.scrollHeight - window.innerHeight - 100;
        
        if (scrollPosition >= footerThreshold) {
          setMenu("Contact us");
        } else if (menuSection && scrollPosition >= menuSection.offsetTop - 200) {
          setMenu("Menu");
        } else {
          setMenu("Home");
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [history.location.pathname]); // Re-run if path changes

  // Sync menu state with current path on load and navigation
  React.useEffect(() => {
    const updateMenuFromPath = (path) => {
      if (path.includes('/diet-planner')) setMenu("Diet Planner");
      else if (path.includes('/ai-planner')) setMenu("AI Planner");
      else if (path === '/cart') setMenu("Menu");
      else if (path === '/diary') setMenu("Home");
      else if (path === '/') setMenu("Home");
    };

    updateMenuFromPath(history.location.pathname);

    // Listen for history changes
    const unlisten = history.listen((location) => {
      updateMenuFromPath(location.pathname);
    });

    return () => unlisten();
  }, [history]);

  return (
    <div className='navbar'>
      <div className="navbar-container">
        <div className="navbar-left-wrapper">
          <button className="hamburger-btn" onClick={toggleMobileMenu}>
            {showMobileMenu ? "✕" : "☰"}
          </button>
          <Link to='/' className="logo-text" onClick={() => setShowMobileMenu(false)}>
            Nutri<span>Tomato</span>
          </Link>
        </div>
        <ul className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
          <Link to='/' onClick={() => { setMenu("Home"); setSearchTerm(""); window.scrollTo({ top: 0, behavior: 'smooth' }); setShowMobileMenu(false); }} className={menu === "Home" ? "active" : ""}>Home</Link>
          <Link to='/' onClick={() => { setMenu("Menu"); setSearchTerm(""); setShowMobileMenu(false); setTimeout(() => { document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' }); }, 300); }} className={menu === "Menu" ? "active" : ""}>Menu</Link>
          <Link to='/diet-planner' onClick={() => { setMenu("Diet Planner"); setSearchTerm(""); setShowMobileMenu(false); }} className={menu === "Diet Planner" ? "active" : ""}>Diet Planner</Link>
          <Link to='/ai-planner' onClick={() => { setMenu("AI Planner"); setSearchTerm(""); setShowMobileMenu(false); }} className={menu === "AI Planner" ? "active" : ""}>AI Planner</Link>
          <Link to='/' onClick={() => { setMenu("Contact us"); setSearchTerm(""); setShowMobileMenu(false); setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 300); }} className={menu === "Contact us" ? "active" : ""}>Contact us</Link>
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
                <li onClick={() => history.push('/diary')}><span className="nav-profile-icon">📊</span><p>Reports</p></li>
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