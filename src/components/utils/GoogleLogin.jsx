import React, { useEffect } from "react";
import { notyf } from "./notyf";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT;
const apiURL = import.meta.env.VITE_API_URL;

export default function GoogleLogin({ setIsLogin, setIsLoading }) {
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

  async function handleCredentialResponse(response) {
    const idToken = response.credential;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiURL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await res.json();
      notyf.success(data.message);
      localStorage.setItem("chat_room_token", data.signToken);
      localStorage.setItem("chat_room_user", JSON.stringify(data.data));
      setIsLogin(true);
    } catch (error) {
      notyf.error(error.message || "Something went wrong!");
    }
    setIsLoading(false);
  }

  return (
    <div className="d-flex justify-content-center">
      <div id="google-signin-button"></div>
    </div>
  );
}
