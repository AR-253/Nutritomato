import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/dashboard' className="sidebar-option" activeClassName="active">
          <div className="icon-wrapper">
             <img src={assets.order_icon} alt="Dashboard" style={{opacity: 0.8}} />
          </div>
          <p>Dashboard</p>
        </NavLink>

        <NavLink to='/add' className="sidebar-option" activeClassName="active">
          <div className="icon-wrapper">
             <img src={assets.add_icon} alt="Add" />
          </div>
          <p>Add Items</p>
        </NavLink>
        
        <NavLink to='/list' className="sidebar-option" activeClassName="active">
          <div className="icon-wrapper">
            <img src={assets.order_icon} alt="List" />
          </div>
          <p>List Items</p>
        </NavLink>
        
        <NavLink to='/orders' className="sidebar-option" activeClassName="active">
          <div className="icon-wrapper">
            <img src={assets.order_icon} alt="Orders" />
          </div>
          <p>Orders</p>
        </NavLink>

        <NavLink to='/audits' className="sidebar-option" activeClassName="active">
          <div className="icon-wrapper">
             <img src={assets.order_icon} alt="Audits" style={{filter: 'hue-rotate(90deg)'}} />
          </div>
          <p>Audits</p>
        </NavLink>
      </div>
      
      <div className="sidebar-footer">
        <p>© 2026 Admin Dashboard</p>
      </div>
    </div>
  )
}

export default Sidebar
