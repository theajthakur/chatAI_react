import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Auth from "./components/Auth";
import JoinRoom from "./components/JoinRoom";
import Conversation from "./components/Conversation";
import NotFound from "./components/NotFound";
import Loader from "./components/utils/Loader";
import { useAuth } from "./context/AuthContext";

export default function MainRoutes() {
  const { isLogin, isLoading, setIsLogin, setIsLoading } = useAuth();

  if (isLoading) return <Loader />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={isLogin ? <JoinRoom /> : <Auth />} />
      <Route path="/chat/:roomid" element={<Conversation />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
