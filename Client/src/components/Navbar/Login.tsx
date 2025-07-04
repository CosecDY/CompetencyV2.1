import React, { useEffect } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

interface LoginProps {
  open: boolean;
  onClose: () => void;
  handleLogin: (response: CredentialResponse | { credential: string }) => void;
}

const GOOGLE_CLIENT_ID =
  "170385751378-bbtp2rf09iorhsustgqors4r1tc7hf6n.apps.googleusercontent.com";

const Login: React.FC<LoginProps> = ({ open, onClose, handleLogin }) => {
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  if (!open) return null;

  const handleGoogleSuccess = (response: CredentialResponse) => {
    handleLogin(response);
    onClose();
  };

  const handleGoogleError = () => {
    console.error("Google login error");
  };

  const handleGitHubLogin = () => {
    handleLogin({ credential: "MOCK_GITHUB_TOKEN" });
    onClose();
  };

  const handleLinkedInLogin = () => {
    handleLogin({ credential: "MOCK_LINKEDIN_TOKEN" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="presentation"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden z-10 border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-lg p-1 transition-colors duration-200"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex flex-col md:flex-row min-h-[380px]">
          {/* Left Panel - Teal Theme */}
          <div className="md:w-5/12 w-full bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-teal-600/20 backdrop-blur-sm"></div>
            <div className="text-center text-white relative z-10">
              <h2 className="text-2xl font-bold mb-2">Competency Database</h2>
              <p className="text-sm opacity-90">
                Accurate Competency Assessment System
              </p>
              <div className="mt-4 w-16 h-1 bg-white/30 rounded-full mx-auto"></div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="md:w-7/12 w-full flex items-center justify-center p-6 bg-gray-50/30">
            <div className="w-full max-w-xs">
              <h3 className="text-2xl font-bold text-center mb-2 text-gray-900">
                Sign In
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Choose your preferred sign-in method
              </p>

              <div className="space-y-3">
                {/* Google Login Button */}
                <div className="flex justify-center relative w-[300px] h-[45px] mx-auto">
                  <div className="absolute inset-0 z-10 flex items-center justify-center border border-gray-300 text-gray-700 rounded-xl bg-white hover:bg-gray-50 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <FcGoogle className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">
                      Sign in with Google
                    </span>
                  </div>
                  {/* Transparent GoogleLogin underlay */}
                  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <div className="absolute inset-0 opacity-0 z-20">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        width="300"
                        useOneTap={false}
                      />
                    </div>
                  </GoogleOAuthProvider>
                </div>
              </div>

              {/* Footer Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
