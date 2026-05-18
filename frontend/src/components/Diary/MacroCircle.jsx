import React from 'react';
import './DiaryComponents.css';

const MacroCircle = ({ percentage, value, label, color, unit = 'g' }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="macro-circle-container">
            <div className="circle-wrapper">
                <svg width="80" height="80" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="transparent"
                        stroke="#f0f0f0"
                        strokeWidth="8"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        style={{ 
                            strokeDashoffset, 
                            transition: 'stroke-dashoffset 0.8s ease-in-out',
                            strokeLinecap: 'round'
                        }}
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="circle-text">
                    <span className="circle-value">{value}</span>
                    <span className="circle-unit">{unit}</span>
                </div>
            </div>
            <span className="circle-label">{label}</span>
        </div>
    );
};

export default MacroCircle;
