import React, { useState } from "react";
import "./Add.css";
import axios from "axios";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Add = ({ url }) => {
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

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please upload an image!");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("calories", Number(data.calories));
    formData.append("protein", Number(data.protein));
    formData.append("carbs", Number(data.carbs));
    formData.append("fats", Number(data.fats));
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        toast.success("Item added successfully!");
        setData({ name: "", description: "", price: "", category: "Salad", calories: "", protein: "", carbs: "", fats: "" });
        setImage(false);
      } else {
        toast.error("Error adding food item!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Try again!");
    }
  };

  return (
    <div className="add-container fadeIn">
      <div className="add-card">
        <div className="card-header">
          <h2>Add New Product</h2>
          <p>Fill in the details to add a new dish to the menu.</p>
        </div>
        
        <form className="add-form" onSubmit={onSubmitHandler}>
          <div className="form-grid">
            {/* Left Side: Image Upload */}
            <div className="form-left">
              <div className="image-upload-wrapper">
                <p className="label">Product Image</p>
                <label htmlFor="image" className="upload-box">
                  <img
                    src={image ? URL.createObjectURL(image) : assets.upload_area}
                    alt="Preview"
                    className={image ? "preview-img" : "placeholder-img"}
                  />
                  {!image && <span>Click to upload</span>}
                </label>
                <input
                  type="file"
                  id="image"
                  required
                  hidden
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </div>

            {/* Right Side: Primary Info */}
            <div className="form-right">
              <div className="input-group">
                <p className="label">Product Name</p>
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                  placeholder="e.g. Chicken Caesar Salad"
                  required
                />
              </div>

              <div className="input-group">
                <p className="label">Product Description</p>
                <textarea
                  name="description"
                  value={data.description}
                  onChange={onChangeHandler}
                  rows="3"
                  placeholder="Describe the dish ingredients and taste..."
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
                  </select>
                </div>
                <div className="input-group half">
                  <p className="label">Price (Rs.)</p>
                  <input
                    type="number"
                    name="price"
                    value={data.price}
                    onChange={onChangeHandler}
                    placeholder="250"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="form-divider" />

          {/* Bottom Section: Nutritional Data */}
          <div className="nutrition-section">
            <h3 className="section-title">Nutritional Information</h3>
            <div className="nutrition-grid">
              <div className="input-group">
                <p className="label">Calories (kcal)</p>
                <input type="number" name="calories" value={data.calories} onChange={onChangeHandler} placeholder="350" required />
              </div>
              <div className="input-group">
                <p className="label">Protein (g)</p>
                <input type="number" name="protein" value={data.protein} onChange={onChangeHandler} placeholder="20" required />
              </div>
              <div className="input-group">
                <p className="label">Carbs (g)</p>
                <input type="number" name="carbs" value={data.carbs} onChange={onChangeHandler} placeholder="30" required />
              </div>
              <div className="input-group">
                <p className="label">Fats (g)</p>
                <input type="number" name="fats" value={data.fats} onChange={onChangeHandler} placeholder="10" required />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Add Product to Menu
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
