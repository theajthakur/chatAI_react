import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import { notyf } from "./utils/notyf";
import { authFetch } from "./utils/authFetch";
import { useAuth } from "../context/AuthContext";

export default function JoinRoom() {
  const { setIsLogin, setIsLoading, redirect, setRedirect } = useAuth();
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [joinMode, setJoinMode] = useState(false);
  const [roomExist, setRoomExist] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [showRoomName, setShowRoomName] = useState(false);
  const hasCheckedRoom = useRef(false);

  useEffect(() => {
    const data = localStorage.getItem("chat_room_user");
    if (data) {
      try {
        setUser(JSON.parse(data));
        if (redirect) {
          navigate(`/chat/${redirect}`);
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (hasCheckedRoom.current) return;
    hasCheckedRoom.current = true;

    setIsLoading(true);
    authFetch("/api/chat/create/room", "GET")
      .then((response) => {
        if (response.code === "error") {
          notyf.error(response.message);
        } else if (response.code === "roomExist") {
          setRoomExist(response.roomId);
        }
      })
      .catch(() => {
        notyf.error("Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
    setIsLoading(false);
  }, []);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center text-center vh-100 bg-dark text-white">
        <div>
          <i className="bi bi-person-circle display-4 mb-3"></i>
          <p className="lead">No user found. Please log in first.</p>
        </div>
      </div>
    );
  }

  const handleNewRoomGeneration = async () => {
    const response = await authFetch("/api/chat/create/room", "POST", {
      roomName,
    });
    notyf[response.status](response.message);
    const code = response.code;
    if (code == "created") {
      navigate(`/chat/${response.roomId}`);
    } else if (code == "roomExist") {
      alert("Room already exist!");
    }
  };
  const handleRoomJoin = async () => {
    if (!roomId) return notyf.error("Please enter a valid ID!");
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
      <div
        className="card bg-secondary text-white"
        style={{ minWidth: "350px" }}
      >
        <div className="header p-2 bg-light">
          <div className="d-flex gap-2">
            <div>
              <Link to={"/"} className="btn btn-primary">
                <i className="bi bi-house"></i> Home
              </Link>
            </div>
            <div className="ms-auto">
              <button
                className="btn btn-danger"
                onClick={() => {
                  localStorage.removeItem("chat_room_token");
                  localStorage.removeItem("chat_room_user");
                  setIsLogin(false);
                }}
              >
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 body">
          <div className="text-center mb-4">
            <img
              src={`${apiURL}/get-google-img?url=${user.avatar}`}
              alt="avatar"
              className="rounded-circle mb-2"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
            <h5 className="mb-0">{user.name}</h5>
            <small className="text-light">{user.email}</small>
          </div>

          {joinMode ? (
            <div className="join-room-section">
              <div className="mb-3">
                <label className="form-label">Room ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
              </div>

              {roomId && (
                <button
                  className="btn btn-primary w-100"
                  onClick={handleRoomJoin}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>Join Room
                </button>
              )}
            </div>
          ) : (
            <div className="user-choise">
              <div className="row">
                <div className="col-sm-12 my-2">
                  <button
                    className="w-100 btn btn-outline-light"
                    onClick={() => {
                      setJoinMode(true);
                    }}
                  >
                    Join Room
                  </button>
                </div>
                <div className="col-sm-12 my-2">
                  {roomExist ? (
                    <div className="row">
                      <div className="col-sm-6">
                        <button
                          className="w-100 btn btn-success"
                          onClick={() => {
                            navigate(`/chat/${roomExist}`);
                          }}
                        >
                          Join
                        </button>
                      </div>
                      <div className="col-sm-6">
                        <button
                          className="w-100 btn btn-danger"
                          onClick={async () => {
                            const response = await authFetch(
                              "/api/chat/room/delete",
                              "POST",
                              { roomId: roomExist }
                            );
                            notyf[response.status](response.message);
                            if (response.status == "success")
                              setRoomExist(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex gap-1">
                      {showRoomName && (
                        <input
                          type="text"
                          placeholder="Enter Room Name"
                          className="form-control"
                          value={roomName}
                          onInput={(e) => {
                            setRoomName(e.target.value);
                          }}
                        />
                      )}
                      <button
                        className={`btn btn-success ${
                          showRoomName ? "" : "w-100"
                        }`}
                        onClick={() => {
                          if (showRoomName) {
                            handleNewRoomGeneration();
                          } else {
                            setShowRoomName(true);
                          }
                        }}
                      >
                        {!showRoomName ? "Create New Room" : "Create"}
                      </button>
                      {showRoomName && (
                        <button
                          className="btn btn-danger"
                          onClick={() => {
                            setShowRoomName(false);
                          }}
                        >
                          <span className="bi bi-x"></span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
