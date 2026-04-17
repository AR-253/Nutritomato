import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import './AIPlanner.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import Webcam from 'react-webcam';

const AIPlanner = () => {
    const { url, token } = useContext(StoreContext);
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your AI Planner. You can chat with me, upload a photo, or use the camera to identify food!" }
    ]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Camera States
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const webcamRef = useRef(null);

    // Manual Log State
    const [showManualLog, setShowManualLog] = useState(false);
    const [manualEntry, setManualEntry] = useState({ name: '', calories: '', protein: '', fats: '', carbs: '' });

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // DataURI to Blob helper
    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            const blob = dataURLtoBlob(imageSrc);
            const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
            setImage(file);
            setIsCameraOpen(false);
        }
    }, [webcamRef]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    // Function to log food
    const logFood = async (name, calories, protein, fats, carbs, type = 'manual') => {
        if (!token) {
            alert("Please login to log calories.");
            return;
        }

        try {
            const response = await axios.post(`${url}/api/diet/log-calories`,
                {
                    userId: token,
                    calories: parseInt(calories),
                    protein: parseInt(protein) || 0,
                    fats: parseInt(fats) || 0,
                    carbs: parseInt(carbs) || 0,
                    foodName: name,
                    type
                },
                { headers: { token } }
            );

            if (response.data.success) {
                alert(`Successfully logged: ${name}`);
                setShowManualLog(false);
                setManualEntry({ name: '', calories: '', protein: '', fats: '', carbs: '' });
            } else {
                alert("Failed to log: " + response.data.message);
            }
        } catch (error) {
            console.error("Logging error:", error);
            alert("Error logging food.");
        }
    };

    const sendMessage = async () => {
        if (!input.trim() && !image) return;

        const userMessage = {
            role: 'user',
            content: input,
            image: image ? URL.createObjectURL(image) : null
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        const currentImage = image;
        setImage(null);
        setLoading(true);

        try {
            if (currentImage) {
                // ✅ USE LOCAL MODEL FOR IMAGES
                console.log("[AIPlanner] Using Local Model for image identification...");
                const formData = new FormData();
                formData.append('image', currentImage);

                const response = await axios.post(`${url}/api/food/predict-nutrition`, formData);

                if (response.data.success) {
                    const data = response.data.data;
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        content: `I've identified this as **${data.Dish_Name}**. This is a popular dish with the following nutritional profile:`,
                        calories: data.Calories,
                        protein: data.Protein,
                        fats: data.Fats,
                        carbs: data.Carbs,
                        foodName: data.Dish_Name
                    }]);
                } else {
                    setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't identify this food using the local model." }]);
                }
            } else {
                // ✅ USE GEMINI FOR TEXT-ONLY CHAT
                const formData = new FormData();
                formData.append("prompt", input);
                const history = messages.map(msg => ({ role: msg.role, content: msg.content }));
                formData.append("history", JSON.stringify(history));

                const response = await axios.post(`${url}/api/ai/chat`, formData);

                if (response.data.success) {
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        content: response.data.message,
                        calories: response.data.calories,
                        protein: response.data.protein,
                        fats: response.data.fats,
                        carbs: response.data.carbs,
                        foodName: "Analyzed Food"
                    }]);
                } else {
                    setMessages(prev => [...prev, { role: 'ai', content: "Error: " + response.data.message }]);
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't connect to the AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className='ai-planner'>
            <div className="ai-planner-container">
                <div className="chat-header">
                    <h2>AI Nutritionist</h2>
                    <p>Powered by Local Pakistani Food Model & Gemini</p>
                </div>

                <div className="chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.role}`}>
                            {msg.image && (
                                <div className="message-image">
                                    <img src={msg.image} alt="Captured food" />
                                </div>
                            )}
                            <div className="message-text">
                                {(typeof msg.content === 'string' ? msg.content : String(msg.content || "")).split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                            {msg.calories && (
                                <div className="calorie-box">
                                    <div className="calorie-header">
                                        <span className="calorie-icon">🔥</span>
                                        <div className="calorie-info">
                                            <span className="calorie-value">{msg.calories}</span>
                                            <span className="calorie-label">Calories</span>
                                        </div>
                                    </div>
                                    <div className="macro-info-row">
                                        <span>🥩 {msg.protein || 0}g</span>
                                        <span>🥑 {msg.fats || 0}g</span>
                                        <span>🍞 {msg.carbs || 0}g</span>
                                    </div>
                                    <button className="quick-log-btn" onClick={() => logFood(msg.foodName, msg.calories, msg.protein, msg.fats, msg.carbs, 'ai')}>
                                        + Add to Log
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="message-bubble ai loading">
                            <div className="loader">Analyzing...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {isCameraOpen && (
                    <div className="webcam-overlay">
                        <div className="webcam-container">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="webcam-view"
                                videoConstraints={{ facingMode: "environment" }}
                            />
                            <div className="webcam-controls">
                                <button onClick={capture} className="capture-btn">📸 Capture</button>
                                <button onClick={() => setIsCameraOpen(false)} className="close-btn">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="input-area">
                    {image && (
                        <div className="image-preview">
                            <img src={URL.createObjectURL(image)} alt="Preview" />
                            <button onClick={() => setImage(null)}>×</button>
                        </div>
                    )}
                    <div className="input-row">
                        <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} hidden />
                        <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Upload Image">📁</button>
                        <button className="camera-btn" onClick={() => setIsCameraOpen(true)} title="Take Photo">📷</button>
                        <button className="manual-log-btn" onClick={() => setShowManualLog(true)} title="Log Manually">📝</button>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask about weight loss or scan food..." rows={1} />
                        <button className="send-btn" onClick={sendMessage} disabled={loading}>Send</button>
                    </div>
                </div>
            </div>

            {showManualLog && (
                <div className="manual-log-overlay">
                    <div className="manual-log-modal">
                        <h3>Log Food Manually</h3>
                        <input type="text" placeholder="Food Name" value={manualEntry.name} onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })} />
                        <input type="number" placeholder="Calories" value={manualEntry.calories} onChange={(e) => setManualEntry({ ...manualEntry, calories: e.target.value })} />
                        <div className="modal-macros-row">
                            <input type="number" placeholder="Protein" value={manualEntry.protein} onChange={(e) => setManualEntry({ ...manualEntry, protein: e.target.value })} />
                            <input type="number" placeholder="Fats" value={manualEntry.fats} onChange={(e) => setManualEntry({ ...manualEntry, fats: e.target.value })} />
                            <input type="number" placeholder="Carbs" value={manualEntry.carbs} onChange={(e) => setManualEntry({ ...manualEntry, carbs: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => logFood(manualEntry.name, manualEntry.calories, manualEntry.protein, manualEntry.fats, manualEntry.carbs)}>Add Log</button>
                            <button onClick={() => setShowManualLog(false)} className="cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIPlanner;
