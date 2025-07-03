import React, { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const getInitialMessages = () => {
    const saved = localStorage.getItem("chatMessages");
    let messages = saved ? JSON.parse(saved) : [];
    if (!messages.length || messages[0].role !== "bot") {
      messages = [{
        role: "bot",
        text: "Hello! How can I help you today?",
        timestamp: new Date().toLocaleTimeString(),
      }, ...messages];
    }
    return messages;
  };
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Get username from sessionStorage
  const getUserName = () => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.username || "You";
    }
    return "You";
  };

  // Get WebSocket URL from .env
  const getWebSocketUrl = () => {
    let base = import.meta.env.VITE_API_BASE_URL;
    if (!base) return 'ws://localhost:8080/chat';
    base = base.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
    return base.replace(/\/$/, '') + '/chat';
  };

  useEffect(() => {
    ws.current = new WebSocket(getWebSocketUrl());

    ws.current.onmessage = (event) => {
      setIsTyping(false);
      const msg = {
        role: "bot",
        text: event.data,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => {
        const updated = [...prev, msg];
        localStorage.setItem("chatMessages", JSON.stringify(updated));
        return updated;
      });
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      role: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => {
      const updated = [...prev, msg];
      localStorage.setItem("chatMessages", JSON.stringify(updated));
      return updated;
    });
    setIsTyping(true);
    // Send conversation in format: [bot: message, user: message, ...]
    const conversationHistory = [...messages, msg].map(m => `${m.role}: ${m.text}`);
    ws.current.send(JSON.stringify(conversationHistory));
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-fixed-wrapper">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <i className="bi bi-chat-dots-fill"></i>
      </button>

      {isOpen && (
        <div className="chatbot-container open">
          <div className="chatbot-box card shadow">
            <div className="card-header bg-primary text-white fs-4 fw-bold d-flex justify-content-between align-items-center">
              <span>AI Assistant</span>
              <button className="btn btn-sm btn-light chatbot-close" onClick={() => setIsOpen(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="card-body chatbot-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message-row d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div className={`message ${msg.role}`}>
                    {msg.role === 'user' ? (
                      <div className="mb-1">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-circle me-2" style={{ fontSize: '1.2rem', color: '#6c757d' }}></i>
                          <span className="fw-bold me-2">{getUserName()}</span>
                        </div>
                        <div className="timestamp text-muted small ms-4">
                          {msg.timestamp}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-1">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-robot me-2" style={{ fontSize: '1.2rem', color: '#ff66b2' }}></i>
                          <span className="fw-bold me-2">Mandas</span>
                        </div>
                        <div className="timestamp text-muted small ms-4">
                          {msg.timestamp}
                        </div>
                      </div>
                    )}
                    {msg.role === 'bot' ? (
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    ) : (
                      <div>{msg.text}</div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot d-flex align-items-center">
                  <i className="bi bi-robot me-2" style={{ fontSize: '1.2rem', color: '#ff66b2' }}></i>
                  <em>AI is typing...</em>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="card-footer d-flex">
              <textarea
                className="form-control me-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
              />
              <button className="btn btn-success" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
