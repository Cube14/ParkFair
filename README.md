# ParkFair

ParkFair manages residential parking cycles, physical assignments and resident access. The web application and the Expo mobile scaffold use the same Express/MongoDB API.

## Local development

Use Node 24 and run `npm ci` in each package you need. Start the isolated replica set with `docker compose -f infrastructure/compose.dev.yml up -d --wait`. Copy `backend/.env.example` to `backend/.env.development` and set a development-only JWT secret of at least 32 bytes. Start the API with `npm run dev --prefix backend` and the web app with `npm run dev --prefix frontend`.

See [DevOps setup](docs/DEVOPS_PLAN.md) for configuration and fixture tests, [mobile setup](mobile/README.md) for Expo, and [development status](docs/DEVELOPMENT_STATUS.md) for verification and remaining work.
