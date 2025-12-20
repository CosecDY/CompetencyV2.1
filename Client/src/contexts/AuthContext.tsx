import React, { createContext, useState, ReactNode, useContext, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLoginResponse, loginWithGoogle, logout as logoutService, getCurrentUser as fetchCurrentUserService, refreshAccessToken } from "@Services/competency/authService";
import { Modal } from "@Components/Admin/ExportComponent";

// ==========================================
// Types
// ==========================================
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

// ==========================================
// Provider Component
// ==========================================
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // --- State ---
  const [user, setUser] = useState<GoogleLoginResponse["user"] | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Token & Expiry State
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | undefined>(undefined);
  const [tokenExpiresInText, setTokenExpiresInText] = useState<string>("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
  });

  // --- Refs ---
  const expiresAtRef = useRef<number | null>(null);
  const alreadyLoggedOutRef = useRef(false);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingUserRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const lastActivityRef = useRef<number>(Date.now());

  // Constants
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 นาที
  const REFRESH_THRESHOLD = 30; // 30 วินาที

  // ==========================================
  // 1. Inactivity Logic
  // ==========================================
  const resetInactivityTimer = () => {
    if (!user || alreadyLoggedOutRef.current) return;

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      if (!alreadyLoggedOutRef.current) {
        logout(true);
      }
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click"];

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) {
        resetInactivityTimer();
        lastActivityRef.current = now;
      }
    };

    if (user) {
      events.forEach((e) => window.addEventListener(e, handleActivity));
      resetInactivityTimer();
    }

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [user]);

  // ==========================================
  // 2. Token Timer (Unified Logic)
  // ==========================================
  useEffect(() => {
    if (!initialLoadDone || !user || !expiresAtRef.current) return;

    const interval = setInterval(async () => {
      if (!expiresAtRef.current) return;

      const now = Date.now();
      const diffSeconds = Math.max(Math.floor((expiresAtRef.current - now) / 1000), 0);

      // 2.1 Update Text
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      setTokenExpiresInText(`${minutes}m ${seconds}s`);

      // 2.2 Auto Refresh
      if (diffSeconds > 0 && diffSeconds <= REFRESH_THRESHOLD && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        try {
          const refreshed = await refreshAccessToken();
          if (refreshed && refreshed.expiresIn) {
            const newExpiresIn = Number(refreshed.expiresIn);
            expiresAtRef.current = Date.now() + newExpiresIn * 1000;
            setTokenExpiresIn(newExpiresIn);
          }
        } catch (err) {
          console.error("Auto refresh failed:", err);
        } finally {
          isRefreshingRef.current = false;
        }
      }

      // 2.3 Check Expiry
      if (diffSeconds <= 0) {
        clearInterval(interval);
        setTokenExpiresInText("Expired");
        if (!sessionExpired) {
          setSessionExpired(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, initialLoadDone, sessionExpired]);

  // ==========================================
  // 3. Handle Session Expired
  // ==========================================
  useEffect(() => {
    if (sessionExpired && initialLoadDone && !alreadyLoggedOutRef.current) {
      alreadyLoggedOutRef.current = true;
      setModal({
        isOpen: true,
        message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง",
      });
      logout();
    }
  }, [sessionExpired, initialLoadDone]);

  // ==========================================
  // 4. Fetch User (Initial Load - FIX REFRESH ISSUE)
  // ==========================================
  const fetchUser = async () => {
    if (isFetchingUserRef.current) return;

    isFetchingUserRef.current = true;
    setLoading(true);

    try {
      const data = await fetchCurrentUserService();
      if (data && data.user) {
        setUser(data.user);
        setCsrfToken(data.csrfToken);
        const expires = Number(data.expiresIn ?? 60);
        expiresAtRef.current = Date.now() + expires * 1000;

        setTokenExpiresIn(expires);
        resetInactivityTimer();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Fetch user failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
      isFetchingUserRef.current = false;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ==========================================
  // 5. Actions (Login / Logout)
  // ==========================================
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
    if (alreadyLoggedOutRef.current && !fromInactivity && !sessionExpired) return;

    alreadyLoggedOutRef.current = true;
    setLoading(true);

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }

    try {
      await logoutService();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      // Clear State
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
    () => ({
      user,
      loading,
      csrfToken,
      login,
      logout,
      tokenExpiresIn,
      tokenExpiresInText,
      sessionExpired,
    }),
    [user, loading, csrfToken, tokenExpiresIn, tokenExpiresInText, sessionExpired]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        title="แจ้งเตือนระบบ"
        size="sm"
        footer={
          <button
            onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            รับทราบ
          </button>
        }
      >
        <div className="text-center py-2">
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">{modal.message}</p>
        </div>
      </Modal>
    </AuthContext.Provider>
  );
};

export default AuthContext;
