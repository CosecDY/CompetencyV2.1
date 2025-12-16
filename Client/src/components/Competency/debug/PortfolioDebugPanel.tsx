import React, { useState } from "react";
import { GetSfiaSummaryService, GetSfiaSummaryResponse } from "../../services/sfia/getSfiaSummaryAPI";
import { GetTpqiSummaryService, GetTpqiSummaryResponse } from "../../services/tpqi/getTpqiSummaryAPI";

/**
 * Debug component to test API endpoints and see raw responses.
 * Useful for troubleshooting data structure issues.
 */
const PortfolioDebugPanel: React.FC = () => {
  const [sfiaData, setSfiaData] = useState<GetSfiaSummaryResponse | null>(null);
  const [tpqiData, setTpqiData] = useState<GetTpqiSummaryResponse | null>(null);
  const [sfiaError, setSfiaError] = useState<string | null>(null);
  const [tpqiError, setTpqiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testSfiaEndpoint = async () => {
    try {
      setSfiaError(null);
      setLoading(true);

      const service = new GetSfiaSummaryService();
      const response = await service.getUserSummary();

      console.log("SFIA Response:", response);
      setSfiaData(response);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setSfiaError(errorMsg);
      console.error("SFIA Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testTpqiEndpoint = async () => {
    try {
      setTpqiError(null);
      setLoading(true);

      const service = new GetTpqiSummaryService();
      const response = await service.getUserSummary();

      console.log("TPQI Response:", response);
      setTpqiData(response);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setTpqiError(errorMsg);
      console.error("TPQI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testBothEndpoints = async () => {
    await Promise.all([testSfiaEndpoint(), testTpqiEndpoint()]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Portfolio API Debug Panel</h2>

        <div className="flex space-x-4 mb-6">
          <button onClick={testSfiaEndpoint} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors">
            Test SFIA API
          </button>
          <button onClick={testTpqiEndpoint} disabled={loading} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors">
            Test TPQI API
          </button>
          <button onClick={testBothEndpoints} disabled={loading} className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors">
            Test Both APIs
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Testing APIs...</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* SFIA Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-800">SFIA API Results</h3>

            {sfiaError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-medium text-red-800">Error:</h4>
                <p className="text-red-700 text-sm">{sfiaError}</p>
              </div>
            )}

            {sfiaData && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <h4 className="font-medium text-blue-800 mb-2">Response Data:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>Success:</strong> {String(sfiaData.success)}
                  </p>
                  <p>
                    <strong>Message:</strong> {sfiaData.message || "None"}
                  </p>
                  <p>
                    <strong>Data Structure:</strong>
                  </p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">{JSON.stringify(sfiaData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* TPQI Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-800">TPQI API Results</h3>

            {tpqiError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-medium text-red-800">Error:</h4>
                <p className="text-red-700 text-sm">{tpqiError}</p>
              </div>
            )}

            {tpqiData && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <h4 className="font-medium text-green-800 mb-2">Response Data:</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <strong>Success:</strong> {String(tpqiData.success)}
                  </p>
                  <p>
                    <strong>Message:</strong> {tpqiData.message || "None"}
                  </p>
                  <p>
                    <strong>Data Structure:</strong>
                  </p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">{JSON.stringify(tpqiData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Configuration Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-medium text-gray-800 mb-2">Configuration:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Base API URL:</strong>
            </p>
            <p>
              <strong>SFIA Endpoint:</strong> /api/sfia/summary/user
            </p>
            <p>
              <strong>TPQI Endpoint:</strong> /api/tpqi/summary/user
            </p>
            <p>
              <strong>Has Access Token:</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDebugPanel;
