import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/conversation.css";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { authFetch } from "./utils/authFetch";
import { notyf } from "./utils/notyf";
import { QRCodeCanvas } from "qrcode.react";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../context/AuthContext";

export default function Conversation() {
  const { isLogin, isLoading, redirect, setRedirect } = useAuth();
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
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);

  let userRef = useRef({});

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("chat_room_user"));
      if (!data?.name || !data?.email || !data.avatar) {
        notyf.error("Please login ");
        setRedirect(roomid);
        return navigate("/chat");
      }
      userRef.current = data;
    } catch (error) {
      console.log(error);
    }

    if (!isLogin && !isLoading) {
      notyf.error("Please login first!");
      setRedirect(roomid);
      navigate("/chat");
      return;
    }

    authFetch(`/api/chat/room/detail`, "POST", { roomId: roomid }).then(
      (response) => {
        if (response.status == "error") {
          notyf.error(response.message);
          setRedirect(roomid);
          setRedirect("");
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
      socketRef.current.emit("join_room", {
        roomId: roomid,
        user: userRef.current,
      });
      socketRef.current.emit("register_user", {
        user: userRef.current,
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected to socket server:", socketRef.current.id);
    });

    const handleNewMessage = (data) => {
      if (data.user?.email !== userRef.current.email) {
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
    };

    const handleNewJoin = (data) => {
      if (data.email === userRef.current.email) return;
      setMessages((prev) => [...prev, { type: "user_join", user: data }]);
    };

    const handleSocketExit = (data) => {
      if (data.email === userRef.current.email) return;
      setMessages((prev) => [
        ...prev,
        { type: "user_disconnected", user: data },
      ]);
    };

    socketRef.current.on("new_message", handleNewMessage);
    socketRef.current.on("user_connected", handleNewJoin);
    socketRef.current.on("user_disconnected", handleSocketExit);
    return () => {
      socketRef.current.off("new_message", handleNewMessage);
      socketRef.current.disconnect();
    };
  }, [apiURL, roomid]);

  useEffect(() => {
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
      window.visualViewport?.removeEventListener("resize", updateHeight);
      document.removeEventListener("focusin", inputFocused);
      document.removeEventListener("focusout", inputBlurred);
    };
  });
  const handleSendMessage = async (e) => {
    textareaRef.current.focus();
    if (e) e.preventDefault();
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
      user_logo: userRef.current.avatar,
    };

    setMessages((prev) => [...prev, msg]);
    setAiChats((prev) => [
      ...prev,
      { name: userRef.current.name, message: inputMessage },
    ]);
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
                  if (aiChats.length < 2)
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
              <img src={roomData?.user?.avatar} width={"100%"} />
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
                  setRedirect("");
                  socketRef.current.disconnect();
                  navigate("/chat");
                }}
              >
                <span className="bi bi-arrow-left"></span>
              </button>
            </div>
          </div>
          <div className="body px-2 py-3">
            <div className="chat-interface">
              {messages.map((message, key) => {
                if (message.type == "user_join") {
                  return (
                    <div className="chat-unit" key={key}>
                      <div className="announcement">
                        <div className="d-flex gap-2 align-items-center justify-content-center">
                          <div>
                            <img
                              src={message.user.avatar}
                              alt="user icon"
                              width={20}
                              style={{ borderRadius: "50%" }}
                            />
                          </div>
                          <p className="m-0 small text-secondary">
                            {message.user.name} Joined the Chat!
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else if (message.type == "user_disconnected") {
                  return (
                    <div className="chat-unit" key={key}>
                      <div className="announcement">
                        <div className="d-flex gap-2 align-items-center justify-content-center">
                          <div>
                            <img
                              src={message.user.avatar}
                              alt="user icon"
                              width={20}
                              style={{ borderRadius: "50%" }}
                            />
                          </div>
                          <p className="m-0 small text-danger">
                            {message.user.name} left the Chat!
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="chat-unit" key={key}>
                      <div className={`chat chat-${message.type}`}>
                        <div className="user-logo">
                          <img
                            alt="User Avatar"
                            src={
                              message.type === "send"
                                ? userRef.current.avatar || message.user_logo
                                : message.user_logo
                            }
                          />
                        </div>
                        <div className="user-message">{message.message}</div>
                        <div className="user-time">{message.time}</div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            <div
              className={`room-details ${
                roomDetailVisibility ? "" : "d-none d-md-block"
              }`}
            >
              <div className="inner">
                <div className="text-center">
                  <img
                    src={roomData?.user?.avatar}
                    alt="Room Logo"
                    style={{ borderRadius: "50%" }}
                  />
                  <h3 className="mt-4">{roomData?.name}</h3>
                  <p className="m-0">
                    <b>{roomData?.user?.name}</b>
                  </p>
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
            {showEmoji && (
              <div className="emoji-container card px-3 bg-white">
                <button
                  className="btn"
                  onClick={() => {
                    setShowEmoji(false);
                  }}
                >
                  <span className="bi bi-x"></span>
                  <span className="ms-2">Hide</span>
                </button>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setInputMessage((prev) => prev + emojiData.emoji);
                  }}
                />
              </div>
            )}

            <div className="message-input">
              {!showEmoji && (
                <button
                  className="btn"
                  style={{ marginBottom: "auto" }}
                  onClick={() => {
                    setShowEmoji(true);
                  }}
                >
                  <span className="bi bi-emoji-smile"></span>
                </button>
              )}
              <textarea
                ref={textareaRef}
                className="chat-input"
                rows="2"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
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
