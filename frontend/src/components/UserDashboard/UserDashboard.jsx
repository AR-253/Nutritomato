
import React, { useContext, useEffect, useState } from 'react';
import './UserDashboard.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserDashboard = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ intake: 0, target: 0 });
    const [viewType, setViewType] = useState('daily'); // 'daily' or 'monthly'

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                console.log("[UserDashboard] Fetching data...");

                // 1. Fetch Diet History (Manual Logs) instead of Orders
                const historyResponse = await axios.post(url + "/api/diet/history", {}, { headers: { token } });
                const logs = historyResponse.data.data;
                console.log("[UserDashboard] History fetched:", logs);

                // 2. Fetch Diet Plan (for target)
                let dailyTarget = 2000; // Default fallback
                let macros = { protein: 150, fats: 70, carbs: 250 }; // Default macros
                let isPersonalized = false;
                try {
                    const dietResponse = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
                    if (dietResponse.data.success && dietResponse.data.data && dietResponse.data.data.plan) {
                        dailyTarget = dietResponse.data.data.plan.calories;
                        macros = {
                            protein: dietResponse.data.data.plan.protein,
                            fats: dietResponse.data.data.plan.fats,
                            carbs: dietResponse.data.data.plan.carbs
                        };
                        isPersonalized = true;
                    }
                } catch (error) {
                    console.log("[UserDashboard] Error fetching diet plan, using default:", error);
                }

                // 3. Calculate Intake (Last 30 Days & Today)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let totalIntake = 0;
                let todayIntake = 0;
                let totalMacros = { protein: 0, fats: 0, carbs: 0 };
                let todayMacros = { protein: 0, fats: 0, carbs: 0 };

                logs.forEach(log => {
                    const logDate = new Date(log.date);
                    // Reset log date time for comparison
                    const logDateOnly = new Date(logDate);
                    logDateOnly.setHours(0, 0, 0, 0);

                    // Add to 30-day totals if within range
                    if (logDate >= thirtyDaysAgo) {
                        totalIntake += (log.consumedCalories || 0);
                        totalMacros.protein += (log.consumedProtein || 0);
                        totalMacros.fats += (log.consumedFats || 0);
                        totalMacros.carbs += (log.consumedCarbs || 0);
                    }

                    // Add to Today's totals
                    if (logDateOnly.getTime() === today.getTime()) {
                        todayIntake += (log.consumedCalories || 0);
                        todayMacros.protein += (log.consumedProtein || 0);
                        todayMacros.fats += (log.consumedFats || 0);
                        todayMacros.carbs += (log.consumedCarbs || 0);
                    }
                });

                console.log("[UserDashboard] Total Intake:", totalIntake, "Today:", todayIntake);

                // 4. Prepare Data for Chart
                const monthlyTarget = dailyTarget * 30;

                setSummary({ intake: totalIntake, target: monthlyTarget, isPersonalized, dailyTarget, todayIntake, macros, totalMacros, todayMacros });
                setData([
                    {
                        name: 'Last 30 Days',
                        Intake: totalIntake,
                        Target: monthlyTarget,
                    },
                ]);
                setLoading(false);

            } catch (error) {
                console.error("[UserDashboard] Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [token, url]);

    if (loading) {
        return <div className="dashboard-loading">Loading Dashboard...</div>;
    }

    // Helper for Gauge (reused logic)
    const percentage = Math.min((summary.todayIntake / summary.dailyTarget) * 100, 100);

    // Macro Helpers
    const getWidth = (val, target) => Math.min((val / target) * 100, 100) + '%';
    const dailyProteinTarget = summary.macros?.protein || 1;
    const dailyFatsTarget = summary.macros?.fats || 1;
    const dailyCarbsTarget = summary.macros?.carbs || 1;

    const monthlyProteinTarget = dailyProteinTarget * 30;
    const monthlyFatsTarget = dailyFatsTarget * 30;
    const monthlyCarbsTarget = dailyCarbsTarget * 30;

    return (
        <div className='user-dashboard'>
            {/* Header with Switcher */}
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h2>Track Your Balance</h2>
                    <p>{viewType === 'daily' ? "Check today's goal" : "Your 30-day performance"}</p>
                </div>
                <div className="view-toggle">
                    <button 
                        className={viewType === 'daily' ? 'active' : ''} 
                        onClick={() => setViewType('daily')}
                    >
                        Daily
                    </button>
                    <button 
                        className={viewType === 'monthly' ? 'active' : ''} 
                        onClick={() => setViewType('monthly')}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="dashboard-body">
                {viewType === 'daily' ? (
                    <div className="daily-view fadeIn">
                        <div className="daily-main-stats">
                            {/* Gauge Section */}
                            <div className="gauge-section">
                                <div className="gauge-wrapper">
                                    <svg height="140" width="280" viewBox="0 0 280 140" className="gauge-svg">
                                        <path d="M 30 140 A 110 110 0 0 1 250 140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="22" strokeLinecap="round" />
                                        <path
                                            d="M 30 140 A 110 110 0 0 1 250 140"
                                            fill="none"
                                            stroke="#ff6347"
                                            strokeWidth="22"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(percentage / 100) * 345} 345`}
                                            className="gauge-progress"
                                        />
                                    </svg>
                                    <div className="gauge-text">
                                        <div className="gauge-fire">🔥</div>
                                        <h3>{summary.todayIntake}</h3>
                                        <p>kcal today</p>
                                    </div>
                                </div>
                                <div className="daily-status">
                                    <p>Target: <strong>{summary.dailyTarget} kcal</strong></p>
                                    <p>Remaining: <span className="highlight">{(summary.dailyTarget - summary.todayIntake) > 0 ? (summary.dailyTarget - summary.todayIntake) : 0} kcal</span></p>
                                </div>
                            </div>

                            {/* Daily Macros (Horizontal Grid) */}
                            <div className="daily-macros-grid">
                                <div className="macro-card protein-card">
                                    <div className="card-top">
                                        <h4>Protein</h4>
                                        <span>{summary.todayMacros?.protein || 0}g</span>
                                    </div>
                                    <div className="card-bar"><div className="fill" style={{ width: getWidth(summary.todayMacros?.protein, dailyProteinTarget) }}></div></div>
                                    <p>Goal: {dailyProteinTarget}g</p>
                                </div>
                                <div className="macro-card fats-card">
                                    <div className="card-top">
                                        <h4>Fats</h4>
                                        <span>{summary.todayMacros?.fats || 0}g</span>
                                    </div>
                                    <div className="card-bar"><div className="fill" style={{ width: getWidth(summary.todayMacros?.fats, dailyFatsTarget) }}></div></div>
                                    <p>Goal: {dailyFatsTarget}g</p>
                                </div>
                                <div className="macro-card carbs-card">
                                    <div className="card-top">
                                        <h4>Carbs</h4>
                                        <span>{summary.todayMacros?.carbs || 0}g</span>
                                    </div>
                                    <div className="card-bar"><div className="fill" style={{ width: getWidth(summary.todayMacros?.carbs, dailyCarbsTarget) }}></div></div>
                                    <p>Goal: {dailyCarbsTarget}g</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="monthly-view fadeIn">
                        <div className="monthly-stats-row">
                            <div className="stat-pill">
                                <p>Monthly Consumed</p>
                                <h3>{summary.intake} kcal</h3>
                            </div>
                            <div className="stat-pill">
                                <p>Target</p>
                                <h3>{summary.target} kcal</h3>
                            </div>
                            <div className="stat-pill">
                                <p>Difference</p>
                                <h3 style={{color: (summary.target - summary.intake) >= 0 ? '#4caf50' : '#ff4757'}}>
                                    {summary.target - summary.intake} kcal
                                </h3>
                            </div>
                        </div>

                        <div className="monthly-content-grid">
                            <div className="chart-area card-glass">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#ccc" fontSize={12} />
                                        <YAxis stroke="#ccc" fontSize={12} />
                                        <Tooltip contentStyle={{background: '#333', border: 'none', borderRadius: '8px'}} />
                                        <Bar dataKey="Intake" fill="#ff6347" radius={[4, 4, 0, 0]} barSize={40} />
                                        <Bar dataKey="Target" fill="rgba(255,255,255,0.3)" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="monthly-macros card-glass">
                                <h4>30-Day Macros</h4>
                                <div className="m-macro-item">
                                    <div className="label">Protein: {summary.totalMacros?.protein || 0} / {monthlyProteinTarget}g</div>
                                    <div className="m-bar"><div className="fill protein" style={{ width: getWidth(summary.totalMacros?.protein, monthlyProteinTarget) }}></div></div>
                                </div>
                                <div className="m-macro-item">
                                    <div className="label">Fats: {summary.totalMacros?.fats || 0} / {monthlyFatsTarget}g</div>
                                    <div className="m-bar"><div className="fill fats" style={{ width: getWidth(summary.totalMacros?.fats, monthlyFatsTarget) }}></div></div>
                                </div>
                                <div className="m-macro-item">
                                    <div className="label">Carbs: {summary.totalMacros?.carbs || 0} / {monthlyCarbsTarget}g</div>
                                    <div className="m-bar"><div className="fill carbs" style={{ width: getWidth(summary.totalMacros?.carbs, monthlyCarbsTarget) }}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
