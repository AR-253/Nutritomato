import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdminAgent.css';

const AdminAgent = ({ url, currentData, onDataUpdate, setIngredients }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your Nutri-Admin Agent. Tell me what dish you are adding and the weight, and I'll fill the entire form for you!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${url}/api/ai/chat`, {
        prompt: `ADMIN AGENT CONTEXT: Current dish Name: "${currentData.name}", Description: "${currentData.description}", Weight: "${currentData.weight}".
        USER REQUEST: ${input}
        
        INSTRUCTION: You are an expert Nutri-Agent. If the user wants to fill or analyze a dish, you MUST return a JSON block at the end of your message.
        JSON format: :::FORM_DATA:::{"name":"...","calories":0,"protein":0,"carbs":0,"fats":0,"weight":"...","ingredients":[{"name":"...","quantity":"...","calories":0}]}:::END_FORM_DATA:::
        
        Explain what you did in text first, then provide the JSON block.`,
        history: JSON.stringify(messages)
      });

      if (response.data.success) {
        let aiText = response.data.message;
        
        // Check for form data in the response
        const formMatch = aiText.match(/:::FORM_DATA:::(.*?):::END_FORM_DATA:::/s);
        if (formMatch) {
          try {
            const formData = JSON.parse(formMatch[1]);
            // Update the form fields
            onDataUpdate({
              name: formData.name || currentData.name,
              calories: formData.calories,
              protein: formData.protein,
              carbs: formData.carbs,
              fats: formData.fats,
              weight: formData.weight || currentData.weight
            });
            // Update the ingredients
            if (formData.ingredients) {
              setIngredients(formData.ingredients);
            }
            aiText = aiText.replace(/:::FORM_DATA:::.*?:::END_FORM_DATA:::/s, "").trim();
            aiText += "\n\n✅ **I've filled the form for you!** Please review the values.";
          } catch (e) {
            console.error("JSON Parse Error in Agent:", e);
          }
        }

        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Service unavailable. Try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`admin-agent-wrapper ${isOpen ? 'active' : ''}`}>
      {!isOpen && (
        <div className="agent-bubble pulse" onClick={() => setIsOpen(true)}>
          <span className="icon">🤖</span>
          <span className="badge">AI Agent</span>
        </div>
      )}

      {isOpen && (
        <div className="agent-window fadeIn">
          <div className="agent-header">
            <div className="agent-title">
              <span className="dot"></span>
              <h4>Nutri-Admin Agent</h4>
            </div>
            <button className="close-agent" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="agent-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="msg-content">{msg.text}</div>
              </div>
            ))}
            {isTyping && <div className="message ai typing">Agent is thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="agent-input">
            <input 
              type="text" 
              placeholder="Ask the agent..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgent;
