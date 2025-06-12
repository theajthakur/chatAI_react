import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/conversation.css";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { authFetch } from "./utils/authFetch";
import { notyf } from "./utils/notyf";

export default function Conversation({ isLogin, isLoading }) {
  const navigate = useNavigate();
  const { roomid } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const socketRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  let user;
  try {
    const data = JSON.parse(localStorage.getItem("chat_room_user"));
    if (!data?.name || !data?.email || !data.avatar) {
      notyf.error("Please login ");
      return navigate("/chat");
    }
    user = data;
  } catch (error) {
    user = {};
  }

  useEffect(() => {
    if (!isLogin && !isLoading) {
      notyf.error("Please login first!");
      navigate("/chat");
      return;
    }

    authFetch(`/api/chat/room/detail`, "POST", { roomId: roomid }).then(
      (response) => {
        if (response.status == "error") {
          notyf.error(response.message);
          navigate("/chat");
        } else {
          setRoomData(response.data);
        }
      }
    );
  }, [isLogin, isLoading, navigate, roomid]);

  useEffect(() => {
    socketRef.current = io(apiURL);

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server:", socketRef.current.id);
      socketRef.current.emit("join_room", roomid);

      socketRef.current.on("new_message", (data) => {
        if (data.user?.email !== user?.email) {
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
      }, 300);
    };

    window.visualViewport?.addEventListener("resize", updateHeight);
    document.addEventListener("focusin", inputFocused);
    document.addEventListener("focusout", inputBlurred);
    updateHeight();

    return () => {
      socketRef.current?.disconnect();
      window.visualViewport?.removeEventListener("resize", updateHeight);
      document.removeEventListener("focusin", inputFocused);
      document.removeEventListener("focusout", inputBlurred);
    };
  }, [apiURL, roomid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    const response = await authFetch("/api/chat/send", "POST", {
      roomId: roomid,
      message: inputMessage,
    });

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

  function copyText(data) {
    if (!navigator.clipboard) {
      const textarea = document.createElement("textarea");
      textarea.value = data;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } else {
      navigator.clipboard.writeText(data).catch((err) => {
        console.error("Failed to copy: ", err);
      });
    }
  }

  return (
    <div className="conversation-container" style={{ height: viewportHeight }}>
      <div className="sidebar d-none d-md-block"></div>
      <div className="main-body">
        <div className="conversation">
          <div className="header">
            <div className="logo">
              <img src={user?.avatar} width={"100%"} />
            </div>
            <div className="title">{roomData?.name}</div>
            <div className="navigation">
              <button
                className="btn btn-outline-success"
                onClick={() => {
                  copyText(roomid);
                  notyf.success("Code Copied!");
                }}
              >
                <span className="bi bi-share"></span>
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  const response = await authFetch(
                    "/api/chat/room/delete",
                    "POST",
                    { roomId: roomid }
                  );
                  if (response.status == "success") {
                    notyf.success("Room deleted successfully!");
                    return navigate("/chat");
                  }
                  return notyf[response.status](response.message);
                }}
              >
                <span className="bi bi-trash"></span>
              </button>
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
                          message.type === "send"
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
