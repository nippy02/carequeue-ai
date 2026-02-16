import React, { useState, useEffect } from 'react';
import { api } from '../api';

function QueueDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await api.getQueue();
      setQueue(res.queue);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'emergency': return 'badge-emergency';
      case 'urgent': return 'badge-urgent';
      case 'normal': return 'badge-normal';
      default: return 'badge-normal';
    }
  };

  const getPriorityBg = (priority) => {
    switch(priority) {
      case 'emergency': return 'border-l-red-500 bg-red-50';
      case 'urgent': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center">
          <div className="text-lg text-gray-600">Loading queue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Queue</h1>
        <p className="text-gray-600">Current patient queue — updates every 5 seconds</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {queue.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">✓</div>
          <p className="text-xl text-gray-700 mb-2">No patients in queue right now.</p>
          <p className="text-gray-500">Patients who register will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((patient, index) => (
            <div
              key={patient.id}
              className={`card border-l-4 ${getPriorityBg(patient.priority)} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-lg font-semibold text-gray-900">#{patient.queueNumber}</span>
                      <span className="text-lg font-medium text-gray-900">{patient.name}</span>
                      <span className={`badge ${getPriorityColor(patient.priority)}`}>
                        {patient.priority.toUpperCase()}
                      </span>
                    </div>
                    {patient.symptoms && (
                      <p className="text-sm text-gray-600 truncate">
                        {patient.symptoms.substring(0, 80)}
                        {patient.symptoms.length > 80 ? '...' : ''}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      {patient.age && <span>Age: {patient.age}</span>}
                      {patient.temperature && <span>Temp: {patient.temperature}°C</span>}
                      {patient.estimatedDuration && (
                        <span>Est. Duration: {patient.estimatedDuration} min</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 text-right">
                  <div className="text-2xl font-bold text-blue-600">~{patient.estimatedWait}</div>
                  <div className="text-xs text-gray-500">minutes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QueueDashboard;
