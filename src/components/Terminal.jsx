import { useParams } from "react-router-dom";
import "../assets/css/terminal.css";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { authFetch } from "./utils/authFetch";
export default function Terminal() {
  const roomId = useParams("roomid");
  const roomid = roomId?.roomid;
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const socket = io(apiURL);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      socket.emit("join_room", roomid);
      socket.on("new_message", (data) => {
        console.log(data);
        console.log(JSON.parse(localStorage.chat_room_user)?.email);
        if (
          data.user?.email != JSON.parse(localStorage.chat_room_user)?.email
        ) {
          const msg = {
            type: "receive",
            time: data.time,
            message: data.message,
            user_logo: data.user.avatar,
          };
          setMessages((prev) => [...prev, msg]);
        }
      });
    });
  }, []);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const response = await authFetch("/api/chat/send", "POST", {
      roomId: roomId.roomid,
      message: inputMessage,
    });
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
