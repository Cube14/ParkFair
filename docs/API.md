# ParkFair API Specification

## API Base URL

Development:

```text
http://localhost:5000/api
```

Production:

```text
https://parkfair-api.onrender.com/api
```

---

# Authentication

## Login

POST

```http
/api/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "123",
    "name": "John Doe",
    "role": "RESIDENT"
  }
}
```

---

## Current User

GET

```http
/api/auth/me
```

Response:

```json
{
  "id": "123",
  "name": "John Doe",
  "role": "RESIDENT"
}
```

---

# Resident APIs

## Get Dashboard

GET

```http
/api/resident/dashboard
```

Response:

```json
{
  "flatNumber": "203",
  "currentStatus": "INSIDE",
  "balance": -2,
  "currentRotation": 5,
  "nextStatus": "OUTSIDE"
}
```

---

## Allocation History

GET

```http
/api/resident/history
```

Response:

```json
[
  {
    "status": "INSIDE",
    "startDate": "2026-06-01",
    "endDate": "2026-06-10"
  }
]
```

---

# Admin APIs

## Get All Flats

GET

```http
/api/admin/flats
```

---

## Create Flat

POST

```http
/api/admin/flats
```

Request:

```json
{
  "flatNumber": "203",
  "ownerName": "John Doe"
}
```

---

## Get Vehicles

GET

```http
/api/admin/vehicles
```

---

## Create Vehicle

POST

```http
/api/admin/vehicles
```

Request:

```json
{
  "flatId": "123",
  "vehicleNumber": "GJ01AB1234",
  "vehicleType": "CAR"
}
```

---

# Allocation APIs

## Generate Allocation

POST

```http
/api/allocations/generate
```

Response:

```json
{
  "success": true,
  "generatedCount": 14
}
```

---

## Current Allocation

GET

```http
/api/allocations/current
```

Response:

```json
[
  {
    "flatNumber": "101",
    "status": "INSIDE"
  }
]
```

---

## Allocation Balance Report

GET

```http
/api/allocations/balances
```

Response:

```json
[
  {
    "flatNumber": "101",
    "balance": 5
  }
]
```

---

# Notification APIs

## Send Notifications

POST

```http
/api/notifications/send
```

---

## Notification History

GET

```http
/api/notifications/history
```

---

# Configuration APIs

## Get Configuration

GET

```http
/api/config
```

---

## Update Configuration

PUT

```http
/api/config
```

Request:

```json
{
  "coveredParking": 8,
  "rotationDays": 10
}
```

---

# Admin Override APIs

## Manual Allocation Override

POST

```http
/api/admin/override
```

Request:

```json
{
  "flatId": "123",
  "newStatus": "INSIDE",
  "reason": "Maintenance Work"
}
```

---

# Health Check

GET

```http
/api/health
```

Response:

```json
{
  "status": "ok"
}
```
