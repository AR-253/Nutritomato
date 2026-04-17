import React, { useContext, useState, useEffect } from 'react';
import './DietPlanner.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const DietPlanner = () => {
    const { url, token } = useContext(StoreContext);
    const [userInfo, setUserInfo] = useState({
        age: '',
        gender: 'Male',
        weight: '',
        height: '',
        activity: 'Sedentary',
        goal: 'Maintain'
    });
    const [plan, setPlan] = useState(null);
    const [bmi, setBmi] = useState(null);
    const [animatedRotation, setAnimatedRotation] = useState(-90); // Needle start position

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setUserInfo({ ...userInfo, [name]: value });
    };

    const calculateDiet = async (e) => {
        if (e) e.preventDefault();
        
        // Calories Logic
        let bmr;
        if (userInfo.gender === 'Male') {
            bmr = 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age + 5;
        } else {
            bmr = 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age - 161;
        }

        let tdee;
        switch (userInfo.activity) {
            case 'Sedentary': tdee = bmr * 1.2; break;
            case 'Light': tdee = bmr * 1.375; break;
            case 'Moderate': tdee = bmr * 1.55; break;
            case 'Active': tdee = bmr * 1.725; break;
            default: tdee = bmr * 1.2;
        }

        let targetCalories = tdee;
        if (userInfo.goal === 'Lose') targetCalories -= 500;
        if (userInfo.goal === 'Gain') targetCalories += 500;

        const newPlan = {
            calories: Math.round(targetCalories),
            protein: Math.round((targetCalories * 0.3) / 4),
            carbs: Math.round((targetCalories * 0.4) / 4),
            fats: Math.round((targetCalories * 0.3) / 9)
        };

        // BMI Logic
        const heightInMeters = userInfo.height / 100;
        const bmiValue = (userInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
        let bmiStatus = "";
        if (bmiValue < 18.5) bmiStatus = "Underweight";
        else if (bmiValue < 25) bmiStatus = "Normal";
        else if (bmiValue < 30) bmiStatus = "Overweight";
        else if (bmiValue < 35) bmiStatus = "Obese";
        else bmiStatus = "Extremely Obese";

        setBmi({ value: bmiValue, status: bmiStatus });
        setPlan(newPlan);

        if (token) {
            try {
                await axios.post(url + "/api/diet/save", { userInfo, plan: newPlan }, { headers: { token } });
            } catch (error) {
                console.error("[DietPlanner] Error saving:", error);
            }
        }
    };

    useEffect(() => {
        if (token) {
            const fetchPlan = async () => {
                try {
                    const response = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
                    if (response.data.success) {
                        const savedData = response.data.data;
                        setUserInfo(savedData.userInfo);
                        setPlan(savedData.plan);
                        
                        // Recalculate BMI display
                        const u = savedData.userInfo;
                        const hM = u.height / 100;
                        const bV = (u.weight / (hM * hM)).toFixed(1);
                        let bS = "";
                        if (bV < 18.5) bS = "Underweight";
                        else if (bV < 25) bS = "Normal";
                        else if (bV < 30) bS = "Overweight";
                        else if (bV < 35) bS = "Obese";
                        else bS = "Extremely Obese";
                        setBmi({ value: bV, status: bS });
                    }
                } catch (error) {
                    console.error("[DietPlanner] Fetch Error:", error);
                }
            }
            fetchPlan();
        }
    }, [token, url]);

    // Handle Needle Animation Sweep
    useEffect(() => {
        if (bmi) {
            const val = parseFloat(bmi.value);
            const percent = Math.min(Math.max((val - 15) / (40 - 15), 0), 1);
            const targetRotation = percent * 180 - 90;
            
            // Short delay to ensure transition triggers after render
            const timer = setTimeout(() => {
                setAnimatedRotation(targetRotation);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setAnimatedRotation(-90);
        }
    }, [bmi]);

    return (
        <div className='diet-planner-page'>
            <div className="planner-header">
                <h2>Health & Diet Dashboard</h2>
                <p>Personalized nutrition based on your body metrics</p>
            </div>

            <div className='planner-container'>
                {/* Left Side: Input Form */}
                <div className="setup-box">
                    <h3>Body Configuration</h3>
                    <form onSubmit={calculateDiet} className="setup-form">
                        <div className="input-grid">
                            <div className="input-group">
                                <label>Age</label>
                                <input type="number" name="age" value={userInfo.age} onChange={onChangeHandler} placeholder="e.g. 25" required />
                            </div>
                            <div className="input-group">
                                <label>Gender</label>
                                <select name="gender" value={userInfo.gender} onChange={onChangeHandler}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Weight (kg)</label>
                                <input type="number" name="weight" value={userInfo.weight} onChange={onChangeHandler} placeholder="e.g. 70" required />
                            </div>
                            <div className="input-group">
                                <label>Height (cm)</label>
                                <input type="number" name="height" value={userInfo.height} onChange={onChangeHandler} placeholder="e.g. 175" required />
                            </div>
                            <div className="input-group full">
                                <label>Activity Level</label>
                                <select name="activity" value={userInfo.activity} onChange={onChangeHandler}>
                                    <option value="Sedentary">Sedentary (Office job, little exercise)</option>
                                    <option value="Light">Light (1-2 days/week)</option>
                                    <option value="Moderate">Moderate (3-5 days/week)</option>
                                    <option value="Active">Active (Daily intense exercise)</option>
                                </select>
                            </div>
                            <div className="input-group full">
                                <label>Fitness Goal</label>
                                <select name="goal" value={userInfo.goal} onChange={onChangeHandler}>
                                    <option value="Lose">Weight Loss</option>
                                    <option value="Maintain">Maintain Weight</option>
                                    <option value="Gain">Muscle Gain</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="calc-btn">Update My Plan</button>
                    </form>
                </div>

                {/* Right Side: Results Display */}
                <div className="result-box">
                    {!plan ? (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <p>Fill in your details to see your status and diet plan</p>
                        </div>
                    ) : (
                        <div className="result-content">
                            {/* BMI Gauge Section */}
                            <div className="bmi-gauge-section">
                                <div className="gauge-wrapper">
                                    <svg viewBox="0 0 200 110" className="bmi-gauge">
                                        {/* Background Arc */}
                                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#eee" strokeWidth="20" />
                                        
                                        {/* Segments: Blue (Under), Green (Normal), Yellow (Over), Orange (Obese), Red (Extremely) */}
                                        <path d="M 20 100 A 80 80 0 0 1 27.6 65.9" fill="none" stroke="#3498db" strokeWidth="20" />
                                        <path d="M 27.6 65.9 A 80 80 0 0 1 75.3 23.9" fill="none" stroke="#2ecc71" strokeWidth="20" />
                                        <path d="M 75.3 23.9 A 80 80 0 0 1 124.7 23.9" fill="none" stroke="#f1c40f" strokeWidth="20" />
                                        <path d="M 124.7 23.9 A 80 80 0 0 1 164.7 53" fill="none" stroke="#e67e22" strokeWidth="20" />
                                        <path d="M 164.7 53 A 80 80 0 0 1 180 100" fill="none" stroke="#e74c3c" strokeWidth="20" />

                                        {/* Needle */}
                                        <line x1="100" y1="100" x2="100" y2="35" 
                                              stroke="#333" strokeWidth="4" strokeLinecap="round"
                                              style={{ transform: `rotate(${animatedRotation}deg)`, transformOrigin: "100px 100px", transition: "transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} />
                                        <circle cx="100" cy="100" r="6" fill="#333" />
                                    </svg>
                                    <div className="bmi-value-display">
                                        <span className="bmi-label">Your BMI</span>
                                        <span className="bmi-number">{bmi.value}</span>
                                        <span className={`bmi-status ${bmi.status.toLowerCase().replace(' ', '-')}`}>{bmi.status}</span>
                                    </div>
                                </div>
                                <div className="gauge-labels">
                                    <span>Under</span>
                                    <span>Normal</span>
                                    <span>Over</span>
                                    <span>Obese</span>
                                </div>
                            </div>

                            {/* Macro Cards Section */}
                            <div className="macro-dashboard">
                                <h3>Target Daily Intake</h3>
                                <div className="macro-cards">
                                    <div className="macro-card calories">
                                        <span className="card-label">Calories</span>
                                        <span className="card-value">{plan.calories}</span>
                                        <span className="card-unit">kcal</span>
                                    </div>
                                    <div className="macro-card protein">
                                        <span className="card-label">Protein</span>
                                        <span className="card-value">{plan.protein}</span>
                                        <span className="card-unit">grams</span>
                                    </div>
                                    <div className="macro-card carbs">
                                        <span className="card-label">Carbs</span>
                                        <span className="card-value">{plan.carbs}</span>
                                        <span className="card-unit">grams</span>
                                    </div>
                                    <div className="macro-card fats">
                                        <span className="card-label">Fats</span>
                                        <span className="card-value">{plan.fats}</span>
                                        <span className="card-unit">grams</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DietPlanner;
