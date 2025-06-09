import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";

export default function JoinRoom({ setIsLogin }) {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [askPassword, setAskPassword] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("chat_room_user");
    if (data) {
      try {
        setUser(JSON.parse(data));
      } catch {
        setUser(null);
      }
    }
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

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
      <div
        className="card bg-secondary text-white"
        style={{ minWidth: "350px" }}
      >
        <div className="header p-2 bg-light">
          <div className="d-flex gap-2">
            <div>
              <Link to={"/"} class="btn btn-primary">
                <i class="bi bi-house"></i> Home
              </Link>
            </div>
            <div className="ms-auto">
              <button
                class="btn btn-danger"
                onClick={() => {
                  localStorage.removeItem("chat_room_token");
                  localStorage.removeItem("chat_room_user");
                  setIsLogin(false);
                }}
              >
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 body">
          <div className="text-center mb-4">
            <img
              src={user.avatar}
              alt="avatar"
              className="rounded-circle mb-2"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
            <h5 className="mb-0">{user.name}</h5>
            <small className="text-light">{user.email}</small>
          </div>

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

          {askPassword && (
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter Room Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="togglePassword"
              checked={askPassword}
              onChange={() => setAskPassword(!askPassword)}
            />
            <label className="form-check-label" htmlFor="togglePassword">
              Room requires password
            </label>
          </div>
          {roomId && (
            <button className="btn btn-primary w-100">
              <i className="bi bi-box-arrow-in-right me-2"></i>Join Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
