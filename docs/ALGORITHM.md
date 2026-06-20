# ParkFair Allocation Algorithm

## 1. Purpose

This document defines the parking allocation logic used by ParkFair.

The objective is to:

* Maintain fair parking distribution
* Minimize manual intervention
* Automatically correct allocation imbalances
* Support continuous operation for unlimited cycles

---

# 2. Definitions

## Covered Parking

Parking inside the society's protected parking area.

Status:

```text
INSIDE
```

---

## Uncovered Parking

Parking outside the covered parking area.

Status:

```text
OUTSIDE
```

---

## Allocation Balance

Allocation Balance measures the difference between:

* Actual covered parking received
* Ideal covered parking entitlement

Formula:

Balance = ActualInsideDays - IdealInsideDays

Interpretation:

Balance > 0

Resident received more covered parking than expected.

Balance < 0

Resident received less covered parking than expected.

Balance = 0

Perfect fairness.

---

# 3. Base Rotation Model

The society may maintain a predefined rotation structure.

Example:

Total Flats = 14

Covered Parking = 8

Outside Parking = 6

Rotation Duration = 10 Days

Cycle Duration = 140 Days

The predefined rotation acts as the initial schedule.

The system may modify this schedule to restore fairness.

---

# 4. Ideal Allocation Formula

For any date:

IdealInsideDays =
(TotalElapsedDays × CoveredParkingSlots)
÷
TotalActiveFlats

Example:

Elapsed Days = 140

Covered Slots = 8

Active Flats = 14

IdealInsideDays = 80

Every flat should receive approximately 80 inside days.

---

# 5. Balance Calculation

For every flat:

Balance =
ActualInsideDays - IdealInsideDays

Example:

ActualInsideDays = 85

IdealInsideDays = 80

Balance = +5

Meaning:

The resident has received 5 extra covered parking days.

---

Example:

ActualInsideDays = 75

IdealInsideDays = 80

Balance = -5

Meaning:

The resident deserves 5 additional covered parking days.

---

# 6. Allocation Priority

Before generating a new allocation:

All active flats are ranked.

Priority Formula:

Priority = -Balance

Lowest balance receives highest priority.

Example:

| Flat | Balance |
| ---- | ------- |
| 101  | +5      |
| 102  | +2      |
| 103  | 0       |
| 104  | -3      |
| 203  | -6      |

Priority Order:

203
104
103
102
101

---

# 7. Allocation Generation

Step 1

Calculate balances for all active flats.

Step 2

Sort flats by balance ascending.

Step 3

Allocate INSIDE status to the highest-priority residents.

Step 4

Allocate OUTSIDE status to remaining residents.

Step 5

Store allocation records.

Step 6

Generate notifications.

---

# 8. Self-Healing Fairness

The algorithm automatically compensates for unfair allocations.

Example:

Flat 101 remains INSIDE for 5 extra days.

Balance increases.

Future allocations naturally reduce INSIDE assignments for Flat 101.

No manual correction is required.

The system continuously converges toward fairness.

---

# 9. Rotation Preservation Rule

Version 1 should preserve society expectations.

Therefore:

Base Rotation Weight = 70%

Balance Correction Weight = 30%

The generated schedule should remain visually similar to the existing rotation system while gradually correcting imbalances.

Future versions may allow administrators to adjust these weights.

---

# 10. Allocation History

Every allocation change must be recorded.

Fields:

* Flat Number
* Previous Status
* New Status
* Effective Date
* Generated Reason

Generated Reason Values:

* ROTATION
* BALANCE_CORRECTION
* ADMIN_OVERRIDE

---

# 11. Notifications

24 hours before allocation change:

Generate reminder notification.

Example:

Current Status:
INSIDE

Upcoming Status:
OUTSIDE

Effective Date:
20 July 2026

---

On allocation date:

Generate allocation confirmation notification.

---

# 12. Future Vacation Mode

Residents may declare absence periods.

Vacation Rules:

* Vacation days do not affect fairness calculations.
* Residents do not gain allocation advantage.
* Residents do not lose allocation entitlement.

The scheduler treats vacation periods as neutral.

---

# 13. Future Multi-Vehicle Support

Version 1:

Fairness is calculated per flat.

Future versions:

Fairness may be calculated per vehicle.

The database design already supports this migration.

---

# 14. Success Criteria

The algorithm is considered successful if:

* Allocation balances trend toward zero.
* No resident receives long-term unfair advantage.
* The system operates automatically.
* Manual corrections remain rare.
* Allocation history remains fully auditable.
