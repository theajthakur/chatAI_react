import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "animate.css";

import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Terminal from "./components/Terminal";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Auth from "./components/Auth";
import JoinRoom from "./components/JoinRoom";

function App() {
  const [isLogin, setIsLogin] = useState(null);
  useEffect(() => {
    try {
      const token = localStorage.getItem("chat_room_token");
      const user = localStorage.getItem("chat_room_user");
      if (!token || !user || !JSON.parse(user).name) {
        setIsLogin(false);
        return;
      }
      setIsLogin(true);
    } catch (error) {
      setIsLogin(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/chat"
          element={
            isLogin ? (
              <JoinRoom setIsLogin={setIsLogin} />
            ) : (
              <Auth setIsLogin={setIsLogin} />
            )
          }
        />
        <Route path="/chat/:roomid" element={<Terminal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
