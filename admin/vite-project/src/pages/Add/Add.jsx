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
    weight: "",
    customCategory: ""
  });
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "", calories: "" }]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (name === "category") {
      setShowCustomCategory(value === "Other");
    }
  };

  const onIngredientChange = (index, event) => {
    const { name, value } = event.target;
    const newIngredients = [...ingredients];
    newIngredients[index][name] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", calories: "" }]);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const analyzeMacros = async () => {
    if (!image) {
      toast.error("Please upload the dish picture!");
      return;
    }
    if (!data.name) {
      toast.error("Please enter the dish name!");
      return;
    }
    if (!data.weight) {
      toast.error("Please enter the portion size (weight)!");
      return;
    }

    setIsAnalyzing(true);
    const toastId = toast.loading("Analyzing dish image and macros...");

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("prompt", `ADMIN AGENT CONTEXT: Current dish Name: "${data.name}", Weight: "${data.weight}". 
      INSTRUCTION: Analyze this food image, dish name, and exact portion weight. Calculate the macros EXACTLY for the provided weight. Please provide a detailed ingredient breakdown with quantity and calories.`);

      const response = await axios.post(`${url}/api/ai/chat`, formData);

      if (response.data.success) {
        console.log("AI Response Data:", response.data);
        
        // 1. Set the robust top-level macros returned by aiController
        setData(prev => ({
          ...prev,
          calories: response.data.calories || prev.calories,
          protein: response.data.protein || prev.protein,
          carbs: response.data.carbs || prev.carbs,
          fats: response.data.fats || prev.fats
        }));

        // 2. Safely extract ingredients directly from the API response
        if (response.data.ingredients && response.data.ingredients.length > 0) {
          setIngredients(response.data.ingredients);
        }
        
        toast.update(toastId, { render: "Macros auto-filled successfully!", type: "success", isLoading: false, autoClose: 3000 });
      } else {
        toast.update(toastId, { render: response.data.message || "AI Analysis failed", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast.update(toastId, { render: "Service unavailable. Try again.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please upload an image!");
      return;
    }

    const finalCategory = data.category === "Other" ? data.customCategory : data.category;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", finalCategory);
    formData.append("calories", Number(data.calories));
    formData.append("protein", Number(data.protein));
    formData.append("carbs", Number(data.carbs));
    formData.append("fats", Number(data.fats));
    formData.append("weight", data.weight || "250g");
    formData.append("ingredients", JSON.stringify(ingredients.filter(ing => ing.name !== "")));
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        toast.success("Item added successfully!");
        setData({ name: "", description: "", price: "", category: "Salad", calories: "", protein: "", carbs: "", fats: "", weight: "" });
        setIngredients([{ name: "", quantity: "", calories: "" }]);
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
                    <option value="Desi">Desi</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Sandwich">Sandwich</option>
                    <option value="Cake">Cake</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Noodles">Noodles</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>
                {showCustomCategory && (
                  <div className="input-group half fadeIn">
                    <p className="label">Enter Custom Category</p>
                    <input 
                      type="text" 
                      name="customCategory" 
                      value={data.customCategory} 
                      onChange={onChangeHandler} 
                      placeholder="e.g. Seafood" 
                      required 
                    />
                  </div>
                )}
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
            <div className="section-header">
              <h3 className="section-title">Nutritional Information (Totals)</h3>
              <div className="section-actions">
                <button type="button" className="ai-btn" onClick={analyzeMacros} disabled={isAnalyzing}>
                  {isAnalyzing ? "Analyzing..." : "✨ Auto-Fill Macros"}
                </button>
              </div>
            </div>
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
              <div className="input-group">
                <p className="label">Portion/Weight <span style={{color:'red'}}>*</span></p>
                <input type="text" name="weight" value={data.weight} onChange={onChangeHandler} placeholder="e.g. 300g or 2 pcs" required />
              </div>
            </div>
          </div>

          <hr className="form-divider" />

          {/* Ingredients Section */}
          <div className="ingredients-section">
            <div className="section-header">
              <h3 className="section-title">Ingredient Breakdown (AI Analysis)</h3>
              <div className="section-actions">
                <button type="button" className="add-ing-btn" onClick={addIngredient}>+ Add Ingredient</button>
              </div>
            </div>
            <div className="ingredients-grid">
              <div className="ingredient-header">
                <span className="ing-h-name">Ingredient Name</span>
                <span className="ing-h-qty">Quantity</span>
                <span className="ing-h-cal">Calories</span>
                <span className="ing-h-action"></span>
              </div>
              {ingredients.map((ing, index) => (
                <div className="ingredient-row" key={index}>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Ingredient Name" 
                    value={ing.name} 
                    onChange={(e) => onIngredientChange(index, e)} 
                  />
                  <input 
                    type="text" 
                    name="quantity" 
                    placeholder="Qty (e.g. 100g)" 
                    value={ing.quantity} 
                    onChange={(e) => onIngredientChange(index, e)} 
                  />
                  <input 
                    type="number" 
                    name="calories" 
                    placeholder="Calories" 
                    value={ing.calories} 
                    onChange={(e) => onIngredientChange(index, e)} 
                  />
                  {ingredients.length > 1 && (
                    <button type="button" className="remove-ing-btn" onClick={() => removeIngredient(index)}>×</button>
                  )}
                </div>
              ))}
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
