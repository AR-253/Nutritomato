import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([])
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [goal, setGoal] = useState(null);
  const url = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:4000";

  const addToCart = async (itemId) => {
    if (!cartItems) {
      setCartItems({ [itemId]: 1 });
    } else if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
        await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
    }
  };

  const removeFromCart = async (itemId) => {
    if (cartItems && cartItems[itemId] > 0) {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
      if (token) {
          await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    if (!cartItems) return 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = (food_list || []).find((product) => product._id === item);
        if (itemInfo) {
            totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    searchTerm,
    setSearchTerm,
    showLogin,
    setShowLogin,
    recommendedItems,
    setRecommendedItems,
    goal,
    setGoal
  };

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Error loading cart data:", error);
      setCartItems({});
    }
  }

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, [])

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success) {
        console.log("Fetched Food List:", response.data.data);
        setFoodList(response.data.data || []);
      } else {
        console.error("Failed to fetch food list:", response.data.message);
        setFoodList([]);
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFoodList([]);
    }
  }

  // Fetch AI Goal and recommendations
  useEffect(() => {
    if (token) {
      const fetchDietPlan = async () => {
        try {
          const response = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
          if (response.data.success) {
            setGoal(response.data.data.userInfo.goal);
          }
        } catch (error) {
          console.error("Error fetching diet plan:", error);
        }
      };
      fetchDietPlan();
    } else {
      setGoal(null);
      setRecommendedItems([]);
    }
  }, [token, url]);

  useEffect(() => {
    if (!food_list || food_list.length === 0) return;

    let filtered = [];
    
    // Convert calories to numbers for reliable comparison
    const preparedList = food_list.map(item => ({
        ...item,
        calories: Number(item.calories || 0),
        protein: Number(item.protein || 0)
    }));

    if (goal === 'Lose') {
      filtered = preparedList.filter(item => item.calories > 0 && item.calories <= 400).sort((a, b) => a.calories - b.calories);
    } else if (goal === 'Gain') {
      filtered = preparedList.filter(item => item.calories >= 500).sort((a, b) => b.calories - a.calories);
    } else if (goal === 'Maintain') {
      filtered = preparedList.filter(item => item.calories > 300 && item.calories < 600);
    } else {
      // Fallback for guests: Show high protein or healthy low-cal options
      filtered = preparedList.filter(item => (item.calories > 0 && item.calories < 400) || item.protein > 25);
    }

    setRecommendedItems(filtered.slice(0, 10));
  }, [goal, food_list]);

  // Interceptor to handle token expiration and invalid signatures
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Auth middleware returns 200 OK with success: false for JWT errors
        if (response.data && response.data.success === false) {
          const msg = response.data.message;
          if (msg === "invalid signature" || msg === "jwt expired" || msg === "Not Authorized Login Again" || msg === "jwt malformed") {
            console.log("Token invalid. Logging out...");
            setToken("");
            localStorage.removeItem("token");
          }
        }
        return response;
      },
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.data.message === "Not Authorized Login Again" || error.response.data.message === "jwt expired")) {
            console.log("Token expired or unauthorized. Logging out...");
            setToken("");
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
