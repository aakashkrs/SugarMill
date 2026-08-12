# Sugar Mill Bag Counting & Production Dashboard

Frontend-only React/Vite dashboard with mock data.

## Demo admin login

- Email: `admin@sugarmill.local`
- Password: `Admin@123`

These credentials are for the demo frontend only. They are NOT secure production credentials.

## Run

```bash
npm install
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`.

## Current architecture

The dashboard currently uses mock data from:

`src/data/mockData.js`

API integration is prepared in:

`src/services/api.js`

Later, replace the mock functions in `api.js` with your real backend API calls. The UI components should not need to change.

## Important

The demo login is client-side only. For the real system, use Supabase Auth/backend authentication and server-side authorization. Do not store a real admin password in frontend source code.
