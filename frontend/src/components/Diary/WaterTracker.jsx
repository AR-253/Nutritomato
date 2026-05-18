import React from 'react';
import './DiaryComponents.css';

const WaterTracker = ({ glasses, onAdd, onRemove }) => {
    const maxGlasses = 12;
    const glassIcons = Array.from({ length: maxGlasses }, (_, i) => i < glasses);

    return (
        <div className="water-tracker-card">
            <div className="water-header">
                <h3>💧 Water Intake</h3>
                <span className="water-count">{glasses} / {maxGlasses} Glasses</span>
            </div>
            <div className="glasses-grid">
                {glassIcons.map((isFull, index) => (
                    <div 
                        key={index} 
                        className={`glass-icon ${isFull ? 'full' : 'empty'}`}
                        onClick={() => index < glasses ? onRemove() : onAdd()}
                    >
                        {isFull ? '💧' : '⚪'}
                    </div>
                ))}
            </div>
            <div className="water-actions">
                <button onClick={onRemove} className="water-btn minus">-</button>
                <button onClick={onAdd} className="water-btn plus">+</button>
            </div>
            <p className="water-advice">
                {glasses < 8 ? "Keep drinking! Aim for 8 glasses." : "Great hydration! You're on track."}
            </p>
        </div>
    );
};

export default WaterTracker;
