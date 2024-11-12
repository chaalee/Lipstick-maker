// src/pages/Stats.js
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Stats = () => {
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Get data from localStorage
      const analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      // Sort by timestamp, most recent first
      const sortedData = analysisHistory.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setData(sortedData);
      setDisplayData(sortedData.slice(0, 20)); // Show only latest 20 entries initially
    } catch (err) {
      setError('Error loading analysis data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleShowMore = () => {
    setShowAll(prev => !prev);
    if (!showAll) {
      setDisplayData(data); // Show all data
    } else {
      setDisplayData(data.slice(0, 20)); // Show only latest 20
    }
  };

  // Prepare chart data for the displayed entries only
  const prepareChartData = () => {
    const chartData = displayData.reduce((acc, curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          avgAnalysisTime: 0,
          totalAnalysisTime: 0
        };
      }
      acc[date].count++;
      acc[date].totalAnalysisTime += curr.performanceMetrics.analysisTime;
      acc[date].avgAnalysisTime = acc[date].totalAnalysisTime / acc[date].count;
      return acc;
    }, {});

    return Object.values(chartData);
  };

  if (loading) return <div className="p-8 text-center">Loading stats...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header with total count */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Analysis Statistics</h1>
              <p className="text-gray-600">Showing {displayData.length} of {data.length} entries</p>
            </div>
            <button
              onClick={() => {
                const csv = convertToCSV(data);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `skin-tone-analysis-${new Date().toISOString()}.csv`;
                a.click();
              }}
              className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg"
            >
              Download Data
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Total Analyses</h3>
              <p className="text-2xl">{data.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Average Analysis Time</h3>
              <p className="text-2xl">
                {(displayData.reduce((acc, curr) => acc + curr.performanceMetrics.analysisTime, 0) / displayData.length).toFixed(2)}ms
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Most Common Season</h3>
              <p className="text-2xl">{getMostCommonSeason(displayData)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-8 mb-8">
            {/* Analysis Count Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Daily Analysis Count</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Analyses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Analysis Time Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Average Analysis Time</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avgAnalysisTime" 
                      stroke="#82ca9d" 
                      name="Avg Time (ms)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Raw Data Table */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Season
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Undertone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lightness
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Analysis Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.seasons.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.undertone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.lightness}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.performanceMetrics.analysisTime.toFixed(2)}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Show More/Less Button */}
            {data.length > 20 && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleShowMore}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 
                           hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >
                  {showAll ? (
                    <>
                      Show Less <ChevronUp size={20} />
                    </>
                  ) : (
                    <>
                      Show More ({data.length - 20} entries) <ChevronDown size={20} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getMostCommonSeason = (data) => {
  const seasonCounts = data.reduce((acc, curr) => {
    curr.seasons.forEach(season => {
      acc[season] = (acc[season] || 0) + 1;
    });
    return acc;
  }, {});
  
  return Object.entries(seasonCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
};

const convertToCSV = (data) => {
  const headers = ['Timestamp', 'Season', 'Undertone', 'Lightness', 'Analysis Time (ms)'];
  const rows = data.map(item => [
    item.timestamp,
    item.seasons.join(';'),
    item.undertone,
    item.lightness,
    item.performanceMetrics.analysisTime.toFixed(2)
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

export default Stats;