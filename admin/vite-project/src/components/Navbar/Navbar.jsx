import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = ({ setToken }) => {

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  }

  return (
    <nav className="admin-navbar">
      <div className="nav-brand">
        <div className="logo-text">
          Nutri<span>Tomato</span>
        </div>
        <span className="admin-tag">Admin Panel</span>
      </div>
      
      <div className="nav-profile-container" onClick={logout} title="Click to Logout">
        <div className="profile-info">
          <p className="profile-name">Admin User</p>
          <p className="profile-role">Store Manager</p>
        </div>
        <img className='profile-avatar' src={assets.profile_image} alt="Profile" />
      </div>
    </nav>
  )
}

export default Navbar
