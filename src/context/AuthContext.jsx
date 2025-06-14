import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("chat_room_token");
      const user = localStorage.getItem("chat_room_user");
      if (!token || !user || !JSON.parse(user).name) {
        setIsLogin(false);
        setIsLoading(false);
        return;
      }
      setIsLogin(true);
    } catch {
      setIsLogin(false);
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLogin, setIsLogin, isLoading, setIsLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
