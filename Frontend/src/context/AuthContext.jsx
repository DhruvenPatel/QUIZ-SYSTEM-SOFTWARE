import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const STORAGE_KEY = "userInfo";

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.token && parsedUser?.user) {
          setUserInfo(parsedUser);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setUserInfo(null);
        }
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      localStorage.removeItem(STORAGE_KEY);
      setUserInfo(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const login = (data) => {
    if (!data?.token || !data?.user) {
      console.error("Invalid login payload:", data);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUserInfo(data);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserInfo(null);
  };

  const updateUserInfo = (updatedUser) => {
    setUserInfo((prev) => {
      if (!prev) return prev;

      const nextValue = {
        ...prev,
        user: {
          ...prev.user,
          ...updatedUser,
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
      return nextValue;
    });
  };

  const isAuthenticated = Boolean(userInfo?.token && userInfo?.user);
  const userRole = userInfo?.user?.role || null;

  const value = useMemo(
    () => ({
      userInfo,
      setUserInfo,
      login,
      logout,
      updateUserInfo,
      authReady,
      isAuthenticated,
      userRole,
    }),
    [userInfo, authReady, isAuthenticated, userRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);