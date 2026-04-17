import React, { useContext, useEffect, useState } from 'react'
import './LoginPop.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const LoginPop = (props) => {
  const [currState, setCurrState] = useState("Login");
  const [step, setStep] = useState(1); // 1: Login/Basic, 2: Personal, 3: Goals
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "Male",
    weight: "",
    height: "",
    activity: "Sedentary",
    goal: "Maintain"
  });

  const { url, setToken, setShowLogin } = useContext(StoreContext);
  const { setWelcome } = props;

  // Reset step when switching modes
  const switchState = (state) => {
    setCurrState(state);
    setStep(1);
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // If Sign Up and not on last step, just go next (should be handled by button type="button" but being safe)
    if (currState === "Sign Up" && step < 3) return;

    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false);
        // Show Welcome Popup
        if (setWelcome && response.data.name) {
          setWelcome({ show: true, name: response.data.name });
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onSubmitHandler} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState === "Sign Up" ? `Sign Up (Step ${step}/3)` : "Login"}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
        </div>

        <div className="login-popup-inputs">
          {/* LOGIN FORM (Standard) */}
          {currState === "Login" && (
            <>
              <input name="email" type="email" onChange={onChangeHandler} value={data.email} placeholder="Your email" required />
              <input name="password" type="password" onChange={onChangeHandler} value={data.password} placeholder="Your password" required />
            </>
          )}

          {/* SIGN UP - STEP 1: Basic Info */}
          {currState === "Sign Up" && step === 1 && (
            <>
              <input name="name" onChange={onChangeHandler} value={data.name} type="text" placeholder="Your name" required />
              <input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder="Your email" required />
              <input name="password" onChange={onChangeHandler} value={data.password} type="password" placeholder="Create password" required />
            </>
          )}

          {/* SIGN UP - STEP 2: Personal Stats */}
          {currState === "Sign Up" && step === 2 && (
            <>
              <div className="multi-input-row">
                <input name="age" type="number" onChange={onChangeHandler} value={data.age} placeholder="Age" required />
                <select name="gender" onChange={onChangeHandler} value={data.gender}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <input name="weight" type="number" onChange={onChangeHandler} value={data.weight} placeholder="Weight (kg)" required />
              <input name="height" type="number" onChange={onChangeHandler} value={data.height} placeholder="Height (cm)" required />
            </>
          )}

          {/* SIGN UP - STEP 3: Goals */}
          {currState === "Sign Up" && step === 3 && (
            <>
              <select name="activity" onChange={onChangeHandler} value={data.activity}>
                <option value="Sedentary">Sedentary (Little exercise)</option>
                <option value="Light">Light (1-3 days/week)</option>
                <option value="Moderate">Moderate (3-5 days/week)</option>
                <option value="Active">Active (6-7 days/week)</option>
              </select>
              <select name="goal" onChange={onChangeHandler} value={data.goal}>
                <option value="Maintain">Maintain Weight</option>
                <option value="Lose">Lose Weight</option>
                <option value="Gain">Gain Weight</option>
              </select>
            </>
          )}
        </div>

        {/* BUTTONS LOGIC */}
        {currState === "Login" ? (
          <button type="submit">Login</button>
        ) : (
          <div className="wizard-actions">
            {step > 1 && <button type="button" onClick={prevStep} className="prev-btn">Back</button>}

            {step < 3 ? (
              <button type="button" onClick={nextStep}>Next</button>
            ) : (
              <button type="submit">Create Account</button>
            )}
          </div>
        )}

        {/* TERMS & TOGGLE (Only show on Step 1 for Sign Up or Login) */}
        {(currState === "Login" || step === 1) && (
          <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        )}

        {/* SWITCH MODES */}
        {currState === "Login" ? (
          <p>Create a new account? <span onClick={() => switchState("Sign Up")}>Click here</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => switchState("Login")}>Login here</span></p>
        )}
      </form>
    </div>
  );
};

export default LoginPop;
