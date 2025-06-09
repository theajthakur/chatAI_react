import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center bg-dark text-white"
      style={{ minHeight: "100vh" }}
    >
      <i
        className="bi bi-exclamation-triangle-fill text-warning"
        style={{ fontSize: "5rem" }}
      ></i>
      <h1 className="display-4 mt-3">404 - Page Not Found</h1>
      <p className="lead mb-4">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-outline-light">
        <i className="bi bi-house-door me-2"></i>Back to Home
      </Link>
    </div>
  );
}
