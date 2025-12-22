import React, { useState, useCallback } from "react";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@Contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

const GOOGLE_CLIENT_ID = `${import.meta.env.VITE_GOOGLE_CLIENT_ID}`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const from = location.state?.from?.pathname || "/home";

  const handleGoogleError = useCallback(() => {
    console.error("Google login error");
    setLocalLoading(false);
  }, []);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;

    setLocalLoading(true);
    try {
      await login(response.credential);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login Failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors duration-200 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-white"
      >
        <ArrowLeft className="text-emerald-800" size={20} />
        <span className="text-emerald-800">Back</span>
      </Link>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/50 backdrop-blur-sm">
        <div className="md:w-1/2 w-full bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-12 text-white group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 opacity-90 transition-opacity duration-700 group-hover:opacity-100"></div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 mb-8 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Competency DB</h2>
            <div className="w-16 h-1 bg-teal-400 rounded-full mb-6"></div>
            <p className="text-teal-50 text-lg leading-relaxed max-w-xs font-light">Elevate your workforce potential with our advanced competency assessment system.</p>
          </div>
          <div className="absolute bottom-8 text-xs text-teal-200/60 font-medium tracking-wider uppercase">Designed for Performance</div>
        </div>

        <div className="md:w-1/2 w-full bg-white flex flex-col items-center justify-center p-8 md:p-16 relative">
          <div className="w-full max-w-sm">
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Welcome Come</h3>
              <p className="text-slate-500">Sign in to access your dashboard.</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center relative w-full h-[56px] group">
                <div
                  className={`absolute inset-0 z-10 flex items-center justify-center border border-slate-200 text-slate-700 rounded-xl bg-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:border-teal-500 group-hover:-translate-y-0.5 ${
                    localLoading ? "bg-slate-50 opacity-80 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {localLoading ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-semibold text-slate-500">Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <FcGoogle className="h-6 w-6 mr-3 filter drop-shadow-sm" />
                      <span className="text-base font-semibold tracking-wide">Sign in with Google</span>
                    </>
                  )}
                </div>

                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <div className={`absolute inset-0 z-20 opacity-0 overflow-hidden ${localLoading ? "pointer-events-none" : ""}`}>
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} width="400" useOneTap={false} theme="filled_blue" shape="pill" />
                  </div>
                </GoogleOAuthProvider>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center space-y-4">
              <div className="w-full border-t border-slate-100"></div>
              <p className="text-xs text-slate-400 text-center leading-5">
                By continuing, you acknowledge that you have read and understood our
                <a href="#" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline ml-1">
                  Terms of Service
                </a>{" "}
                and
                <a href="#" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline ml-1">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
