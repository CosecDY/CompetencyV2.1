import React, { createContext, useState, ReactNode, useContext, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLoginResponse, loginWithGoogle, logout as logoutService, getCurrentUser as fetchCurrentUserService, refreshAccessToken } from "@Services/competency/authService";
import { Modal } from "@Components/Admin/ExportComponent";

export interface AuthContextType {
  user: GoogleLoginResponse["user"] | null;
  loading: boolean;
  csrfToken?: string;
  login: (idToken: string) => Promise<void>;
  logout: (fromInactivity?: boolean) => Promise<void>;
  tokenExpiresIn?: number;
  tokenExpiresInText?: string;
  sessionExpired?: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<GoogleLoginResponse["user"] | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | undefined>(undefined);
  const [tokenExpiresInText, setTokenExpiresInText] = useState<string>("");
  const expiresAtRef = useRef<number | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const alreadyLoggedOutRef = useRef(false);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const INACTIVITY_LIMIT = 15 * 60 * 1000;

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
  });

  // Idle timeout
  const resetInactivityTimer = () => {
    if (!user || alreadyLoggedOutRef.current) return;
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = setTimeout(() => {
      if (!alreadyLoggedOutRef.current) logout(true);
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click"];
    const handleActivity = () => resetInactivityTimer();

    events.forEach((e) => window.addEventListener(e, handleActivity));
    resetInactivityTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    };
  }, [user]);

  // Countdown text
  useEffect(() => {
    if (tokenExpiresIn === undefined) return;
    const interval = setInterval(() => {
      if (!expiresAtRef.current) return;
      const diffSeconds = Math.max(Math.floor((expiresAtRef.current - Date.now()) / 1000), 0);
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      setTokenExpiresInText(`${minutes}m ${seconds}s`);
      if (diffSeconds <= 0) {
        clearInterval(interval);
        setTokenExpiresInText("Expired");
        setSessionExpired(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tokenExpiresIn]);

  // Auto logout on session expired
  useEffect(() => {
    if (sessionExpired && initialLoadDone && !alreadyLoggedOutRef.current) {
      alreadyLoggedOutRef.current = true;
      setModal({
        isOpen: true,
        message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง",
      });
      logout();
    }
  }, [sessionExpired]);

  // Token refresh
  useEffect(() => {
    if (tokenExpiresIn === undefined) return;
    const THRESHOLD = 30;
    let refreshing = false;
    const interval = setInterval(async () => {
      if (!expiresAtRef.current) return;
      const diffSeconds = Math.max(Math.floor((expiresAtRef.current - Date.now()) / 1000), 0);
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      setTokenExpiresInText(`${minutes}m ${seconds}s`);

      if (diffSeconds <= THRESHOLD && !refreshing) {
        refreshing = true;
        try {
          const refreshed = await refreshAccessToken();
          if (refreshed.expiresIn) {
            expiresAtRef.current = Date.now() + refreshed.expiresIn * 1000;
            setTokenExpiresIn(refreshed.expiresIn);
          }
        } catch (err) {
          console.error("Refresh token failed", err);
        } finally {
          refreshing = false;
        }
      }

      if (diffSeconds <= 0) {
        clearInterval(interval);
        setTokenExpiresInText("Expired");
        setSessionExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tokenExpiresIn]);

  // Fetch current user
  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await fetchCurrentUserService();
      setUser(data.user);
      setCsrfToken(data.csrfToken);

      const expires = data.expiresIn ?? 60;
      expiresAtRef.current = Date.now() + expires * 1000;
      setTokenExpiresIn(expires);
      resetInactivityTimer();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (idToken: string) => {
    alreadyLoggedOutRef.current = false;
    setLoading(true);
    try {
      const data = await loginWithGoogle(idToken);
      setUser(data.user);
      setCsrfToken(data.csrfToken);

      const expires = Number(data.expiresIn ?? 60);
      expiresAtRef.current = Date.now() + expires * 1000;
      setTokenExpiresIn(expires);
      resetInactivityTimer();
    } finally {
      setLoading(false);
    }
  };

  const logout = async (fromInactivity = false) => {
    if (alreadyLoggedOutRef.current) return;
    alreadyLoggedOutRef.current = true;
    setLoading(true);

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }

    try {
      await logoutService();
    } finally {
      setUser(null);
      setCsrfToken(undefined);
      setLoading(false);
      setTokenExpiresIn(undefined);
      setTokenExpiresInText("");
      expiresAtRef.current = null;
      setSessionExpired(false);

      if (fromInactivity) {
        setModal({
          isOpen: true,
          message: "คุณไม่มีการใช้งานเป็นเวลานาน ระบบได้ทำการออกจากระบบโดยอัตโนมัติ",
        });
      }

      navigate("/home", { replace: true });
    }
  };

  const value = useMemo(
    () => ({ user, loading, csrfToken, login, logout, tokenExpiresIn, tokenExpiresInText, sessionExpired }),
    [user, loading, csrfToken, tokenExpiresIn, tokenExpiresInText, sessionExpired]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modal.isOpen && (
        <Modal onClose={() => setModal({ isOpen: false, message: "" })} title="การแจ้งเตือน">
          <p>{modal.message}</p>
        </Modal>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
