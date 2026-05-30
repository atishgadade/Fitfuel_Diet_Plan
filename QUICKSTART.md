# Fit-Fuel Quickstart Guide
This guide covers everything you need to know to boot up the **Fit-Fuel** application locally, including its React frontend, Node.js API Gateway, and Python ML Microservice.

## 📋 Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18 or higher) — For running the Vite frontend and Express server.
- **Python** (v3.13 or higher) — For the ML recommendation service.
- **Firebase Service Account Key** — Required for the database connection.

---

## ⚙️ 1. Environment Configuration

The application uses a unified `.env` file at the root of the project to manage configurations across all services.

1. Ensure the `.env` file exists at `D:\FitFuel\.env`.
2. It should contain the following settings:
   ```env
   # --- Node.js Express Gateway ---
   PORT=4000
   ML_SERVICE_URL=http://localhost:8000

   # --- Python ML Microservice ---
   FIREBASE_CREDENTIALS_PATH=./fitfuel-ml-service/serviceAccountKey.json
   CALORIENINJAS_API_KEY=your_api_key_here
   ML_SERVICE_PORT=8000
   LOG_LEVEL=INFO
   ```
3. **Important:** Place your Firebase service account JSON file at `D:\FitFuel\fitfuel-ml-service\serviceAccountKey.json`.

---

## 🚀 2. Booting the Services

Fit-Fuel operates with three distinct services that need to run concurrently. Open three separate terminal windows.

### Terminal 1: Python ML Microservice (Port 8000)
This service handles all the intelligent meal plan recommendations and macro extraction.

```powershell
cd D:\FitFuel\fitfuel-ml-service
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
*Wait until you see `Application startup complete.`*

### Terminal 2: Node.js API Gateway (Port 4000)
This Express server proxies the ML traffic and handles server-side authentication validation.

```powershell
cd D:\FitFuel\server
npm install   # (Only needed the first time)
node index.js
```
*Wait until you see `Gateway running on port 4000`.*

### Terminal 3: React Vite Frontend (Port 5174/5173)
This is the user-facing web application.

```powershell
cd D:\FitFuel\client
npm install   # (Only needed the first time)
npm run dev
```
## 🌐 3. Accessing the Application

Once all three terminals are running without errors:
1. Open your web browser.
2. Navigate to **http://localhost:5174/** (or the port specified by Vite in Terminal 3).
3. You can now log in, take the assessment, and receive ML-powered meal recommendations!

---

## 🛠️ Troubleshooting

- **"Failed to fetch" or "Network Error":** Ensure all three services are running. Check the Node.js console (Terminal 2) to see if it's successfully proxying requests to the ML service (Terminal 1).
- **Vite Dependency Errors:** If Vite fails to start complaining about dependencies, run `npm install` again in the `D:\FitFuel\client` directory.
- **Python Module Errors:** If Python fails to start complaining about missing modules, ensure you have run `pip install -r requirements.txt` inside the `fitfuel-ml-service` directory.
- **Firebase Errors:** Ensure `serviceAccountKey.json` is placed exactly at `fitfuel-ml-service/serviceAccountKey.json`.
