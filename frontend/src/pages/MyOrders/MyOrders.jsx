
import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {

    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
        setData(response.data.data);
    }

    const handleEatClick = (order) => {
        setSelectedOrder(order);
        setShowLogModal(true);
    }

    const logConsumption = async (percentage) => {
        if (!selectedOrder) return;

        // Calculate total calories for the order
        // Assuming backend sends items with calories. If not, we might need to fetch them or rely on frontend matching.
        // Wait, previous fix restored calories in DB, but does order history have it?
        // Order model stores "items" array which defaults to the object structure at time of order.
        // If order was placed BEFORE we fixed food items, it might miss calories.
        // But user just placed orders recently? Or we restored.
        // Let's assume items have calories. If not, we might need a fallback or fetch food list.
        // Actually, `orderModel` stores a copy of item data. 
        // To be safe, we can try to sum up calories from items. 

        let totalCalories = 0;
        let totalProtein = 0;
        let totalFats = 0;
        let totalCarbs = 0;

        selectedOrder.items.forEach(item => {
            // Fallback: Default values if missing
            const cal = item.calories || 250;
            const prot = item.protein || 0;
            const fat = item.fats || 0;
            const carb = item.carbs || 0;

            totalCalories += cal * item.quantity;
            totalProtein += prot * item.quantity;
            totalFats += fat * item.quantity;
            totalCarbs += carb * item.quantity;
        });

        const consumedCalories = Math.round((totalCalories * percentage) / 100);
        const consumedProtein = Math.round((totalProtein * percentage) / 100);
        const consumedFats = Math.round((totalFats * percentage) / 100);
        const consumedCarbs = Math.round((totalCarbs * percentage) / 100);

        // Generate a descriptive name
        const foodName = selectedOrder.items.map(item => item.name).join(", ");

        // Check for Calorie Limit
        try {
            const dietResponse = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
            const historyResponse = await axios.post(url + "/api/diet/history", {}, { headers: { token } });

            if (dietResponse.data.success && dietResponse.data.data && dietResponse.data.data.plan) {
                const limit = dietResponse.data.data.plan.calories;

                // Calculate today's intake
                const todayString = new Date().toISOString().split('T')[0];
                let todayIntake = 0;

                const logs = historyResponse.data.data || [];
                logs.forEach(log => {
                    if (log.date === todayString) {
                        todayIntake += (log.consumedCalories || 0);
                    }
                });

                if (todayIntake + consumedCalories > limit) {
                    alert(`⚠️ Limit Exceeded Warning! ⚠️\n\nEating this will take you to ${todayIntake + consumedCalories} kcal, which is OVER your daily limit of ${limit} kcal.\n\n(We will still log it, but watch out!)`);
                }
            }
        } catch (err) {
            console.error("Error checking limit:", err);
        }

        try {
            const response = await axios.post(url + "/api/diet/log-calories",
                {
                    userId: token,
                    calories: consumedCalories,
                    protein: consumedProtein,
                    fats: consumedFats,
                    carbs: consumedCarbs,
                    orderId: selectedOrder._id,
                    foodName: foodName
                },
                { headers: { token } }
            );

            if (response.data.success) {
                alert(`Logged order consumption: ${percentage}%!`);
                await fetchOrders(); // Refresh data to show "Update" button
            } else {
                alert("Failed to log consumption: " + response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error logging consumption: " + error.message);
        }

        setShowLogModal(false);
        setSelectedOrder(null);
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000); // Poll every 15s
            return () => clearInterval(interval);
        }
    }, [token])

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className='my-orders-order'>
                            <img src={assets.parcel_icon} alt="" />
                            <p>{order.items.map((item, index) => {
                                if (index === order.items.length - 1) {
                                    return item.name + " x " + item.quantity
                                }
                                else {
                                    return item.name + " x " + item.quantity + ", "
                                }
                            })}</p>
                            <p>Rs. {order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                            {order.status === "Delivered" && (
                                <button onClick={() => handleEatClick(order)}>
                                    {order.isLogged ? `Update (${order.loggedCalories !== undefined ? order.loggedCalories : '?'} kcal)` : "How much you eat?"}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {showLogModal && (
                <div className="log-modal-overlay">
                    <div className="log-modal">
                        <h3>How much did you eat?</h3>
                        <p>Select percentage of order consumed:</p>
                        <div className="log-options">
                            <button onClick={() => logConsumption(25)}>25%</button>
                            <button onClick={() => logConsumption(50)}>50%</button>
                            <button onClick={() => logConsumption(75)}>75%</button>
                            <button onClick={() => logConsumption(100)}>100%</button>
                        </div>
                        <button className="close-btn" onClick={() => setShowLogModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyOrders
