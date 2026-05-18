import React, { useState } from 'react';
import './AIAssistantFAB.css';
import { useHistory } from 'react-router-dom';

const AIAssistantFAB = () => {
    const [isOpen, setIsOpen] = useState(false);
    const history = useHistory();

    const menuItems = [
        { label: 'AI Meal Planner', path: '/diet-planner?scrollTo=meal-plan', icon: '📅' },
        { label: 'Smart Scanner', path: '/ai-planner', icon: '🔍' },
    ];

    return (
        <div className={`ai-fab-container ${isOpen ? 'open' : ''}`}>
            {isOpen && (
                <div className="ai-fab-menu">
                    {menuItems.map((item, index) => (
                        <div 
                            key={index} 
                            className="ai-fab-menu-item"
                            onClick={() => {
                                history.push(item.path);
                                setIsOpen(false);
                            }}
                        >
                            <span className="item-icon">{item.icon}</span>
                            <span className="item-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
            <button 
                className="ai-fab-button" 
                onClick={() => setIsOpen(!isOpen)}
                title="AI Assistant"
            >
                <div className="ai-icon-wrapper">
                    <div className="ai-pulse"></div>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="white"/>
                        <path d="M12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C15.314 18 18 15.314 18 12C18 8.686 15.314 6 12 6ZM12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16Z" fill="white"/>
                        <path d="M12 10C10.895 10 10 10.895 10 12C10 13.105 10.895 14 12 14C13.105 14 14 13.105 14 12C14 10.895 13.105 10 12 10Z" fill="white"/>
                    </svg>
                </div>
                <span className="fab-text">AI Assistant</span>
            </button>
        </div>
    );
};

export default AIAssistantFAB;
