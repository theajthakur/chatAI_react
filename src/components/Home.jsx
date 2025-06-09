import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../assets/css/home.css";

export default function Home() {
  return (
    <div className="home text-white bg-dark">
      <section className="hero d-flex flex-column justify-content-center align-items-center text-center py-5">
        <h1 className="display-4 fw-bold mb-3">
          <i className="bi bi-chat-dots-fill me-2"></i>AI Chat Rooms
        </h1>
        <p className="lead mb-4">
          Create secure, smart chat rooms powered by AI & real-time WebSockets.
        </p>
        <a href="#how-it-works" className="btn btn-primary btn-lg">
          Learn How It Works
        </a>
      </section>

      <section id="how-it-works" className="py-5 bg-secondary text-light">
        <div className="container">
          <h2 className="text-center mb-4">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <i className="bi bi-door-open-fill fs-1 mb-3 text-warning"></i>
              <h5>Create Custom Rooms</h5>
              <p>
                Create private or public chat rooms with optional passwords for
                added security.
              </p>
            </div>
            <div className="col-md-4 text-center">
              <i className="bi bi-google fs-1 mb-3 text-light"></i>
              <h5>Login with Google</h5>
              <p>
                Allow users to join with their Google account — their name is
                shown in chat.
              </p>
            </div>
            <div className="col-md-4 text-center">
              <i className="bi bi-broadcast-pin fs-1 mb-3 text-info"></i>
              <h5>Real-Time Messaging</h5>
              <p>
                Chats are powered by WebSocket for instant message delivery with
                zero lag.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-dark text-white">
        <div className="container">
          <h2 className="text-center mb-4">Features</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-box p-4 border rounded bg-secondary h-100">
                <i className="bi bi-shield-lock-fill fs-2 mb-2 text-warning"></i>
                <h5>Secure Access</h5>
                <p>
                  Rooms can be shared via link. Use passwords or allow only
                  authenticated users.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-box p-4 border rounded bg-secondary h-100">
                <i className="bi bi-trash2-fill fs-2 mb-2 text-light"></i>
                <h5>Temporary Chats</h5>
                <p>
                  Chats aren’t stored permanently. Admins can disband a room
                  anytime.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-box p-4 border rounded bg-secondary h-100">
                <i className="bi bi-cpu-fill fs-2 mb-2 text-info"></i>
                <h5>AI Message Filter</h5>
                <p>
                  AI filters spam, analyzes context, and ensures smart
                  conversation control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-4 bg-secondary text-white-50">
        <p>
          &copy; {new Date().getFullYear()} AI Chat Rooms. Built for seamless,
          secure, real-time communication.
        </p>
      </footer>
    </div>
  );
}
