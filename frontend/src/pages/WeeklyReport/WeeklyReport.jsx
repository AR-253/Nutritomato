import React, { useContext, useEffect, useState } from 'react';
import './WeeklyReport.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
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

const WeeklyReport = () => {
    const { url, token } = useContext(StoreContext);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const fetchReport = async () => {
            if (!token) return;
            try {
                const response = await axios.post(url + "/api/diet/weekly-report", {}, { headers: { token } });
                if (response.data.success) {
                    setReportData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [token, url]);

    if (loading) return <div className="diary-loading">Generating your weekly report...</div>;
    if (!reportData) return <div className="diary-loading">No data found for this week.</div>;

    const { summary, reportData: chartData } = reportData;

    return (
        <div className='weekly-report-page'>
            <div className="report-header">
                <h2>Weekly Progress Report</h2>
                <button className="back-btn" onClick={() => history.goBack()}>← Back</button>
            </div>

            <div className="report-grid">
                {/* Sidebar Summary */}
                <div className="report-summary">
                    <div className="stat-card score-card">
                        <h3>Consistency Score</h3>
                        <div className="value">{summary.consistencyScore}%</div>
                        <div className="sub">{summary.successfulDays} of 7 days on track</div>
                    </div>

                    <div className="stat-card">
                        <h3>Avg. Daily Intake</h3>
                        <div className="value">{summary.averageIntake}</div>
                        <div className="sub">kcal / day</div>
                    </div>

                    <div className="stat-card">
                        <h3>Weekly Total</h3>
                        <div className="value">{summary.totalConsumed}</div>
                        <div className="sub">kcal consumed</div>
                    </div>
                </div>

                {/* Main Chart */}
                <div className="chart-card">
                    <h3>Calories Consumed vs. Goal</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" tickFormatter={(val) => val.substring(0, 3)} />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value, name, props) => {
                                        return [`${value} kcal`, `Consumed (${props.payload.foods})`];
                                    }}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                />
                                <ReferenceLine 
                                    y={summary.targetCalories} 
                                    label={{ position: 'right', value: 'Goal', fill: '#ff6347', fontSize: 12 }} 
                                    stroke="#ff6347" 
                                    strokeDasharray="5 5" 
                                />
                                <Bar dataKey="consumed" radius={[5, 5, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.status === 'On Track' ? '#45c4b0' : (entry.status === 'Over' ? '#ef4444' : (entry.status === 'No Data' ? '#e0e0e0' : '#f1c40f'))} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Breakdown */}
                <div className="daily-breakdown">
                    <h3>What You Ate This Week</h3>
                    <div className="breakdown-list-vertical">
                        {chartData.map((day, idx) => (
                            <div key={idx} className={`breakdown-item-v ${day.status.toLowerCase().replace(' ', '-')}`}>
                                <div className="day-info">
                                    <span className="day-name">{day.day}</span>
                                    <span className="day-date">{day.date}</span>
                                </div>
                                <div className="food-info">
                                    <span className="foods-list">{day.foods}</span>
                                </div>
                                <div className="cal-info">
                                    <span className="val">{day.consumed} kcal</span>
                                    <span className="status-tag">{day.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReport;
