import React, { useEffect, useState } from "react";
import './Order.css'
import axios from "axios";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data.reverse()); // Show newest first
        setLoading(false);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus,
      });
      if (response.data.success) {
        toast.success(`Order updated to: ${newStatus}`);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Poll every 30s for better performance
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Food Processing": return "status-processing";
      case "Out for delivery": return "status-shipping";
      case "Delivered": return "status-delivered";
      default: return "";
    }
  };

  return (
    <div className="order-container fadeIn">
      <div className="order-header">
        <div>
          <h2>Order Management</h2>
          <p>Manage and track all customer orders in real-time.</p>
        </div>
        <div className="order-stats">
          <div className={`filter-btn ${filter === "All" ? "active" : ""}`} onClick={() => setFilter("All")}>
            All ({orders.length})
          </div>
          <div className={`filter-btn new ${filter === "New" ? "active" : ""}`} onClick={() => setFilter("New")}>
            New ({orders.filter(o => o.status === "Food Processing" && (new Date() - new Date(o.date)) < 24 * 60 * 60 * 1000).length})
          </div>
          <div className={`filter-btn processing ${filter === "Food Processing" ? "active" : ""}`} onClick={() => setFilter("Food Processing")}>
            Processing ({orders.filter(o => o.status === "Food Processing").length})
          </div>
          <div className={`filter-btn shipping ${filter === "Out for delivery" ? "active" : ""}`} onClick={() => setFilter("Out for delivery")}>
            Out Delivery ({orders.filter(o => o.status === "Out for delivery").length})
          </div>
          <div className={`filter-btn delivered ${filter === "Delivered" ? "active" : ""}`} onClick={() => setFilter("Delivered")}>
            Delivered ({orders.filter(o => o.status === "Delivered").length})
          </div>
        </div>
      </div>

      <div className="order-grid">
        {orders
          .filter(order => {
            if (filter === "All") return true;
            if (filter === "New") return order.status === "Food Processing" && (new Date() - new Date(order.date)) < 24 * 60 * 60 * 1000;
            return order.status === filter;
          })
          .map((order, index) => (
          <div key={index} className={`order-card ${getStatusClass(order.status)}`}>
            <div className="card-top">
              <div className="order-id-box">
                <img src={assets.parcel_icon} alt="Order" />
                <div className="order-meta">
                  <span className="order-id">#ORD-{order._id.slice(-6).toUpperCase()}</span>
                  <span className="order-time">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className={`status-tag ${getStatusClass(order.status)}`}>
                {order.status}
              </div>
            </div>

            <div className="card-body">
              <div className="order-details">
                <p className="items-list">
                  {order.items.map((item, idx) =>
                    idx === order.items.length - 1
                      ? `${item.name} x ${item.quantity}`
                      : `${item.name} x ${item.quantity}, `
                  )}
                </p>
                <div className="customer-info">
                  <p className="customer-name">{order.address.firstName + " " + order.address.lastName}</p>
                  <p className="customer-address">{order.address.street + ", " + order.address.city}</p>
                  <p className="customer-phone">{order.address.phone}</p>
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Items</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="summary-row total">
                  <span>Amount</span>
                  <span>Rs. {order.amount}</span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <select
                className="status-selector"
                onChange={(e) => statusHandler(e, order._id)}
                value={order.status}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className="empty-orders">
          <p>No orders found at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
