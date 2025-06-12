import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/conversation.css";
import { io } from "socket.io-client";
import { use, useEffect, useState } from "react";
import { authFetch } from "./utils/authFetch";
import { notyf } from "./utils/notyf";
export default function Conversation({ isLogin, isLoading }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLogin && !isLoading) {
      notyf.error("Please login first!");
      navigate("/chat");
    }
  }, [isLogin, navigate]);
  let firstRendered = false;
  const roomId = useParams("roomid");
  const roomid = roomId?.roomid;
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const socket = io(apiURL);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  let user;
  try {
    const data = JSON.parse(localStorage.getItem("chat_room_user"));
    if (!data?.name || !data?.email || !data.avatar) {
      if (firstRendered) {
        notyf.error("Please login ");
        return navigate("/chat");
      }
      firstRendered = true;
    }
    user = data;
  } catch (error) {
    user = {};
  }
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      socket.emit("join_room", roomid);
      socket.on("new_message", (data) => {
        console.log(data);
        console.log(user);
        if (data.user?.email != user?.email) {
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

    const updateHeight = () => {
      setViewportHeight(window.visualViewport?.height || window.innerHeight);
    };

    const inputFocused = () => {
      setViewportHeight(window.visualViewport?.height || window.innerHeight);
    };

    const inputBlurred = () => {
      setTimeout(() => {
        setViewportHeight(window.innerHeight);
      }, 300); // Delay to wait for keyboard close
    };

    // Use visualViewport if available
    window.visualViewport?.addEventListener("resize", updateHeight);

    // Fallback for keyboard detection
    document.addEventListener("focusin", inputFocused);
    document.addEventListener("focusout", inputBlurred);

    // Initial height set
    updateHeight();

    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      document.removeEventListener("focusin", inputFocused);
      document.removeEventListener("focusout", inputBlurred);
    };
  }, []);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const response = await authFetch("/api/chat/send", "POST", {
      roomId: roomId.roomid,
      message: inputMessage,
    });
    if (inputMessage.trim() === "") return;
    let date = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const msg = {
      type: "send",
      time: date,
      message: inputMessage,
      user_logo: user?.avatar,
    };
    setMessages((prev) => [...prev, msg]);
    setInputMessage("");
  };
  return (
    <div className="conversation-container" style={{ height: viewportHeight }}>
      <div className="sidebar d-none d-md-block"></div>
      <div className="main-body">
        <div className="conversation">
          <div className="header">
            <div className="logo">
              <img src={user?.avatar} width={"100%"} />
            </div>
            <div className="title">Hire Meeting</div>
            <div className="navigation">
              <span className="bi bi-x"></span>
              <span className="bi bi-trash"></span>
            </div>
          </div>
          <div className="body px-2 py-3">
            <div className="chat-interface">
              {messages.map((message, key) => (
                <div className="chat-unit" key={key}>
                  <div className={`chat chat-${message.type}`}>
                    <div className="user-logo">
                      <img
                        alt="User Avatar"
                        src={
                          message.type == "send"
                            ? user?.avatar || message.user_logo
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
    </div>
  );
}
