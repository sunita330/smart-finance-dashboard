import { createContext, useContext, useState } from "react";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [role,     setRole]     = useState("viewer");
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <AppCtx.Provider value={{ darkMode, setDarkMode, role, setRole, toast, showToast }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
