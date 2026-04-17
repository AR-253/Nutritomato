import React, { useContext, useEffect, useState } from 'react'
import './History.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { assets } from '../../assets/assets'

const History = () => {

    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!token) return;

        try {
            // Fetch Orders
            const orderResponse = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            const orders = orderResponse.data.data || [];

            // Fetch Manual/AI Logs
            const historyResponse = await axios.post(url + "/api/diet/history", {}, { headers: { token } });
            const dietLogs = historyResponse.data.data || [];

            let unifiedData = [];

            // Process Orders
            orders.forEach(order => {
                let totalCalories = 0;
                order.items.forEach(item => {
                    const cal = item.calories || 250; // Fallback
                    totalCalories += cal * item.quantity;
                });

                unifiedData.push({
                    id: order._id,
                    type: 'order',
                    title: `Order #${order._id.slice(-6).toUpperCase()}`, // Short ID
                    description: order.items.map(i => `${i.name} x ${i.quantity}`).join(', '),
                    calories: totalCalories,
                    date: new Date(order.date), // Assuming order has a date field
                    amount: order.amount,
                    status: order.status,
                    image: assets.parcel_icon // Default for orders
                });
            });

            // Process Diet Logs
            dietLogs.forEach(dailyLog => {
                if (dailyLog.logs && dailyLog.logs.length > 0) {
                    dailyLog.logs.forEach(log => {
                        unifiedData.push({
                            id: log._id || Math.random().toString(36).substr(2, 9),
                            type: log.type || 'manual',
                            title: log.name,
                            description: log.portion ? `Portion: ${log.portion}` : (log.type === 'ai' ? 'AI Logged' : (log.type === 'order' ? 'Logged from Order' : 'Manual Entry')),
                            calories: log.calories,
                            date: new Date(log.timestamp || dailyLog.date),
                            image: log.image || (log.type === 'ai' ? assets.profile_icon : assets.bag_icon) // placeholders
                        });
                    });
                } else if (dailyLog.consumedCalories > 0 && (!dailyLog.logs || dailyLog.logs.length === 0)) {
                    // Fallback for old data where 'logs' array didn't exist but consumedCalories > 0
                    // We create a summary entry for that day
                    unifiedData.push({
                        id: dailyLog._id,
                        type: 'manual',
                        title: "Daily Log Summary",
                        description: "Consolidated entry for the day",
                        calories: dailyLog.consumedCalories,
                        date: new Date(dailyLog.date),
                        image: assets.bag_icon
                    });
                }
            });

            // Sort by Date Descending
            unifiedData.sort((a, b) => b.date - a.date);

            setData(unifiedData);
            setLoading(false);

        } catch (error) {
            console.error("Error fetching history:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [token, url]);

    if (loading) {
        return <div className="history"><p>Loading history...</p></div>
    }

    return (
        <div className='history'>
            <h2>My Activity History</h2>
            <div className="history-container">
                {data.length === 0 ? <p>No history found.</p> : null}
                {data.map((item, index) => {
                    return (
                        <div key={index} className='history-item'>
                            {/* Icon/Image */}
                            <img src={item.type === 'order' ? assets.parcel_icon : assets.bag_icon} alt="" /> {/* Use strict icons for consistency */}

                            {/* Details */}
                            <div className="history-details">
                                <p><b>{item.title}</b></p>
                                <p>{item.description}</p>
                                <div className={`type-badge ${item.type}`}>{item.type}</div>
                            </div>

                            {/* Calories */}
                            <div className="history-calories">
                                <p>{item.calories} kcal</p>
                            </div>

                            {/* Date/Time */}
                            <div className="history-date">
                                <p>{item.date.toLocaleDateString()}</p>
                                <p>{item.type === 'order' || item.date.getHours() !== 0 ? item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                            </div>

                            {/* Extra (Amount for orders) */}
                            <div className="history-status">
                                {item.type === 'order' && <p><span>&#x25cf;</span> <b>{item.status}</b></p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default History
