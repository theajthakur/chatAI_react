import { useParams } from "react-router-dom";
import "../assets/css/terminal.css";
import { notyf } from "./utils/notyf";
import { useState } from "react";
export default function Terminal() {
  const roomId = useParams("roomid");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      user_logo: "https://picsum.photos/50/50?random=1",
      message: "Hey, how are you?",
      time: "10:15 AM",
      type: "send",
    },
    {
      user_logo: "https://picsum.photos/50/50?random=2",
      message: "I'm good! You?",
      time: "10:16 AM",
      type: "receive",
    },
    {
      user_logo: "https://picsum.photos/50/50?random=1",
      message: "Doing well, thanks!",
      time: "10:17 AM",
      type: "send",
    },
    {
      user_logo: "https://picsum.photos/50/50?random=2",
      message: "Great to hear!",
      time: "10:18 AM",
      type: "receive",
    },
  ]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;
    let date = new Date().toLocaleTimeString();
    const msg = {
      type: "send",
      time: date,
      message: inputMessage,
      user_logo: "https://picsum.photos/50/50?random=1",
    };
    setMessages((prev) => [...prev, msg]);
    setInputMessage("");
  };

  return (
    <div className="terminal-container">
      <div className="terminal">
        <div className="header">
          <div className="logo"></div>
          <div className="title">Hire Meeting</div>
          <div className="navigation">
            <span className="bi bi-x"></span>
            <span className="bi bi-trash"></span>
          </div>
        </div>
        <div className="body">
          <div className="chat-interface">
            {messages.map((message, key) => (
              <div className="chat-unit" key={key}>
                <div className={`chat chat-${message.type}`}>
                  <div className="user-logo">
                    <img
                      alt="User Avatar"
                      src={
                        message.type == "send"
                          ? JSON.parse(localStorage.getItem("chat_room_user"))
                              ?.avatar || message.user_logo
                          : message.user_logo
                      }
                    />
                  </div>
                  <div className="user-message">{message.message}</div>
                  <div className="user-time">{message.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="footer">
          <div className="message-input">
            <input
              className="chat-input"
              placeholder="Message.........."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            {inputMessage && (
              <button className="chat-send" onClick={handleSendMessage}>
                <span>
                  <span>
                    <span>{">"}</span>
                    {">"}
                  </span>
                  {">"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
