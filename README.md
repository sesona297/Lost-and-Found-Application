# Uni Lost & Found

A university lost-and-found app for reporting and searching for items, submitting claims, and staff review.

## Requirements

- Node.js 20 or later
- MySQL 8 or later

## Setup

1. Install frontend dependencies from the project root:

   ```powershell
   npm install
   ```

   Install the API dependencies as well:

   ```powershell
   npm install --prefix server
   ```

2. Create the MySQL database and tables from the project root:

   ```powershell
   Get-Content server/schema.sql | mysql -u root -p
   ```

   This creates `lost_and_found_db`, the required tables, and the Bellville, District Six, Mowbray, and Wellington campuses. The MySQL account must be allowed to create databases and tables.

3. Copy `server/.env.example` to `server/.env` and set the connection values for your MySQL installation. The defaults are for local MySQL with user `root` and database `lost_and_found_db`.

If the database already exists, do not rerun the complete schema over it. Apply `server/migrations/20261005_add_handover_workflow.sql` once in MySQL Workbench to add linked finder reports and staff receipt/return tracking. For a new database, use `server/schema.sql` instead; it already includes these changes.

4. Start the API and frontend in separate terminals from the project root:

   ```powershell
   npm run dev:server
   npm run dev
   ```

   The API is at `http://localhost:5000` and the Vite frontend is at `http://localhost:5173`. Check the database connection at `http://localhost:5000/api/health`.

On first server startup, a local demo staff account is created if absent: staff number `STAFF001`, password `admin1234`. Change this password and set a private `JWT_SECRET` in `server/.env` before exposing the app beyond local development.

## Scripts

- `npm run dev` starts the Vite frontend.
- `npm run dev:server` starts the API with Node watch mode.
- `npm run build` builds the frontend.
- `npm run typecheck` checks the TypeScript app.
- `npm run start:server` starts the API without watch mode.

The MySQL API supports student registration/login, staff login, item search and reporting, claims, profile updates, and the staff dashboard, item management, claim review, user list, and audit log. Item images currently use an image URL; a storage provider must be configured separately for uploading image files.

Lost-item finder reports remain linked to the original report. A staff member must confirm receipt before the item is marked FOUND and can be claimed. Approved claims move to CLAIMED; staff records the physical handover to the approved claimant to mark the item RETURNED.