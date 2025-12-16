import { useState, useCallback, useContext } from "react";
import AuthContext from "@Contexts/AuthContext";

export const useAuth = () => {
  const auth = useContext(AuthContext);
  const [loginOpen, setLoginOpen] = useState(false);

  const isLoggedIn = !!auth?.user;

  const handleLogin = useCallback(
    async (response: { credential?: string }) => {
      if (response.credential) {
        try {
          await auth?.login(response.credential);
        } catch (error) {
          console.error("Login failed:", error);
        }
      }
    },
    [auth]
  );

  const handleLogout = useCallback(async () => {
    try {
      await auth?.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [auth]);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return {
    auth,
    isLoggedIn,
    loginOpen,
    handleLogin,
    handleLogout,
    openLogin,
    closeLogin,
  };
};
