import React, { useState, useEffect } from "react";
import { GetSfiaSummaryService, SfiaSummaryStats } from "../../services/sfia/getSfiaSummaryAPI";

/**
 * Example component showing how to use the SFIA Summary API service.
 * This demonstrates the basic usage pattern for the service.
 */
const SfiaSummaryExample: React.FC = () => {
  const [summaryData, setSummaryData] = useState<SfiaSummaryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the service
  const sfiaService = new GetSfiaSummaryService();

  // Fetch SFIA summary data
  const fetchSfiaSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate service configuration
      const validation = sfiaService.validateServiceConfig();
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Get user summary
      const response = await sfiaService.getUserSummary();

      if (sfiaService.hasSummaryData(response)) {
        setSummaryData(response.data!);

        // Example: Calculate additional statistics
        const additionalStats = sfiaService.calculateAdditionalStats(response.data!);
        console.log("High performance skills:", additionalStats.highPerformanceSkills);
        console.log("Skills by category:", additionalStats.skillsByCategory);

        // Example: Format data for display
        const formattedData = sfiaService.formatSummaryForDisplay(response.data!);
        console.log("Formatted for display:", formattedData);
      } else {
        setError("No SFIA summary data found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch SFIA summary");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount when token is available
  useEffect(() => {
    fetchSfiaSummary();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p>Loading SFIA summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600">{error}</p>
        <button onClick={fetchSfiaSummary} className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <p>No SFIA summary data available</p>
        <button onClick={fetchSfiaSummary} className="mt-2 bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
          Load Data
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">SFIA Skills Summary</h2>

      {/* Summary Statistics */}
      <div className="bg-teal-50 border border-teal-200 rounded p-4">
        <h3 className="font-medium text-teal-800 mb-2">Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="block text-teal-600">Total Skills</span>
            <span className="font-medium">{summaryData.totalSkills}</span>
          </div>
          <div>
            <span className="block text-teal-600">Average Progress</span>
            <span className="font-medium">{summaryData.avgSkillPercent}%</span>
          </div>
          <div>
            <span className="block text-teal-600">Completed Skills</span>
            <span className="font-medium">{summaryData.completedSkills}</span>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-2">
        <h3 className="font-medium">Your Skills</h3>
        {summaryData.skills.map((skill) => (
          <div key={skill.id} className="border border-gray-200 rounded p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{skill.skill.name}</h4>
                <p className="text-sm text-gray-600">
                  {skill.skillCode} - {skill.skill.category.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-medium text-teal-600">{skill.skillPercent}%</span>
                <p className="text-sm text-gray-500">{skill.level.name}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${skill.skillPercent}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button onClick={fetchSfiaSummary} className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
          Refresh
        </button>
        <button
          onClick={() => {
            const formatted = sfiaService.formatSummaryForDisplay(summaryData);
            console.log("Formatted data:", formatted);
            alert("Check console for formatted data");
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Format Data
        </button>
      </div>
    </div>
  );
};

export default SfiaSummaryExample;
