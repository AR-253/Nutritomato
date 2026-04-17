import React, { useEffect, useState } from 'react';
import './WelcomePopup.css';
import { assets } from '../../assets/assets';

const WelcomePopup = ({ name, setShow }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Auto-hide after 3 seconds
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => setShow(false), 500); // Wait for fade out animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [setShow]);

    return (
        <div className={`welcome-popup ${visible ? 'show' : 'hide'}`}>
            <div className="welcome-content">
                <span className="wave">👋</span>
                <div className="text-content">
                    <h3>Welcome back,</h3>
                    <h2>{name}</h2>
                </div>
                {/* Optional: Add a subtle confetti or sparkle effect here if assets allow, for now simple elegance */}
            </div>
        </div>
    );
};

export default WelcomePopup;
