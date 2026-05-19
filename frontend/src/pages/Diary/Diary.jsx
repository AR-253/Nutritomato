import React, { useContext, useEffect, useState, useRef } from 'react';
import './Diary.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import MacroCircle from '../../components/Diary/MacroCircle';
import WaterTracker from '../../components/Diary/WaterTracker';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    ReferenceLine,
    Cell
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isOver = data.consumed > data.target;
        return (
            <div className="custom-chart-tooltip">
                <p className="tooltip-date">{new Date(data.date).toDateString()}</p>
                <p className="tooltip-consumed" style={{ color: isOver ? '#ff4757' : '#45c4b0', fontWeight: '700' }}>
                    Consumed: {data.consumed} kcal
                </p>
                <p className="tooltip-target" style={{ color: '#adb5bd', fontSize: '0.85rem' }}>
                    Target: {data.target} kcal
                </p>
            </div>
        );
    }
    return null;
};

const Diary = () => {
    const { url, token } = useContext(StoreContext);
    const queryParams = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(queryParams.get('tab') || 'daily');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const dateInputRef = useRef(null);
    const [dailyData, setDailyData] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    
    // Custom Range State
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [customReport, setCustomReport] = useState(null);
    const [loadingCustom, setLoadingCustom] = useState(false);

    const fetchDiaryData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const planRes = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
            if (planRes.data.success) {
                setPlan(planRes.data.data.plan);
            }
            const historyRes = await axios.post(url + "/api/diet/history", {}, { headers: { token } });
            if (historyRes.data.success) {
                const logs = historyRes.data.data;
                const todayLog = logs.find(l => l.date === date);
                setDailyData(todayLog || {
                    consumedCalories: 0,
                    consumedProtein: 0,
                    consumedFats: 0,
                    consumedCarbs: 0,
                    waterIntake: 0,
                    logs: []
                });
            }
        } catch (error) {
            console.error("Error fetching diary:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyReport = async () => {
        if (!token) return;
        setLoadingReport(true);
        try {
            const response = await axios.post(url + "/api/diet/weekly-report", {}, { headers: { token } });
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoadingReport(false);
        }
    };

    const fetchCustomReport = async () => {
        if (!token || !customStart || !customEnd) return;
        setLoadingCustom(true);
        try {
            const response = await axios.post(url + "/api/diet/custom-report", { 
                startDate: customStart, 
                endDate: customEnd 
            }, { headers: { token } });
            if (response.data.success) {
                setCustomReport(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching custom report:", error);
        } finally {
            setLoadingCustom(false);
        }
    };

    const resetToday = async () => {
        if (window.confirm("Are you sure you want to clear all logs for this day? This cannot be undone.")) {
            try {
                const response = await axios.post(url + "/api/diet/reset-day", { date }, { headers: { token } });
                if (response.data.success) {
                    window.__dashboardCache = null; // Clear cache for live updates
                    fetchDiaryData();
                    alert("Day reset successfully.");
                }
            } catch (error) {
                console.error("Error resetting day:", error);
                alert("Failed to reset day.");
            }
        }
    };

    const downloadCSV = () => {
        if (!customReport || !customReport.logs) return;

        // CSV Header
        const headers = ["Date", "Consumed Calories", "Protein (g)", "Carbs (g)", "Fats (g)", "Food Items"];
        
        // CSV Rows
        const rows = customReport.logs.map(day => {
            const foodItems = day.logs.map(l => `${l.name} (${l.calories}kcal)`).join(" | ");
            return [
                new Date(day.date).toDateString(),
                day.consumedCalories,
                day.consumedProtein,
                day.consumedCarbs,
                day.consumedFats,
                `"${foodItems}"` // Quote to handle commas/pipes in food names
            ];
        });

        // Combine into CSV string
        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", blobUrl);
        link.setAttribute("download", `NutriTomato_Report_${customStart}_to_${customEnd}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (activeTab === 'daily') {
            fetchDiaryData();
        } else if (activeTab === 'weekly') {
            fetchWeeklyReport();
        }
    }, [token, url, date, activeTab]);

    const updateWater = async (amount) => {
        try {
            const res = await axios.post(url + "/api/diet/log-water", { userId: token, amount, date }, { headers: { token } });
            if (res.data.success) {
                setDailyData(prev => ({ ...prev, waterIntake: res.data.waterIntake }));
            }
        } catch (error) {
            console.error("Water update error:", error);
        }
    };

    const changeDate = (days) => {
        const current = new Date(date);
        current.setDate(current.getDate() + days);
        setDate(current.toISOString().split('T')[0]);
    };

    const getMealLogs = (meal) => {
        return dailyData?.logs?.filter(log => log.mealType === meal) || [];
    };

    const calculateMealCalories = (meal) => {
        return getMealLogs(meal).reduce((sum, log) => sum + log.calories, 0);
    };

    if (loading && !dailyData) return <div className="diary-loading">Loading your diary...</div>;

    const targetCalories = plan?.calories || 2000;
    const consumedCalories = dailyData?.consumedCalories || 0;
    const remainingCalories = targetCalories - consumedCalories;

    const getPercent = (consumed, target) => {
        const c = parseFloat(consumed) || 0;
        const t = parseFloat(target) || 1;
        return Math.min(Math.round((c / t) * 100), 100);
    };

    return (
        <div className='diary-page'>
            <div className="diary-top-section">
                <div className="reports-heading">
                    <h1>Reports</h1>
                    <p>Track your nutrition, consistency, and progress</p>
                </div>
                <div className="dashboard-tabs">
                    <button className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
                        📅 Daily Report
                    </button>
                    <button className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>
                        📊 Weekly Report
                    </button>
                    <button className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>
                        🔍 Custom Report
                    </button>
                </div>
            </div>

            {activeTab === 'daily' ? (
                <div className="daily-view fadeIn">
                    <div className="diary-header">
                        <div className="date-navigator">
                            <button onClick={() => changeDate(-1)} className="nav-btn">◀</button>
                            <div className="date-display" onClick={() => dateInputRef.current.showPicker()}>
                                <span className="calendar-icon">📅</span>
                                <h2>{date === new Date().toISOString().split('T')[0] ? "Today's Report" : new Date(date).toDateString()}</h2>
                                <input 
                                    type="date" 
                                    ref={dateInputRef} 
                                    className="hidden-date-input" 
                                    value={date} 
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) setDate(val);
                                        else setDate(new Date().toISOString().split('T')[0]);
                                    }} 
                                />
                            </div>
                            <button 
                                onClick={() => changeDate(1)} 
                                className="nav-btn" 
                                disabled={date >= new Date().toISOString().split('T')[0]}
                            >
                                ▶
                            </button>
                        </div>
                        <button className="reset-day-btn" onClick={resetToday} title="Clear all logs for this day">
                            🔄 Reset Day
                        </button>
                    </div>

                    <div className="diary-container">
                        <div className="diary-left">
                            <div className="summary-card">
                                <div className="calories-summary">
                                    <div className="cal-item"><span className="cal-val">{targetCalories}</span><span className="cal-lbl">Goal</span></div>
                                    <div className="cal-divider">-</div>
                                    <div className="cal-item"><span className="cal-val">{consumedCalories}</span><span className="cal-lbl">Food</span></div>
                                    <div className="cal-divider">=</div>
                                    <div className="cal-item highlight"><span className="cal-val">{remainingCalories}</span><span className="cal-lbl">Remaining</span></div>
                                </div>
                                <div className="macros-row">
                                    <MacroCircle label="Protein" value={dailyData?.consumedProtein || 0} percentage={getPercent(dailyData?.consumedProtein, plan?.protein || 150)} color="#e74c3c" />
                                    <MacroCircle label="Carbs" value={dailyData?.consumedCarbs || 0} percentage={getPercent(dailyData?.consumedCarbs, plan?.carbs || 250)} color="#f1c40f" />
                                    <MacroCircle label="Fats" value={dailyData?.consumedFats || 0} percentage={getPercent(dailyData?.consumedFats, plan?.fats || 70)} color="#2ecc71" />
                                </div>
                            </div>
                            <WaterTracker glasses={dailyData?.waterIntake || 0} onAdd={() => updateWater(1)} onRemove={() => updateWater(-1)} />
                        </div>

                        <div className="diary-right">
                            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(meal => (
                                <div key={meal} className="meal-section">
                                    <div className="meal-header"><h3>{meal}</h3><span className="meal-total">{calculateMealCalories(meal)} kcal</span></div>
                                    <div className="meal-items">
                                        {getMealLogs(meal).length === 0 ? <p className="no-items">No food logged for {meal}</p> : 
                                            getMealLogs(meal).map((log, idx) => (
                                                <div key={idx} className="food-log-item">
                                                    <div className="food-info"><span className="food-name">{log.name}</span><span className="food-meta">{log.type === 'ai' ? '🤖 AI Identified' : '📝 Manual'}</span></div>
                                                    <div className="food-macros"><span>{log.protein}g P</span> <span>{log.carbs}g C</span> <span>{log.fats}g F</span></div>
                                                    <span className="food-cals">{log.calories} kcal</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'weekly' ? (
                <div className="weekly-view fadeIn">
                    {loadingReport ? <div className="diary-loading">Generating report...</div> : !reportData ? <div className="diary-loading">No data found.</div> : (
                        <div className="report-grid">
                            <div className="report-summary">
                                <div className="stat-card">
                                    <h3>Weekly Consumption</h3>
                                    <div className="value">{reportData.summary.totalConsumed?.toLocaleString() || 0}</div>
                                    <div className="sub">Goal: {(reportData.summary.targetCalories * 7).toLocaleString()} kcal</div>
                                </div>
                                <div className="stat-card score-card">
                                    <h3>Weekly Consistency</h3>
                                    <div className="value">{reportData.summary.consistencyScore}%</div>
                                    <div className="sub">Goal met on {reportData.summary.successfulDays} / 7 days</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Weekly Status</h3>
                                    <div className={`value status-text ${
                                        reportData.summary.consistencyScore >= 80 ? 'excellent' : 
                                        reportData.summary.consistencyScore >= 50 ? 'good' : 'warning'
                                    }`}>
                                        {
                                            reportData.summary.consistencyScore >= 90 ? 'Excellent!' :
                                            reportData.summary.consistencyScore >= 70 ? 'Great Progress' :
                                            reportData.summary.consistencyScore >= 50 ? 'On Track' : 'Need Focus'
                                        }
                                    </div>
                                    <div className="sub">
                                        {
                                            reportData.summary.consistencyScore >= 80 ? 'Amazing week, keep it up!' : 
                                            reportData.summary.consistencyScore >= 50 ? 'You are doing well!' : 'Lets aim higher next week!'
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="chart-card">
                                <h3>Calories vs Goal</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={reportData.reportData} barGap={-30} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tickFormatter={(val) => val.substring(0, 3)} tick={{fill: '#666', fontSize: 12}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.03)'}} />
                                            
                                            {/* Background Bar (Target) - Clearly Visible Grey */}
                                            <Bar dataKey="target" fill="#adb5bd" radius={[12, 12, 0, 0]} barSize={40} isAnimationActive={false} />
                                            
                                            {/* Foreground Bar (Consumed) - Narrow & Centered */}
                                            <Bar dataKey="consumed" radius={[8, 8, 0, 0]} barSize={20}>
                                                {reportData.reportData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.consumed === 0 ? 'transparent' : (entry.consumed > entry.target ? '#ff4757' : '#45c4b0')} 
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="daily-breakdown">
                                <h3>Weekly Breakdown</h3>
                                <div className="breakdown-list-vertical">
                                    {reportData.reportData.map((day, idx) => (
                                        <div key={idx} className={`breakdown-item-v ${day.status.toLowerCase().replace(' ', '-')}`}>
                                            <div className="day-info">
                                                <span className="day-name">{day.day}</span>
                                                <span className="day-date">{day.date}</span>
                                            </div>
                                            <div className="food-info"><span className="foods-list">{day.foods}</span></div>
                                            <div className="cal-info">
                                                <span className="val">{day.consumed} kcal</span>
                                                <span className="status-tag">{day.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="custom-view fadeIn">
                    <div className="range-selector">
                        <div className="range-inputs">
                            <div className="input-group">
                                <label>From</label>
                                <input 
                                    type="date" 
                                    value={customStart} 
                                    max={new Date().toISOString().split('T')[0]} 
                                    onChange={(e) => setCustomStart(e.target.value)} 
                                />
                            </div>
                            <div className="input-group">
                                <label>To</label>
                                <input 
                                    type="date" 
                                    value={customEnd} 
                                    max={new Date().toISOString().split('T')[0]} 
                                    onChange={(e) => setCustomEnd(e.target.value)} 
                                />
                            </div>
                            <button className="generate-btn" onClick={fetchCustomReport} disabled={loadingCustom}>
                                {loadingCustom ? 'Generating...' : 'Show Progress Report'}
                            </button>
                        </div>
                    </div>

                    {customReport && (
                        <div className="custom-report-content">
                            <div className="custom-report-header">
                                <h3>Report Overview ({new Date(customStart).toLocaleDateString()} - {new Date(customEnd).toLocaleDateString()})</h3>
                                <button className="download-csv-btn" onClick={downloadCSV}>
                                    📥 Export to CSV
                                </button>
                            </div>

                            <div className="custom-summary-row">
                                <div className="stat-card">
                                    <h3>Total Consumption</h3>
                                    <div className="value">{customReport.summary?.totalCals?.toLocaleString() || 0}</div>
                                    <div className="sub">Goal: {customReport.summary?.totalTargets?.calories?.toLocaleString() || 0} kcal</div>
                                </div>
                                <div className="stat-card highlight-card">
                                    <h3>Plan Adherence</h3>
                                    <div className="value">{customReport.summary?.loggedDays > 0 ? Math.round((customReport.summary?.successfulDays / customReport.summary?.loggedDays) * 100) : 0}%</div>
                                    <div className="sub">Goal achieved on {customReport.summary?.successfulDays || 0} days (Out of {customReport.daysInRange || 0} total days)</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Health Status</h3>
                                    <div className={`value status-text ${
                                        (customReport.summary?.successfulDays / (customReport.summary?.loggedDays || 1)) >= 0.8 ? 'excellent' : 
                                        (customReport.summary?.successfulDays / (customReport.summary?.loggedDays || 1)) >= 0.5 ? 'good' : 'warning'
                                    }`}>
                                        {
                                            (customReport.summary?.successfulDays / (customReport.summary?.loggedDays || 1)) >= 0.9 ? 'Excellent!' :
                                            (customReport.summary?.successfulDays / (customReport.summary?.loggedDays || 1)) >= 0.7 ? 'Great Progress' :
                                            (customReport.summary?.successfulDays / (customReport.summary?.loggedDays || 1)) >= 0.5 ? 'Good Start' : 'Need Improvement'
                                        }
                                    </div>
                                    <div className="sub">
                                        {
                                            (customReport.summary?.successfulDays / (customReport.summary?.loggedDays || 1)) >= 0.8 ? 'You are crushing your goals!' : 
                                            (customReport.summary?.successfulDays / (customReport.summary?.loggedDays || 1)) >= 0.5 ? 'You are very close to your goal!' : 'Try to be more consistent!'
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="macro-comparison-card">
                                <h3>Cumulative Macro Targets (Total for Period)</h3>
                                <div className="macro-comparison-grid">
                                    {[
                                        { label: 'Protein', key: 'protein', totalKey: 'totalProtein', color: '#e74c3c' },
                                        { label: 'Carbs', key: 'carbs', totalKey: 'totalCarbs', color: '#f1c40f' },
                                        { label: 'Fats', key: 'fats', totalKey: 'totalFats', color: '#2ecc71' }
                                    ].map(macro => (
                                        <div key={macro.key} className="macro-comp-item">
                                            <div className="macro-comp-header">
                                                <span className="m-name">{macro.label}</span>
                                                <span className="m-status">
                                                    {customReport.summary?.[macro.totalKey] || 0}g / {customReport.summary?.totalTargets?.[macro.key] || 0}g
                                                </span>
                                            </div>
                                            <div className="macro-progress-container">
                                                <div 
                                                    className="macro-progress-fill" 
                                                    style={{ 
                                                        width: `${Math.min(((customReport.summary?.[macro.totalKey] || 0) / (customReport.summary?.totalTargets?.[macro.key] || 1)) * 100, 100)}%`,
                                                        backgroundColor: macro.color
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="macro-percent-text">
                                                {Math.round(((customReport.summary?.[macro.totalKey] || 0) / (customReport.summary?.totalTargets?.[macro.key] || 1)) * 100) || 0}% of cumulative target
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="custom-breakdown-list">
                                <h3>Everything You Consumed</h3>
                                {customReport.logs.length === 0 ? (
                                    <div className="no-report-data">
                                        <p>No food logs found for this period.</p>
                                        <button className="add-now-btn" onClick={() => setActiveTab('daily')}>Go to Daily Diary</button>
                                    </div>
                                ) : (
                                    customReport.logs.map((dayLog, dayIdx) => (
                                        <div key={dayIdx} className="custom-day-card">
                                            <div className="day-card-header">
                                                <h4>{new Date(dayLog.date).toDateString()}</h4>
                                                <div className="day-total-cals">{dayLog.consumedCalories} kcal</div>
                                            </div>
                                            <div className="day-meals-grid">
                                                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mType => {
                                                    const mLogs = dayLog.logs.filter(l => l.mealType === mType);
                                                    if (mLogs.length === 0) return null;
                                                    return (
                                                        <div key={mType} className="m-group">
                                                            <span className="m-label">{mType}</span>
                                                            <div className="m-items">
                                                                {mLogs.map((l, i) => (
                                                                    <div key={i} className="m-item">
                                                                        <div className="m-item-main">
                                                                            <span className="name">{l.name}</span>
                                                                            <span className="cals">{l.calories} kcal</span>
                                                                        </div>
                                                                        <div className="m-item-macros">
                                                                            {l.protein}g P | {l.carbs}g C | {l.fats}g F
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Diary;
