
import React, { useContext, useEffect, useState } from 'react';
import './ConsumptionReminder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const ConsumptionReminder = () => {
    const { url, token } = useContext(StoreContext);
    const [reminderOrder, setReminderOrder] = useState(null);
    const [showLogModal, setShowLogModal] = useState(false);

    const checkRecentOrders = async () => {
        if (!token) return;
        try {
            const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            if (response.data.success) {
                const orders = response.data.data;
                const now = Date.now();
                const tenMinutes = 10 * 60 * 1000;
                // const tenMinutes = 10 * 1000; // Debug: 10 seconds

                const pendingOrder = orders.find(order => {
                    if (order.status === "Delivered" && !order.isLogged && order.deliveredAt) {
                        const deliveredTime = new Date(order.deliveredAt).getTime();
                        // Check if more than 10 minutes passed
                        if ((now - deliveredTime) > tenMinutes) {
                            // Optional: Don't show if delivered e.g., 24 hours ago
                            if ((now - deliveredTime) < (24 * 60 * 60 * 1000)) {
                                return true;
                            }
                        }
                    }
                    return false;
                });

                if (pendingOrder) {
                    setReminderOrder(pendingOrder);
                    setShowLogModal(true);
                }
            }
        } catch (error) {
            console.error("Error checking recent orders:", error);
        }
    };

    useEffect(() => {
        // Check every minute
        const interval = setInterval(() => {
            checkRecentOrders();
        }, 60000);

        // Initial check
        checkRecentOrders();

        return () => clearInterval(interval);
    }, [token]);

    const logConsumption = async (percentage) => {
        if (!reminderOrder) return;

        let totalCalories = 0;
        reminderOrder.items.forEach(item => {
            const cal = item.calories || 250;
            totalCalories += cal * item.quantity;
        });

        const consumed = Math.round((totalCalories * percentage) / 100);

        try {
            const response = await axios.post(url + "/api/diet/log-calories",
                { userId: token, calories: consumed, orderId: reminderOrder._id }, // Pass orderId to mark as logged
                { headers: { token } }
            );

            if (response.data.success) {
                alert(`Logged ${consumed} kcal!`);
                setReminderOrder(null);
                setShowLogModal(false);
            } else {
                alert("Failed to log calories: " + response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error logging calories: " + error.message);
        }
    };

    const handleClose = () => {
        // Maybe mark as skipped? For now just close, it will pop up again later or implement 'remind later'
        setShowLogModal(false);
        // To avoid annoyance, maybe we should mark it as skipped or store in local storage to not remind for this session?
        // For now, simpler is better.
    };

    if (!showLogModal || !reminderOrder) return null;

    return (
        <div className="log-modal-overlay">
            <div className="log-modal">
                <h3>Did you eat?</h3>
                <p>Order #{reminderOrder._id.slice(-6)} was delivered a while ago.</p>
                <p>How much did you eat?</p>
                <div className="log-options">
                    <button onClick={() => logConsumption(25)}>25%</button>
                    <button onClick={() => logConsumption(50)}>50%</button>
                    <button onClick={() => logConsumption(75)}>75%</button>
                    <button onClick={() => logConsumption(100)}>100%</button>
                </div>
                <button className="close-btn" onClick={handleClose}>Not yet / Cancel</button>
            </div>
        </div>
    );
};

export default ConsumptionReminder;
