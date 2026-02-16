# CareQueue AI - API Documentation

Complete REST API reference for CareQueue AI backend.

**Base URL:** `http://localhost:5000/api`

---

## Authentication

### POST /auth/login

Staff login endpoint.

**Request:**
```json
{
  "username": "admin",
  "password": "carequeue123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Patient Registration

### POST /patients

Register a new patient.

**Request Body:**
```json
{
  "name": "Juan Dela Cruz",        // Required
  "age": 35,                        // Required, >= 0
  "contactNumber": "09123456789",   // Optional
  "symptoms": "chest pain",         // Required
  "temperature": 37.5,              // Optional, 35-45
  "isEmergency": false              // Optional, boolean
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "patient": {
    "id": "P1234567890-abc123",
    "queueNumber": 1,
    "name": "Juan Dela Cruz",
    "priority": "emergency",
    "status": "waiting",
    "estimatedDuration": 45,
    "consultationType": "Cardiology",
    "estimatedWait": 5
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Patient name is required"
}
```

### GET /patients

Get all patients (admin).

**Response (200):**
```json
{
  "success": true,
  "patients": [
    {
      "id": "P1234567890-abc123",
      "queueNumber": 1,
      "name": "Juan Dela Cruz",
      "age": 35,
      "contactNumber": "09123456789",
      "symptoms": "chest pain",
      "temperature": 37.5,
      "isEmergency": false,
      "priority": "emergency",
      "priorityReason": "Symptoms indicate potential emergency",
      "status": "waiting",
      "estimatedDuration": 45,
      "consultationType": "Cardiology",
      "createdAt": "2026-02-16T10:30:00.000Z",
      "updatedAt": "2026-02-16T10:30:00.000Z",
      "completedAt": null
    }
  ]
}
```

---

## Queue Management

### GET /queue

Get sorted live queue (by priority, then arrival time).

**Response (200):**
```json
{
  "success": true,
  "queue": [
    {
      "id": "P1234567890-abc123",
      "queueNumber": 1,
      "name": "Juan Dela Cruz",
      "priority": "emergency",
      "status": "waiting",
      "position": 1,
      "estimatedWait": 5,
      "symptoms": "chest pain",
      "age": 35,
      "temperature": 37.5,
      "estimatedDuration": 45,
      "consultationType": "Cardiology",
      "createdAt": "2026-02-16T10:30:00.000Z"
    }
  ]
}
```

### PATCH /queue/:id/status

Update patient status.

**URL Parameters:**
- `id` - Patient ID

**Request Body:**
```json
{
  "status": "waiting" | "in_consultation" | "done"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated",
  "patient": {
    "id": "P1234567890-abc123",
    "status": "in_consultation",
    "updatedAt": "2026-02-16T10:35:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid status. Use: waiting, in_consultation, or done"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### DELETE /queue/completed

Clear all completed patients.

**Response (200):**
```json
{
  "success": true,
  "message": "Completed patients cleared",
  "deleted": 5
}
```

---

## Reports & Analytics

### GET /reports/daily

Get daily statistics and analytics.

**Response (200):**
```json
{
  "success": true,
  "report": {
    "date": "2026-02-16",
    "totalPatients": 15,
    "emergencyCases": 3,
    "urgentCases": 5,
    "normalCases": 7,
    "activeWaiting": 2,
    "inConsultation": 1,
    "completedVisits": 12,
    "averageWaitTime": 18
  }
}
```

### GET /reports/log

Get daily patient log.

**Response (200):**
```json
{
  "success": true,
  "log": [
    {
      "id": "P1234567890-abc123",
      "queueNumber": 1,
      "name": "Juan Dela Cruz",
      "age": 35,
      "symptoms": "chest pain",
      "priority": "emergency",
      "status": "done",
      "createdAt": "2026-02-16T10:30:00.000Z",
      "completedAt": "2026-02-16T10:45:00.000Z"
    }
  ]
}
```

---

## Health Check

### GET /health

Check API health status.

**Response (200):**
```json
{
  "status": "ok",
  "message": "CareQueue AI API is running"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to process request",
  "error": "Error details"
}
```

---

## Priority Values

- `emergency` - Life-threatening, immediate attention needed
- `urgent` - Needs attention within hours
- `normal` - Routine care

## Status Values

- `waiting` - Patient is waiting in queue
- `in_consultation` - Patient is currently being seen
- `done` - Patient visit completed

---

## Rate Limiting

Currently no rate limiting (MVP). For production, implement rate limiting.

---

## CORS

CORS is enabled for all origins. For production, restrict to specific domains.

---

**Last Updated:** February 2026
