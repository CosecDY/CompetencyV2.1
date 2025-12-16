import React from "react";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onDismiss }) => {
  return (
    <Layout>
      <WhiteTealBackground>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100 max-w-md w-full">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Portfolio</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button onClick={onRetry} className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
                Try Again
              </button>
              <button onClick={onDismiss} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-200">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
};

export default ErrorState;
