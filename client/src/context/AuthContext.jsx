import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("shopez_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("shopez_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("shopez_user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("shopez_token");
        localStorage.removeItem("shopez_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem("shopez_token", data.token);
    localStorage.setItem("shopez_user", JSON.stringify(data));
    setUser(data);
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    persistSession(res.data);
    return res.data;
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    persistSession(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("shopez_token");
    localStorage.removeItem("shopez_user");
    setUser(null);
    toast.success("You've been signed out");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
