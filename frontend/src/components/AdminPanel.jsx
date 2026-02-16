import React, { useState, useEffect } from 'react';
import { api } from '../api';

function AdminPanel({ onLogout }) {
  const [queue, setQueue] = useState([]);
  const [report, setReport] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');

  const fetchData = async () => {
    try {
      const [queueRes, reportRes, logRes] = await Promise.all([
        api.getQueue(),
        api.getDailyReport(),
        api.getDailyLog(),
      ]);
      setQueue(queueRes.queue);
      setReport(reportRes.report);
      setLog(logRes.log);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update');
    }
  };

  const clearCompleted = async () => {
    if (!window.confirm('Clear all completed patients from today?')) return;
    try {
      await api.clearCompleted();
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to clear');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'emergency': return 'badge-emergency';
      case 'urgent': return 'badge-urgent';
      case 'normal': return 'badge-normal';
      default: return 'badge-normal';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'waiting': return 'badge-waiting';
      case 'in_consultation': return 'badge-consultation';
      case 'done': return 'badge-done';
      default: return 'badge-waiting';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage queue and view reports</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Queue Management
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'report'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'log'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Patient Log
          </button>
        </nav>
      </div>

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Manage Queue</h2>
            <button 
              onClick={clearCompleted}
              className="btn btn-secondary text-sm"
            >
              Clear Completed
            </button>
          </div>
          {queue.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No patients in queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((p) => (
                <div key={p.id} className="card border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-lg font-semibold text-gray-900">#{p.queueNumber}</div>
                      <div>
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`badge ${getPriorityColor(p.priority)}`}>
                            {p.priority.toUpperCase()}
                          </span>
                          <span className={`badge ${getStatusColor(p.status)}`}>
                            {p.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <select
                        value={p.status}
                        onChange={(e) => updateStatus(p.id, e.target.value)}
                        className="input text-sm"
                      >
                        <option value="waiting">Waiting</option>
                        <option value="in_consultation">In Consultation</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && report && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Report — {report.date}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <div className="text-3xl font-bold text-gray-900 mb-1">{report.completedVisits}</div>
              <div className="text-gray-600">Patients Served</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-gray-900 mb-1">{report.activeWaiting}</div>
              <div className="text-gray-600">Waiting</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-gray-900 mb-1">{report.inConsultation}</div>
              <div className="text-gray-600">In Consultation</div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge badge-emergency">Emergency</span>
                <span className="font-semibold">{report.emergencyCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="badge badge-urgent">Urgent</span>
                <span className="font-semibold">{report.urgentCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="badge badge-normal">Normal</span>
                <span className="font-semibold">{report.normalCases}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Tab */}
      {activeTab === 'log' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Patient Log</h2>
          {log.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No patients logged today.</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptoms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {log.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.queueNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.age}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`badge ${getPriorityColor(p.priority)}`}>
                          {p.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{p.symptoms || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`badge ${getStatusColor(p.status)}`}>
                          {p.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(p.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
