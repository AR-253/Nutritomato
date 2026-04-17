import React, { useEffect, useState } from "react";
import './List.css'
import axios from "axios";
import { toast } from "react-toastify";
import EditModal from "../../components/EditModal/EditModal";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching food list");
      }
    } catch (error) {
      toast.error("Network error, could not fetch list");
    }
  };

  const removeFood = async (foodId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success("Food removed successfully!");
        fetchList();
      } else {
        toast.error("Error removing food");
      }
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditItem(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list-container fadeIn">
      {isModalOpen && (
        <EditModal 
          url={url} 
          foodItem={editItem} 
          closeModal={closeEditModal} 
          refreshList={fetchList} 
        />
      )}

      <div className="list-header">
        <div className="header-text">
          <h2>All Foods Menu</h2>
          <p>You have {list.length} items in your menu.</p>
        </div>
        <button className="refresh-btn" onClick={fetchList}>Refresh List</button>
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Macros (P/C/F)</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => (
              <tr key={index}>
                <td className="img-cell">
                  <div className="table-img-box">
                    <img src={item.image.startsWith('http') ? item.image : `${url}/uploads/${item.image}`} alt={item.name} />
                  </div>
                </td>
                <td className="name-cell">
                  <span className="item-name">{item.name}</span>
                </td>
                <td>
                  <span className={`category-badge ${item.category.toLowerCase().replace(' ', '-')}`}>
                    {item.category}
                  </span>
                </td>
                <td className="price-cell">Rs. {item.price}</td>
                <td className="macro-cell">
                  <div className="macro-info">
                    <span>{item.protein || 0}g</span> / 
                    <span> {item.carbs || 0}g</span> / 
                    <span> {item.fats || 0}g</span>
                  </div>
                  <small>{item.calories || 0} kcal</small>
                </td>
                <td className="action-cell">
                  <div className="action-btns">
                    <button onClick={() => openEditModal(item)} className="edit-btn" title="Edit Item">
                      <i className="edit-icon">✎</i>
                    </button>
                    <button onClick={() => removeFood(item._id)} className="delete-btn" title="Remove Item">
                      <i className="delete-icon">✕</i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {list.length === 0 && (
          <div className="empty-state">
            <p>No food items found. Add some to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;

