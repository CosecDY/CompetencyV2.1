import React from "react";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

interface LoadingStateProps {
  lastFetched?: Date | null;
}

const LoadingState: React.FC<LoadingStateProps> = ({ lastFetched }) => {
  return (
    <Layout>
      <WhiteTealBackground>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100 max-w-md w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto"></div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">Loading Portfolio</h3>
            <p className="mt-2 text-gray-600">Fetching your competency data...</p>
            {lastFetched && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Last updated: {lastFetched.toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
};

export default LoadingState;
