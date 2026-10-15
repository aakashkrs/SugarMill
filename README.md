# Sugar Mill Bag Counting & Production Dashboard

React/Vite dashboard with a local Python RTSP + YOLO detection service. Camera
crossing events and camera service changes are stored in `data/live/camera_events.csv`.
Dashboard totals, rates, charts, belt source status, and alerts are refreshed
from that CSV every two seconds. No historical demo production values are used.

## Demo admin login

- Email: `admin@sugarmill.local`
- Password: `Admin@123`

These credentials are for the demo frontend only. They are NOT secure production credentials.

## Run the live camera dashboard

Use two PowerShell terminals from the repository root. The live model, training
inputs, and training defaults are in `backend/config.py`. The API uses
`artifacts/training/train6/weights/best.pt` by default; set `BEST_PT_PATH` if
your final weights are saved elsewhere. Python dependencies are listed in
`backend/requirements.txt`; frontend dependencies are listed in `package.json`.

Terminal 1, install the Python service dependencies once and start the API:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.api_server:app --host 127.0.0.1 --port 8000
```

Terminal 2, start the React dashboard:

```powershell
cd sugarMill
npm install
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`, log in with the
demo credentials, then enter the camera RTSP URL in **Live Camera Feed**.
Credentials in the RTSP URL are sent to the local API and are not written to
the CSV. Select **Add counting line**, then drag on the video to place it. The
API saves one CSV row for each tracked bag crossing and camera state event; use
**Download CSV** to export it. The RTSP URL field is visible plain text.

The model file must exist before you connect a camera. To change its default,
edit `LIVE_MODEL_PATH` in `backend/config.py`. You can also override its path
for the API process, for example:

```powershell
$env:BEST_PT_PATH = "C:\path\to\best.pt"
python -m uvicorn backend.api_server:app --host 127.0.0.1 --port 8000
```

## Current architecture

The local Python API reads `data/live/camera_events.csv` and aggregates dashboard data.
The React app requests that snapshot through the Vite `/api` proxy.

## Important

The demo login is client-side only. For the real system, use Supabase Auth/backend authentication and server-side authorization. Do not store a real admin password in frontend source code.
