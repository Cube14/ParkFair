# DevOps plan

## Local setup

Use Node 24 and npm. Install with `npm ci` separately under backend, frontend and mobile. Start the dedicated writable MongoDB replica set with `docker compose -f infrastructure/compose.dev.yml up -d --wait`. Its port is bound to loopback and defaults to 27017. Set `PARKFAIR_MONGO_PORT` if an existing service uses that port, and match it in the connection string. Use a separate staging or production deployment with authenticated MongoDB and TLS.

Copy `backend/.env.example` to `backend/.env.development` and supply a fresh local JWT secret of at least 32 bytes. `npm run dev --prefix backend` reads that development file and requires a loopback parkfair_dev database, keeping deployment environment separate. `npm start --prefix backend` reads process environment and optionally `backend/.env`. Leave both WhatsApp flags and fixture resets off for routine work. Run `npm run dev --prefix frontend` for the Vite proxy. Production may route browser and API through the same origin, or set `VITE_API_BASE_URL` and `WEB_ORIGINS` together. Mobile needs a trusted development HTTPS endpoint. DNS, credentials and certificate checks remain separate.

`npm test --prefix backend` always runs the unauthenticated and configuration tests. Set `PARKFAIR_TEST_MONGO_PORT` to a disposable loopback replica-set port for database integration. The suite creates a randomized fixture DB and never consumes the app URI. Dispose of the isolated test container/volume when done. Keep development data in its own named volume. No seed scripts are needed. For a credential-free Atlas connectivity check use `PARKFAIR_ATLAS_HOST` with `node backend/testTLS.js`.

## Delivery and operations

| Concern | Phase 1 and release plan |
| --- | --- |
| API container | The Dockerfile uses a non-root Node 24 runtime, a reproducible lockfile install and readiness probe. Container build skips Puppeteer browser downloads and excludes local sessions and environment files. Boot requires a writable replica set or sharded DB. Verify DB indexes before production, because production Mongoose startup disables auto-creation/indexing. |
| Environments | Use a distinct local fixture, staging cluster/database and production DB with separate least-privilege users and signing secrets. Review unique indexes on username, cycle name and rotation number plus existing data before rollouts. Prefer one API deployment and HTTPS reverse proxy with a same-origin web build. |
| CI | Workflow installs from lockfiles, runs the backend tests against MongoDB 8, builds web, and lints/types/exports native code. The known web lint backlog is reported without blocking other jobs. Upgrade to an enforced lint gate once baseline errors are fixed. Adopt audited action pins, dependency and secret scanning before enabling deployment. |
| Auditing | Run npm audit across all packages and track exceptions by dependency, use and owner. Quickly patch security updates that preserve behavior. Keep the WhatsApp sender off while its remaining transitive advisories and native/browser setup are unverified. Scan Git history and deployment logs in an authorized incident review if credential exposure is suspected. |
| Availability | Use `/api/health` for liveness and `/api/health/ready` for database readiness. Track synthetic readiness, API failures and request latency, and use redacted IDs rather than raw bodies, JWTs or contact information. Define alerting and ownership before release. |
| Backups and rollback | Select encrypted backups and retention based on the society's agreed recovery objectives. Restore into isolated staging, test sample flows with synthetic or authorized data and capture restore times. Retain immutable images, last known release metadata and a backward-compatible DB rollout plan. |
| Mobile release | Start Android with a local development build, then sign Android/iOS builds in approved infrastructure. Protect Android keystores and Apple credentials, use independent environment identifiers and keep secrets out of Expo variables. Roll back via the previous compatible build or controlled update channel. |

The initial target is one society, one API and MongoDB. Add a durable notification outbox inside the same database during publishing work before introducing additional infrastructure.
