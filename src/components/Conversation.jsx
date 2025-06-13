import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/conversation.css";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { authFetch } from "./utils/authFetch";
import { notyf } from "./utils/notyf";
import { QRCodeCanvas } from "qrcode.react";

export default function Conversation({ isLogin, isLoading }) {
  const navigate = useNavigate();
  const { roomid } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const socketRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [aiChats, setAiChats] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [roomDetailVisibility, setRoomDetailVisibility] = useState(false);
  const textareaRef = useRef(null);

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
  const roomIcon = user?.avatar;

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
          textareaRef.current?.focus();
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
            name: data.user.name,
            time: data.time,
            message: data.message,
            user_logo: data.user.avatar,
          };
          setMessages((prev) => [...prev, msg]);
          setAiChats((prev) => [
            ...prev,
            { name: data.user.name, message: data.message },
          ]);
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
    setAiChats((prev) => [...prev, { name: user.name, message: inputMessage }]);
    setInputMessage("");
    textareaRef.current.focus();
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

  function extractJSON(rawString) {
    try {
      const clean = rawString.replace(/```json|```/g, "").trim();

      return JSON.parse(clean);
    } catch (error) {
      console.error("Failed to parse JSON from AI response:", error);
      return null;
    }
  }

  return (
    <div className="conversation-container" style={{ height: viewportHeight }}>
      <div
        className={`sidebar p-3 animate__animated animate__slideInLeft ${
          !sidebarVisible && "d-none d-md-block"
        }`}
        style={{
          background: `linear-gradient(45deg, ${summary?.moodColourCode.join(
            ","
          )})`,
        }}
      >
        <div className="action-bar mb-3 pb-3 border-bottom">
          <button
            className="btn btn-outline-danger mb-3 d-md-none"
            onClick={() => {
              setSidebarVisible(false);
            }}
            title="Go Back"
          >
            <span className="bi bi-arrow-left"></span> Return
          </button>
          {isGeneratingSummary ? (
            <p className="text-center">✨✨✨✨✨</p>
          ) : (
            <div className="summarize-action">
              <p className="text-center lead">AI Summarizer ✨</p>
              <button
                className="btn btn-success w-100"
                onClick={async () => {
                  if (aiChats.length < 10)
                    return notyf.success("More chats required to summarize!");
                  setIsGeneratingSummary(true);
                  try {
                    const response = await authFetch(
                      "/api/chat/room/summarize",
                      "POST",
                      { data: aiChats }
                    );
                    setSummary(extractJSON(response.response));
                    setAiChats([]);
                  } catch (error) {
                    console.log(error);
                  }
                  setIsGeneratingSummary(false);
                }}
              >
                Summarize
              </button>
            </div>
          )}
        </div>
        <div className="summary-container p-3">
          {summary && !isGeneratingSummary && (
            <div className="details">
              <blockquote>
                <b>Mood: </b> {summary.chatMood}
              </blockquote>
              <p className="lead">{summary.summary}</p>
            </div>
          )}
        </div>
      </div>
      <div className="main-body">
        <div className="conversation">
          <div className="header">
            <button
              className="sidebar-controller btn d-md-none"
              onClick={() => {
                setSidebarVisible(true);
              }}
            >
              <span className="bi bi-list"></span>
            </button>
            <div
              className="logo"
              onClick={() => {
                setRoomDetailVisibility((prev) => !prev);
              }}
            >
              <img src={roomIcon} width={"100%"} />
            </div>
            <div
              className="title"
              onClick={() => {
                setRoomDetailVisibility((prev) => !prev);
              }}
            >
              {roomData?.name}
            </div>
            <div className="navigation">
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  navigate("/chat");
                }}
              >
                <span className="bi bi-arrow-left"></span>
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
            <div
              className={`room-details ${
                roomDetailVisibility ? "" : "d-none d-md-block"
              }`}
            >
              <div className="inner">
                <div className="text-center">
                  <img
                    src={roomIcon}
                    alt="Room Logo"
                    style={{ borderRadius: "50%" }}
                  />
                  <h3 className="mt-4">{roomData?.name}</h3>
                  <p className="lead" style={{ fontSize: "0.8rem" }}>
                    <span>{roomData?.email}</span>
                  </p>
                  <div className="qr-container">
                    <QRCodeCanvas
                      value={window.location.href}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                    <p>Scan and Join</p>
                  </div>
                  <button
                    className="btn btn-outline-success w-100 my-2"
                    onClick={() => {
                      copyText(roomid);
                      notyf.success("Code Copied!");
                    }}
                  >
                    <span className="bi bi-share"></span>{" "}
                    <span className="ms-3">Copy Room Code</span>
                  </button>
                  <button
                    className="w-100 btn btn-danger my-2"
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
                    <span className="ms-3">Delete Room</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="footer">
            <div className="message-input">
              <textarea
                ref={textareaRef}
                className="chat-input"
                rows="2"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
              ></textarea>
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
