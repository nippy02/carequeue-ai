import React, { useState } from 'react';
import { api } from '../api';

function PatientForm() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    contactNumber: '',
    symptoms: '',
    temperature: '',
    isEmergency: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    
    // Validation
    if (!form.name.trim()) {
      setError('Patient name is required.');
      return;
    }
    
    if (!form.age || parseInt(form.age) < 0) {
      setError('Valid age is required.');
      return;
    }
    
    if (!form.symptoms.trim()) {
      setError('Symptoms description is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.registerPatient({
        name: form.name.trim(),
        age: parseInt(form.age),
        contactNumber: form.contactNumber.trim() || undefined,
        symptoms: form.symptoms.trim(),
        temperature: form.temperature || undefined,
        isEmergency: form.isEmergency,
      });
      setResult(res);
      setForm({ 
        name: '', 
        age: '', 
        contactNumber: '',
        symptoms: '', 
        temperature: '', 
        isEmergency: false 
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Registration</h1>
        <p className="text-gray-600 mb-6">Walk-in patients: Please fill out this form to join the queue.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="label">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Juan Dela Cruz"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="label">Age *</label>
            <input
              id="age"
              name="age"
              type="number"
              min="0"
              max="120"
              value={form.age}
              onChange={handleChange}
              placeholder="25"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="contactNumber" className="label">Contact Number</label>
            <input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              value={form.contactNumber}
              onChange={handleChange}
              placeholder="09123456789"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="symptoms" className="label">Symptoms / Chief Complaint *</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              placeholder="Describe your symptoms (e.g., fever, cough, headache, chest pain...)"
              rows="4"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="temperature" className="label">Temperature (°C) — Optional</label>
            <input
              id="temperature"
              name="temperature"
              type="number"
              step="0.1"
              min="35"
              max="45"
              value={form.temperature}
              onChange={handleChange}
              placeholder="36.5"
              className="input"
            />
          </div>

          <div className="flex items-center">
            <input
              id="isEmergency"
              name="isEmergency"
              type="checkbox"
              checked={form.isEmergency}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isEmergency" className="ml-2 block text-sm text-gray-700">
              This is an emergency
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <div className="font-semibold mb-2">✓ Registered Successfully!</div>
              <div className="space-y-1 text-sm">
                <div><strong>Queue Number:</strong> #{result.patient.queueNumber}</div>
                <div><strong>Patient:</strong> {result.patient.name}</div>
                <div className="flex items-center space-x-2">
                  <span><strong>Priority:</strong></span>
                  <span className={`badge ${getPriorityColor(result.patient.priority)}`}>
                    {result.patient.priority.toUpperCase()}
                  </span>
                </div>
                {result.patient.estimatedDuration && (
                  <div><strong>Est. Consultation Duration:</strong> {result.patient.estimatedDuration} minutes</div>
                )}
                {result.patient.consultationType && (
                  <div><strong>Consultation Type:</strong> {result.patient.consultationType}</div>
                )}
                <div><strong>Est. Wait Time:</strong> ~{result.patient.estimatedWait} minutes</div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientForm;
