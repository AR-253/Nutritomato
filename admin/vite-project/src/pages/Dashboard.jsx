import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import axios from "axios";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalNewOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetching individually for better error resilience
      const endpoints = [
        { key: 'orders', path: '/api/order/list' },
        { key: 'food', path: '/api/food/list' }
      ];

      const results = await Promise.allSettled(
        endpoints.map(ep => axios.get(`${url}${ep.path}`))
      );

      let newStats = { ...stats };

      // Process Orders
      if (results[0].status === 'fulfilled' && results[0].value.data.success) {
        const orders = results[0].value.data.data;
        newStats.totalOrders = orders.length;
        newStats.totalRevenue = orders.reduce((acc, curr) => acc + curr.amount, 0);
        newStats.totalNewOrders = orders.filter(o => o.status === "Food Processing" && (new Date() - new Date(o.date)) < 24 * 60 * 60 * 1000).length;
        newStats.recentOrders = orders.slice(0, 5);
      } else {
        console.error("Order Fetch Failed:", results[0].reason || "Success flag false");
      }

      // Process Food
      if (results[1].status === 'fulfilled' && results[1].value.data.success) {
        newStats.totalProducts = results[1].value.data.data.length;
      } else {
        console.error("Food Fetch Failed:", results[1].reason || "Success flag false");
      }



      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard Global Error:", error);
      toast.error("Dashboard processing error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container fadeIn">
      <div className="dashboard-header">
        <h1>Dashboard Summary</h1>
        <p>Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon-box">
             <span className="icon">💰</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">Rs. {stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon-box">
             <span className="icon">📦</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon-box">
             <span className="icon">🍲</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Menu Items</p>
            <h3 className="stat-value">{stats.totalProducts}</h3>
          </div>
        </div>

        <div className="stat-card new-orders">
          <div className="stat-icon-box">
             <span className="icon">🔔</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">New Orders</p>
            <h3 className="stat-value">{stats.totalNewOrders}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-orders-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button className="view-all-btn" onClick={() => window.location.href='/audits'}>View All</button>
          </div>
          <div className="activity-table-wrapper">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order, index) => (
                    <tr key={index}>
                      <td className="id-cell">#...{order._id.slice(-6).toUpperCase()}</td>
                      <td>{order.address.firstName} {order.address.lastName}</td>
                      <td className="amount-cell">Rs. {order.amount}</td>
                      <td>
                        <span className={`status-pill-small ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#b2bec3'}}>No recent activity found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="quick-actions-section">
           <h3>Quick Actions</h3>
           <div className="action-buttons">
              <button onClick={() => window.location.href='/add'}>Add New Dish</button>
              <button onClick={() => window.location.href='/list'}>Manage Menu</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
