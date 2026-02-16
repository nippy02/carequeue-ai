import React, { useState, useEffect } from 'react';
import { api } from '../api';

function AnalyticsDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      const res = await api.getDailyReport();
      setReport(res.report);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center">
          <div className="text-lg text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinic Analytics Dashboard</h1>
        <p className="text-gray-600">Daily statistics and insights — {report.date}</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-3xl font-bold mb-1">{report.totalPatients}</div>
          <div className="text-blue-100">Total Patients Today</div>
        </div>
        
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="text-3xl font-bold mb-1">{report.emergencyCases}</div>
          <div className="text-red-100">Emergency Cases</div>
        </div>
        
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-3xl font-bold mb-1">{report.urgentCases}</div>
          <div className="text-orange-100">Urgent Cases</div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-3xl font-bold mb-1">{report.normalCases}</div>
          <div className="text-green-100">Normal Cases</div>
        </div>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-gray-900 mb-1">{report.activeWaiting}</div>
          <div className="text-gray-600">Active Waiting</div>
        </div>
        
        <div className="card border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900 mb-1">{report.inConsultation}</div>
          <div className="text-gray-600">In Consultation</div>
        </div>
        
        <div className="card border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-900 mb-1">{report.completedVisits}</div>
          <div className="text-gray-600">Completed Visits</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Average Waiting Time</h2>
          <div className="flex items-baseline space-x-2">
            <div className="text-4xl font-bold text-blue-600">{report.averageWaitTime}</div>
            <div className="text-gray-600">minutes</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Based on completed visits today</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Priority Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-700">Emergency</span>
              </div>
              <span className="font-semibold text-gray-900">{report.emergencyCases}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-700">Urgent</span>
              </div>
              <span className="font-semibold text-gray-900">{report.urgentCases}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">Normal</span>
              </div>
              <span className="font-semibold text-gray-900">{report.normalCases}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
