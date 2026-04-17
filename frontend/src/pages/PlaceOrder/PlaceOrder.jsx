import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext)

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })

  const [payment, setPayment] = useState("cod")

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    })
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 150,
    }

    // Check for Calorie Limit
    try {
      let orderCalories = 0;
      orderItems.forEach(item => {
        orderCalories += (item.calories || 0) * item.quantity;
      });

      const dietResponse = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
      const historyResponse = await axios.post(url + "/api/diet/history", {}, { headers: { token } });

      if (dietResponse.data.success && dietResponse.data.data && dietResponse.data.data.plan) {
        const limit = dietResponse.data.data.plan.calories;

        // Calculate today's intake
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayIntake = 0;

        const logs = historyResponse.data.data || [];
        logs.forEach(log => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          if (logDate.getTime() === today.getTime()) {
            todayIntake += (log.consumedCalories || 0);
          }
        });

        if (todayIntake + orderCalories > limit) {
          alert(`⚠️ Limit Exceeded Warning! ⚠️\n\nThis order contains approx ${orderCalories} kcal.\nYour total will be ${todayIntake + orderCalories} kcal, which is OVER your daily limit of ${limit} kcal.\n\n(Proceeding with order...)`);
        }
      }
    } catch (err) {
      console.error("Error checking limit:", err);
    }

    if (payment === "stripe") {
      let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (response.data.success) {
        const { session_url } = response.data;
        window.location.replace(session_url);
      }
      else {
        alert("Error: " + response.data.message);
      }
    }
    else {
      let response = await axios.post(url + "/api/order/place", { ...orderData, paymentMethod: "cod" }, { headers: { token } });
      if (response.data.success) {
        history.push("/myorders");
        // Also verify navigation logic - user might not have `myorders` route explicitly defined in their head?
        // But usually it's standard.
      }
      else {
        alert("Error: " + response.data.message);
      }
    }
  }

  const history = useHistory();

  useEffect(() => {
    if (!token) {
      history.push('/cart')
    }
    else if (getTotalCartAmount() === 0) {
      history.push('/cart')
    }
  }, [token])

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="text" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip Code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs. {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>Rs. {getTotalCartAmount() === 0 ? 0 : 150}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>Rs. {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 150}</b>
            </div>
          </div>
          <div className="payment-options">
            <h2>Select Payment Method</h2>
            <div onClick={() => setPayment("cod")} className={`payment-option ${payment === "cod" ? "selected" : ""}`}>
              <p>COD (Cash on Delivery)</p>
            </div>
            <div onClick={() => setPayment("stripe")} className={`payment-option ${payment === "stripe" ? "selected" : ""}`}>
              <p>Stripe (Credit / Debit)</p>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
