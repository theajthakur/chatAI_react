import React, { useEffect } from "react";

const CLIENT_ID = import.meta.env.GOOGLE_CLIENT;

export default function GoogleLogin({ onLoginSuccess }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      /* global google */
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" }
      );
      google.accounts.id.prompt(); // optional One Tap prompt
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function handleCredentialResponse(response) {
    const idToken = response.credential;
    fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("token", data.jwt);
        onLoginSuccess(data.user);
      })
      .catch(() => alert("Google login failed"));
  }

  return <div id="google-signin-button"></div>;
}
