import React, { useEffect, useState } from "react";
import "./Audits.css";
import axios from "axios";
import { toast } from "react-toastify";

const Audits = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        // Sort by date (newest first)
        const sortedOrders = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      } else {
        toast.error("Error fetching order history");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Network error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.address.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.address.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="audits-loading">Loading Audit Log...</div>;

  return (
    <div className="audits-container fadeIn">
      <div className="audits-header">
        <div className="header-meta">
          <h2>Audit History Log</h2>
          <p>Full transaction history of all orders placed in the system.</p>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
             <input 
               type="text" 
               placeholder="Search by ID or Customer..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <span className="search-icon">🔍</span>
          </div>
          <button className="refresh-btn" onClick={fetchOrders}>Refresh Log</button>
        </div>
      </div>

      <div className="audits-table-wrapper">
        <table className="modern-log-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Items Detail</th>
              <th>Amount</th>
              <th>Current Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={index}>
                <td className="date-cell">
                  {new Date(order.date).toLocaleDateString()}
                  <small className="time-log">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </td>
                <td className="id-cell">#...{order._id.slice(-6).toUpperCase()}</td>
                <td>
                  <span className="customer-name">{order.address.firstName} {order.address.lastName}</span>
                </td>
                <td className="items-detail">
                   {order.items.length} dishes
                   <small>{order.items.map(i => i.name).join(', ').slice(0, 30)}...</small>
                </td>
                <td className="amount-cell">Rs. {order.amount.toLocaleString()}</td>
                <td>
                   <span className={`status-badge-small ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                      {order.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="no-results">
             <p>No transactions found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Audits;
