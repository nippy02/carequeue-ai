/**
 * CareQueue AI - Rule-based Triage Logic
 * Classifies patients into Emergency, Urgent, or Normal priority
 */

// Emergency keywords - life-threatening symptoms
const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'difficulty breathing', 'cannot breathe',
  'unconscious', 'stroke', 'severe bleeding', 'bleeding heavily',
  'seizure', 'convulsion', 'allergic reaction', 'anaphylaxis',
  'choking', 'overdose', 'poisoning', 'severe head injury',
  'broken bone visible', 'amputation', 'severe burn',
  'severe pain', 'delivery', 'labor', 'pregnancy emergency',
  'suicide', 'attempted suicide', 'coma'
];

// Urgent keywords - needs attention within hours
const URGENT_KEYWORDS = [
  'high fever', 'fever 39', 'fever 40', 'very high temperature',
  'severe abdominal pain', 'vomiting blood', 'blood in stool',
  'dehydration', 'severe diarrhea', 'infection',
  'wound', 'cut', 'laceration', 'injury',
  'eye injury', 'chemical burn', 'fall',
  'confusion', 'dizziness', 'fainting',
  'rash spreading', 'severe allergy', 'swelling',
  'difficulty swallowing', 'severe headache',
  'child fever', 'baby fever', 'infant fever'
];

// Temperature thresholds (in Celsius)
const EMERGENCY_TEMP = 40;   // 40°C and above = emergency
const URGENT_TEMP = 38.5;    // 38.5°C - 40°C = urgent

/**
 * Normalize text for matching (lowercase, trim)
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().trim();
}

/**
 * Check if text contains any of the keywords
 */
function containsKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some(keyword => normalized.includes(keyword));
}

/**
 * Determine priority based on temperature
 */
function getTempPriority(temperature) {
  if (temperature === null || temperature === undefined || temperature === '') {
    return null;
  }
  
  const temp = parseFloat(temperature);
  if (isNaN(temp)) return null;
  
  if (temp >= EMERGENCY_TEMP) return 'emergency';
  if (temp >= URGENT_TEMP) return 'urgent';
  return null; // Normal temp doesn't escalate
}

/**
 * Main triage function - classifies patient priority
 * @param {Object} patientData - { symptoms, temperature, isEmergency }
 * @returns {Object} - { priority: 'emergency'|'urgent'|'normal', reason: string }
 */
function classifyPatient(patientData) {
  const { symptoms = '', temperature, isEmergency = false } = patientData;
  
  // Manual emergency override (checkbox)
  if (isEmergency) {
    return {
      priority: 'emergency',
      reason: 'Marked as emergency by patient'
    };
  }
  
  // Check temperature first
  const tempPriority = getTempPriority(temperature);
  if (tempPriority === 'emergency') {
    return {
      priority: 'emergency',
      reason: `High temperature (${temperature}°C) - potential emergency`
    };
  }
  
  // Check symptoms for emergency
  if (containsKeyword(symptoms, EMERGENCY_KEYWORDS)) {
    return {
      priority: 'emergency',
      reason: 'Symptoms indicate potential emergency'
    };
  }
  
  // Check temperature for urgent
  if (tempPriority === 'urgent') {
    return {
      priority: 'urgent',
      reason: `Elevated temperature (${temperature}°C)`
    };
  }
  
  // Check symptoms for urgent
  if (containsKeyword(symptoms, URGENT_KEYWORDS)) {
    return {
      priority: 'urgent',
      reason: 'Symptoms require urgent attention'
    };
  }
  
  // Default to normal
  return {
    priority: 'normal',
    reason: 'Routine care'
  };
}

/**
 * Get priority number for sorting (lower = higher priority)
 */
function getPriorityOrder(priority) {
  const order = { emergency: 1, urgent: 2, normal: 3 };
  return order[priority] || 4;
}

/**
 * Estimate visit duration and consultation type
 * Smart cost & visit duration estimator
 * @param {Object} patientData - { symptoms, age, priority }
 * @returns {Object} - { duration: number (minutes), type: string }
 */
function estimateVisitDuration(patientData) {
  const { symptoms = '', age, priority } = patientData;
  const normalizedSymptoms = normalizeText(symptoms);
  
  // Base duration by priority
  let baseDuration = {
    emergency: 45,
    urgent: 30,
    normal: 15
  }[priority] || 15;
  
  // Age-based adjustments
  if (age < 5) {
    baseDuration += 10; // Pediatric cases take longer
  } else if (age > 65) {
    baseDuration += 5; // Elderly patients may need more time
  }
  
  // Symptom-based adjustments
  if (normalizedSymptoms.includes('multiple') || normalizedSymptoms.includes('several')) {
    baseDuration += 10;
  }
  
  // Determine consultation type
  let consultationType = 'General';
  
  // Specialist consultation indicators
  if (normalizedSymptoms.includes('chest') || normalizedSymptoms.includes('heart')) {
    consultationType = 'Cardiology';
    baseDuration += 15;
  } else if (normalizedSymptoms.includes('eye') || normalizedSymptoms.includes('vision')) {
    consultationType = 'Ophthalmology';
    baseDuration += 10;
  } else if (normalizedSymptoms.includes('skin') || normalizedSymptoms.includes('rash')) {
    consultationType = 'Dermatology';
    baseDuration += 5;
  } else if (normalizedSymptoms.includes('child') || normalizedSymptoms.includes('baby') || age < 18) {
    consultationType = 'Pediatrics';
    baseDuration += 10;
  } else if (priority === 'emergency') {
    consultationType = 'Emergency';
  }
  
  return {
    duration: Math.min(baseDuration, 120), // Max 2 hours
    type: consultationType
  };
}

module.exports = {
  classifyPatient,
  getPriorityOrder,
  estimateVisitDuration,
  EMERGENCY_KEYWORDS,
  URGENT_KEYWORDS
};
