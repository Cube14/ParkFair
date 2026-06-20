# ParkFair - Software Requirements Specification (SRS)

## 1. Project Overview

### 1.1 Project Name

ParkFair

### 1.2 Tagline

Fair Parking. Transparent Allocation.

### 1.3 Purpose

ParkFair is a parking allocation management platform designed for residential societies that have limited covered parking capacity compared to the number of vehicles.

The platform aims to automate parking rotation, maintain fairness among residents, provide transparency in allocation decisions, and notify residents about upcoming parking status changes.

### 1.4 Problem Statement

Many residential societies have fewer covered parking spaces than registered vehicles.

Current allocation methods are often maintained manually using spreadsheets, printed schedules, or verbal communication.

These methods create issues such as:

* Lack of transparency
* Human errors
* Parking disputes
* Unequal allocation over time
* Difficulty tracking parking history
* No automated notification system

ParkFair aims to solve these issues through automation and data-driven allocation.

---

# 2. Scope

The system will:

* Manage residential flats and vehicles
* Generate parking allocations
* Track parking history
* Maintain allocation fairness
* Notify residents before allocation changes
* Provide resident and administrator dashboards

The system will not:

* Track vehicle location using GPS
* Use cameras for verification
* Enforce fines automatically
* Perform physical parking monitoring

---

# 3. User Roles

## 3.1 Administrator

The administrator can:

* Create and manage flats
* Manage vehicles
* Configure parking rules
* Generate allocation schedules
* View allocation history
* View fairness reports
* Perform manual corrections when required

---

## 3.2 Resident

The resident can:

* Login securely
* View current parking status
* View future allocations
* View parking history
* View allocation balance
* Receive notifications
* Declare vacation periods (future version)

---

# 4. Parking Model

The system is based on the following assumptions:

* One flat generally owns one vehicle
* Multiple vehicles per flat must be supported for future scalability
* Parking allocation is based on INSIDE and OUTSIDE status
* Specific parking slot numbers are not tracked in Version 1
* The number of covered parking spaces is configurable

Example:

Total Flats = 14

Covered Parking = 8

Outside Parking = 6

Rotation Duration = 10 Days

Cycle Duration = 140 Days

---

# 5. Fairness Model

The platform must maintain long-term fairness.

Every resident should receive approximately equal access to covered parking over time.

The system maintains an Allocation Balance.

Allocation Balance measures the difference between:

* Actual covered parking received
* Expected covered parking received

Positive Balance:

Resident has received more covered parking than expected.

Negative Balance:

Resident has received less covered parking than expected.

Zero Balance:

Perfect fairness.

The allocation engine must automatically compensate for imbalances during future allocations.

---

# 6. Notifications

Residents should receive notifications before allocation changes.

Initial Version:

* Email Notifications

Future Version:

* WhatsApp Notifications

Notification Timing:

* 24 Hours Before Allocation Change
* On Allocation Change

---

# 7. Dashboard Features

Resident Dashboard:

* Current Parking Status
* Current Rotation
* Allocation Balance
* Allocation History
* Next Allocation Status

Administrator Dashboard:

* Society Statistics
* Active Allocations
* Allocation Balance Report
* Rotation Management
* Resident Management

---

# 8. Non-Functional Requirements

Performance:

* Dashboard load time below 3 seconds

Scalability:

* Support at least 100 flats

Availability:

* Cloud-hosted and accessible online

Security:

* JWT Authentication
* Password Hashing
* Role-Based Access Control

Reliability:

* Allocation calculations must be deterministic and auditable

Maintainability:

* Modular architecture
* API documentation
* Git-based development workflow

---

# 9. Future Scope

Future releases may include:

* Vacation Mode
* WhatsApp Integration
* Visitor Parking Management
* Parking Analytics
* QR-Based Verification
* Mobile Application
* Multi-Society Support

---

# 10. Success Criteria

The project will be considered successful when:

* Parking allocation is automated
* Residents can view their status online
* Allocation fairness is maintained automatically
* Notifications are delivered successfully
* The system can operate continuously without manual scheduling
