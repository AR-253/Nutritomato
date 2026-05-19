import React, { useContext, useState, useEffect } from 'react';
import './DietPlanner.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const DietPlanner = () => {
    const { url, token, setGoal } = useContext(StoreContext);
    const [userInfo, setUserInfo] = useState({
        age: '',
        gender: 'Male',
        weight: '',
        height: '',
        activity: 'Sedentary',
        goal: 'Maintain'
    });
    const [plan, setPlan] = useState(null);
    const [calculatedOptions, setCalculatedOptions] = useState(null);
    const [mealPlanData, setMealPlanData] = useState(null);
    const [loadingMeals, setLoadingMeals] = useState(false);
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
    const loadingMessages = [
        "Analyzing macros...",
        "Searching recipes...",
        "Balancing nutrition...",
        "Finalizing plan..."
    ];
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

        // Generate Options based on Goal
        let options = [];
        const baseTdee = Math.round(tdee);

        if (userInfo.goal === 'Lose') {
            options = [
                { title: "Maintain weight", subtitle: "", calories: baseTdee, percent: "100%" },
                { title: "Mild weight loss", subtitle: "0.5 lb/week", calories: baseTdee - 250, percent: "90%" },
                { title: "Weight loss", subtitle: "1 lb/week", calories: baseTdee - 500, percent: "80%" },
                { title: "Extreme weight loss", subtitle: "2 lb/week", calories: baseTdee - 1000, percent: "61%" }
            ];
        } else if (userInfo.goal === 'Gain') {
            options = [
                { title: "Maintain weight", subtitle: "", calories: baseTdee, percent: "100%" },
                { title: "Mild weight gain", subtitle: "0.5 lb/week", calories: baseTdee + 250, percent: "110%" },
                { title: "Weight gain", subtitle: "1 lb/week", calories: baseTdee + 500, percent: "120%" },
                { title: "Fast weight gain", subtitle: "2 lb/week", calories: baseTdee + 1000, percent: "139%" }
            ];
        } else {
            options = [
                { title: "Maintain weight", subtitle: "Current TDEE", calories: baseTdee, percent: "100%" }
            ];
        }

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
        setCalculatedOptions(options);
        setPlan(null); // Clear active plan to show options
    };

    const handleOptionSelect = async (opt) => {
        const newPlan = {
            title: opt.title,
            calories: opt.calories,
            protein: Math.round((opt.calories * 0.3) / 4),
            carbs: Math.round((opt.calories * 0.4) / 4),
            fats: Math.round((opt.calories * 0.3) / 9)
        };

        setPlan(newPlan);
        setCalculatedOptions(null);
        setMealPlanData(null); // Clear old meal plan

        if (token) {
            try {
                await axios.post(url + "/api/diet/save", { userInfo, plan: newPlan, mealPlan: [] }, { headers: { token } });
                setGoal(userInfo.goal); // Update global context goal
                // Invalidate caches to force a fresh fetch
                window.__dashboardCache = null;
                window.__plannerCache = null;
            } catch (error) {
                console.error("[DietPlanner] Error saving:", error);
            }
        }
    };

    const generateMealPlan = async () => {
        if (!plan) return;
        setLoadingMeals(true);
        try {
            const formData = new FormData();
            formData.append("prompt", `Generate a 1-day meal plan for exactly ${plan.calories} kcal (${plan.protein}g protein, ${plan.carbs}g carbs, ${plan.fats}g fats). Distribute across Breakfast, Lunch, Dinner, and Snacks.
CRITICAL INSTRUCTION: The 'food' field for each meal MUST explicitly list the exact weight in grams for EVERY single ingredient. 
BAD EXAMPLE: "Grilled Chicken with Brown Rice"
GOOD EXAMPLE: "150g Grilled Chicken + 200g Brown Rice + 100g Broccoli"
If you fail to include the gram amounts in the 'food' string, the system will crash.
Ensure strictly JSON output with the 'mealPlan' array. (Request ID: ${Date.now()})`);
            
            const response = await axios.post(`${url}/api/ai/chat`, formData);
            if (response.data.success && response.data.mealPlan && response.data.mealPlan.length > 0) {
                setMealPlanData(response.data.mealPlan);
                // Save it to backend
                if (token) {
                    await axios.post(url + "/api/diet/save", { userInfo, plan, mealPlan: response.data.mealPlan }, { headers: { token } });
                    // Invalidate caches since we saved new data
                    window.__dashboardCache = null;
                    window.__plannerCache = null;
                }
            } else {
                const errorMsg = response.data.error ? `${response.data.message} (${response.data.error})` : response.data.message;
                alert(errorMsg || "Could not generate plan. Please try again.");
            }
        } catch (error) {
            console.error("Error generating meal plan:", error);
            alert(`Error connecting to AI service: ${error.message}`);
        } finally {
            setLoadingMeals(false);
        }
    };

    useEffect(() => {
        let interval;
        if (loadingMeals) {
            interval = setInterval(() => {
                setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
            }, 1000); // 1 sec updates
        } else {
            setLoadingMsgIdx(0);
        }
        return () => clearInterval(interval);
    }, [loadingMeals]);

    // Auto-scroll logic when coming from AI Assistant
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('scrollTo') === 'meal-plan') {
            // Wait slightly for the data to be ready/rendered
            setTimeout(() => {
                const section = document.getElementById('meal-plan-section');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        }
    }, [window.location.search]);

    useEffect(() => {
        if (token) {
            const fetchPlan = async () => {
                try {
                    const now = Date.now();
                    if (window.__plannerCache && (now - window.__plannerCache.time) < 60000) {
                        const savedData = window.__plannerCache.data;
                        setUserInfo(savedData.userInfo);
                        setPlan(savedData.plan);
                        if (savedData.mealPlan && savedData.mealPlan.length > 0) {
                            setMealPlanData(savedData.mealPlan);
                        }
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
                        return;
                    }

                    const response = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
                    if (response.data.success) {
                        const savedData = response.data.data;
                        
                        window.__plannerCache = { time: Date.now(), data: savedData };

                        setUserInfo(savedData.userInfo);
                        setPlan(savedData.plan);
                        if (savedData.mealPlan && savedData.mealPlan.length > 0) {
                            setMealPlanData(savedData.mealPlan);
                        }
                        
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
                        setGoal(savedData.userInfo.goal); // Sync global goal on fetch
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
                    {!plan && !calculatedOptions ? (
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
                                        <span className="bmi-number">{bmi?.value}</span>
                                        <span className={`bmi-status ${bmi?.status ? bmi.status.toLowerCase().replace(' ', '-') : ''}`}>{bmi?.status}</span>
                                    </div>
                                </div>
                                <div className="gauge-labels">
                                    <span>Under</span>
                                    <span>Normal</span>
                                    <span>Over</span>
                                    <span>Obese</span>
                                </div>
                            </div>

                            {/* Options View */}
                            {calculatedOptions && !plan && (
                                <div className="options-dashboard fadeIn">
                                    <h3>Select Your Target Plan</h3>
                                    <div className="options-list">
                                        {calculatedOptions.map((opt, index) => (
                                            <div key={index} className="option-item" onClick={() => handleOptionSelect(opt)}>
                                                <div className="option-left">
                                                    <h4>{opt.title}</h4>
                                                    {opt.subtitle && <p>{opt.subtitle}</p>}
                                                </div>
                                                <div className="option-right">
                                                    <div className="opt-cal-value">{opt.calories}</div>
                                                    <div className="opt-cal-details">
                                                        <span className="opt-cal-label">Calories/day</span>
                                                        <span className="opt-percent">{opt.percent}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Macro Cards Section */}
                            {plan && (
                                <div className="macro-dashboard fadeIn">
                                    <h3>Target Daily Intake</h3>
                                    <div className="macro-cards">
                                        <div className="macro-card calories">
                                            <div className="plan-badge-row">
                                                <span className="card-label">Calories</span>
                                                {plan.title && <span className="selected-plan-badge">{plan.title}</span>}
                                            </div>
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
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* AI Meal Plan Generator Section (Moved to Bottom) */}
            {plan && (
                <div id="meal-plan-section" className="meal-plan-section fadeIn full-width-plan">
                    {!mealPlanData || mealPlanData.length === 0 ? (
                        <div className="meal-plan-prompt">
                            <p>Want a personalized diet plan based on these calories?</p>
                            <button className="generate-plan-btn" onClick={generateMealPlan} disabled={loadingMeals}>
                                {loadingMeals ? `🤖 ${loadingMessages[loadingMsgIdx]}` : "✨ Generate AI Diet Plan"}
                            </button>
                        </div>
                    ) : (
                        <div className="meal-plan-display">
                            <div className="meal-plan-header">
                                <h3>Your Daily Meal Plan</h3>
                                <button className="regen-btn" onClick={generateMealPlan} disabled={loadingMeals}>
                                    {loadingMeals ? `🔄 ${loadingMessages[loadingMsgIdx]}` : "🔄 Regenerate"}
                                </button>
                            </div>
                            <div className="meal-plan-list">
                                {mealPlanData.map((meal, index) => (
                                    <div key={index} className="meal-item-card">
                                        <div className="meal-item-header">
                                            <span className="meal-type-badge">{meal.meal}</span>
                                            <span className="meal-cals">{meal.calories} kcal</span>
                                        </div>
                                        <p className="meal-food">{meal.food}</p>
                                        <div className="meal-item-macros">
                                            <span>P: {meal.protein}g</span>
                                            <span>C: {meal.carbs}g</span>
                                            <span>F: {meal.fats}g</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DietPlanner;
