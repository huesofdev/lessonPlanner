import parseJwt from "@/utils/parseJwt";
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = parseJwt(token); // decode user
      setAuth({ token, isLoggedIn: true, user, loading: false });
      localStorage.setItem("user", JSON.stringify(user)); // optional
    } else {
      setAuth({ token: null, isLoggedIn: false, user: null, loading: false });
    }
  }, []);

  // Login function
  const login = (token) => {
    const user = parseJwt(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, isLoggedIn: true, user, loading: false });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, isLoggedIn: false, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
