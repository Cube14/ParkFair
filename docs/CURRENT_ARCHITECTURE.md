# Current architecture

## Repository baseline

The workspace was clean on `frontend-setup` at `64c340152faad02463806125fe4064c121cbece6`. `git ls-remote --heads origin` matched local refs. `main` at `4daedbc` contains README, license and ignore rules. `develop` at `a64e5a2` has an early API spec. `feature/backend-setup` at `b010478` is an earlier UI milestone. Phase 1 work is on local `feature/parkfair-2.0-foundation`.

Independent npm manifests and lockfiles govern backend, frontend and mobile. The root `mongodb` dependency has no observed application entry point. The pre-existing SRS, database, algorithm and API guides capture intent. The new [API inventory](API_INVENTORY.md) reflects the implementation.

## Runtime and execution paths

| Surface | Execution |
| --- | --- |
| Web bootstrap | React/Vite/Tailwind with React Router, Framer Motion, Lottie and Lucide. main mounts Auth, Cycle and Theme providers. App defines public auth, admin and nested resident routes. Axios attaches the browser bearer token. |
| Login | Inputs and submit ? AuthContext ? auth service ? Axios ? Express ? User/Flat lookup and bcrypt ? JWT ? role redirect. Startup calls auth/me. Browser bearer state, theme and settings are local. |
| Dashboard and layout | Dashboard mount loads aggregates. CycleSelector sets CycleContext. ParkingLayout observes it, fetches the cycle matrix and renders assigned slots. |
| Admin cycles | Mount lists cycles. Modal/create/activate/complete/clone/delete callbacks write then reload. Clone uses the source ID and copies its active assignments transactionally. |
| Flats and accounts | Loads flats and vehicles, searches and opens edit/account modals. Saves flat details, toggles flat status, or manages resident credentials through admin-only auth routes. |
| Vehicle management | Loads flats and vehicles, filters, opens create/edit forms, saves or deletes and refreshes. |
| Assignment management | Loads assignment, flat, cycle, slot and vehicle lists. Flat selection filters vehicle options. Save creates or changes slot. Delete and reset are separate. Transactional writes validate capacity and flat uniqueness. |
| Analytics and settings | Analytics aggregates list endpoints in React. Settings toggle browser-local preferences. |
| Resident | Layout mounts the header, sidebar and bottom nav. Dashboard calls residentService ? current cycle ? scope query by signed-in flat ? populate assigned vehicle/slot ? dashboard cards. Other resident routes are shells. |
| API and notification boundary | Express mounts routers, validates inputs and roles, calls controllers, and returns sanitized errors. Mongoose persists state. A shared cycle helper selects the current cycle for dashboard, occupancy and notifications. WhatsApp is lazy, with no durable inbox or delivery worker. |
| Mobile | Expo Router groups use the same Express API, role-aware navigation, SecureStore and per-account query keys. |

## Database models

| Model | Use |
| --- | --- |
| User | Unique username, bcrypt hash, resident/admin role, active status and optional Flat. Internal session version defaults logically to zero for old records. |
| Flat | Unique flat number, owner/contact fields and activity. Referenced by users, vehicles, assignments, allocations and ledger. |
| Vehicle | Unique vehicle number, type, activity and Flat reference. |
| ParkingSlot | Unique slot number, side and type, capacity, order and activity. |
| ParkingCycle | Unique name, dates, duration and planned/active/completed state. Internal revision serializes assignment writes per cycle. |
| ParkingAssignment | References cycle, flat, vehicle and slot. Stores parking type, status and notes. Represents physical placement. |
| Rotation | Unique rotation number and dates for the independent fairness implementation. |
| Allocation | Fairness result linked to one rotation, flat and vehicle. It carries dates and parking type without a physical slot. |
| CreditLedger | Per-flat inside/outside counts, balance score and last reason. |

## Remaining inconsistencies

- The fairness implementation generates only rotation 1 and uses eight inside positions and ten days. Its unit and sign differ from the documented actual-versus-ideal day formula. It operates independently of the physical placement lifecycle.
- The matrix and occupancy use stored slot capacities. The main web layout still draws the society?s established sides and slot positions. A configurable layout needs an agreed floor plan and rendering model.
- Cycle activation completes previous active cycles and updates the target in a transaction. Concurrent activation of distinct targets with no common prior active cycle can still race. Overlaps are resolved deterministically on reads. A transactional publishing transition and database invariants remain.
- Flat/vehicle deletion and reassignment check existing references. Independent concurrent relation writes still need a common ownership policy. Clone copies existing data and may carry legacy inconsistencies.
- Duplicate auth guard components exist. App uses `components/ProtectedRoute.jsx`. The old account-activation mock is not mounted. Review obsolete diagnostics, dead assets and fixtures before removal.
