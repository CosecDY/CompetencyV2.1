import React from "react";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Competency/Background/WhiteTealBackground";

interface NoDataStateProps {
  recommendations: string[];
  onRefresh: () => void;
}

const NoDataState: React.FC<NoDataStateProps> = ({ recommendations, onRefresh }) => {
  return (
    <Layout>
      <WhiteTealBackground>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100 max-w-md w-full">
            <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Portfolio Data</h2>
            <p className="text-gray-600 mb-6">No competency data found. Start by taking assessments to build your portfolio.</p>
            {recommendations.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="h-5 w-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-medium text-teal-800">Recommendations</h3>
                </div>
                <ul className="text-sm text-teal-700 space-y-2 text-left">
                  {recommendations.map((rec, index) => (
                    <li key={`rec-${rec.slice(0, 20)}-${index}`} className="flex items-start space-x-2">
                      <span className="text-teal-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={onRefresh} className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
              Refresh Data
            </button>
          </div>
        </div>
      </WhiteTealBackground>
    </Layout>
  );
};

export default NoDataState;
