import React, { useState, useEffect } from "react";
import "./EditModal.css";
import axios from "axios";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const EditModal = ({ url, foodItem, closeModal, refreshList }) => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  useEffect(() => {
    if (foodItem) {
      setData({
        name: foodItem.name,
        description: foodItem.description,
        price: foodItem.price,
        category: foodItem.category,
        calories: foodItem.calories || "",
        protein: foodItem.protein || "",
        carbs: foodItem.carbs || "",
        fats: foodItem.fats || "",
      });
    }
  }, [foodItem]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("id", foodItem._id);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("calories", Number(data.calories));
    formData.append("protein", Number(data.protein));
    formData.append("carbs", Number(data.carbs));
    formData.append("fats", Number(data.fats));
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(`${url}/api/food/update`, formData);
      if (response.data.success) {
        toast.success("Food item updated successfully!");
        refreshList();
        closeModal();
      } else {
        toast.error("Error updating food item!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Try again!");
    }
  };

  return (
    <div className="modal-overlay fadeIn">
      <div className="edit-modal-card">
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-btn" onClick={closeModal}>✕</button>
        </div>
        
        <form className="edit-form" onSubmit={onSubmitHandler}>
          <div className="form-grid">
            <div className="form-left">
              <div className="image-upload-wrapper">
                <p className="label">Product Image (Optional)</p>
                <label htmlFor="edit-image" className="upload-box">
                  <img
                    src={image ? URL.createObjectURL(image) : `${url}/uploads/${foodItem.image}`}
                    alt="Preview"
                    className="preview-img"
                  />
                  {!image && <div className="overlay-text">Change Image</div>}
                </label>
                <input
                  type="file"
                  id="edit-image"
                  hidden
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </div>

            <div className="form-right">
              <div className="input-group">
                <p className="label">Product Name</p>
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                  placeholder="Product Name"
                  required
                />
              </div>

              <div className="input-group">
                <p className="label">Description</p>
                <textarea
                  name="description"
                  value={data.description}
                  onChange={onChangeHandler}
                  rows="3"
                  placeholder="Product Description"
                  required
                ></textarea>
              </div>

              <div className="row">
                <div className="input-group half">
                  <p className="label">Category</p>
                  <select name="category" onChange={onChangeHandler} value={data.category}>
                    <option value="Salad">Salad</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Sandwich">Sandwich</option>
                    <option value="Cake">Cake</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Noodles">Noodles</option>
                    <option value="Desi">Desi</option>
                  </select>
                </div>
                <div className="input-group half">
                  <p className="label">Price (Rs.)</p>
                  <input
                    type="number"
                    name="price"
                    value={data.price}
                    onChange={onChangeHandler}
                    placeholder="Price"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="nutrition-section">
            <h3 className="section-title">Nutritional Information</h3>
            <div className="nutrition-grid">
              <div className="input-group">
                <p className="label">Calories</p>
                <input type="number" name="calories" value={data.calories} onChange={onChangeHandler} placeholder="kcal" required />
              </div>
              <div className="input-group">
                <p className="label">Protein</p>
                <input type="number" name="protein" value={data.protein} onChange={onChangeHandler} placeholder="g" required />
              </div>
              <div className="input-group">
                <p className="label">Carbs</p>
                <input type="number" name="carbs" value={data.carbs} onChange={onChangeHandler} placeholder="g" required />
              </div>
              <div className="input-group">
                <p className="label">Fats</p>
                <input type="number" name="fats" value={data.fats} onChange={onChangeHandler} placeholder="g" required />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="save-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
