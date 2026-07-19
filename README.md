# Career Tracker (Separated Full-Stack App)

This project has been separated into two distinct directories for better maintainability and cleaner deployments.

## Directory Structure
- **`/frontend`**: The React + Vite application.
- **`/backend`**: The Node.js + Express API server.

## How to Run Locally

You need two terminal windows to run both servers simultaneously.

### 1. Run the Backend API
In your first terminal:
```bash
cd backend
npm install
npm run dev
```
*(The backend runs on `http://localhost:3000`)*

### 2. Run the Frontend App
In your second terminal:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs on `http://localhost:5173` and automatically proxies `/api/*` requests to the backend)*

## Environment Variables
- `frontend/.env` - Used for Vite environment variables (e.g., `VITE_API_BASE_URL`). Leave it blank for local development.
- `backend/.env` - Contains MongoDB strings, JWT secrets, Gemini API keys, and OAuth Client IDs.

## Deployment
- **Frontend (Vercel)**: Set the **Root Directory** in project settings to `frontend`.
- **Backend (Render)**: Set the **Root Directory** in project settings to `backend`. Make sure your Build Command is `npm run build` and Start Command is `npm start`.
