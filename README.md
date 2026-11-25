# LeadFlow – Lead Management System

A full-stack MERN application to manage potential customers, track lead status, and organize follow-ups.

## Features
- User registration, login, and logout using JWT authentication.
- Password hashing with bcrypt.
- Dashboard statistics: total, new, contacted, and converted leads.
- Create, view, update, and delete leads.
- Lead statuses: New, Contacted, Interested, Converted, Lost.
- Search by name, email, company, or phone.
- Filter by status and export the currently displayed leads to CSV.
- Input validation, protected routes, and API error handling.
- Responsive React dashboard.

## Technology
- Frontend: React 18, Vite, CSS, Axios, Lucide React
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JSON Web Token and bcryptjs

## Project structure
```text
lead-management-system/
├── backend/
│   ├── src/
│   │   ├── middleware/auth.js
│   │   ├── models/Lead.js
│   │   ├── models/User.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       └── leadRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Prerequisites
Install:
1. Node.js (LTS) and npm.
2. MongoDB Community Server running locally, or create a MongoDB Atlas cluster.
3. Visual Studio Code (recommended).

Check Node and npm:
```bash
node -v
npm -v
```

## Setup and installation

### 1. Backend
Open a terminal in the project root:
```bash
cd backend
npm install
```
Create a `.env` file by copying `.env.example`. On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```
Edit `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
For local MongoDB, the example URI is:
`mongodb://127.0.0.1:27017/lead_management`

Start the backend:
```bash
npm run dev
```
API runs at `http://localhost:5000`.

### 2. Frontend
Open a second terminal at the project root:
```bash
cd frontend
npm install
```
Create frontend environment file:
```powershell
Copy-Item .env.example .env
```
Run:
```bash
npm run dev
```
Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## First use
1. Ensure MongoDB is running.
2. Start backend and frontend in separate terminals.
3. Open `http://localhost:5173`.
4. Select **Create account**, register a user, then sign in.
5. Add leads using **Add new lead**.

## REST API endpoints
All lead endpoints require this header:
`Authorization: Bearer <JWT_TOKEN>`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/health` | API health check |
| GET | `/api/leads` | Get leads; supports `?search=` and `?status=` |
| GET | `/api/leads/stats` | Dashboard counts |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |

Example lead JSON:
```json
{
  "fullName": "Alex Morgan",
  "email": "alex@example.com",
  "phone": "+91 98765 43210",
  "company": "Acme Pvt Ltd",
  "source": "Website",
  "status": "New"
}
```

## Architecture
The React frontend sends HTTP requests through Axios to the Express REST API. Express validates incoming data and checks the JWT middleware for protected lead routes. Mongoose reads and writes lead and user documents in MongoDB. Each lead is associated with the account that created it, so users only access their own leads. Passwords are hashed before storage; JWT tokens are used to authenticate API requests.

## Screenshots
After running the application, capture:
- Login / registration screen.
- Dashboard with the four statistic cards.
- Lead table with sample records and status labels.
- Add/Edit Lead form.
Save screenshots in a folder named `screenshots/` before submitting your GitHub repository.

## Deployment notes
- Deploy the backend to Render or another Node.js hosting service.
- Use MongoDB Atlas for the hosted database.
- Deploy the frontend to Vercel or Netlify.
- Set backend environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`) in the hosting dashboard.
- Set frontend `VITE_API_URL` to the deployed backend API base URL, for example `https://your-api-domain.com/api`.
- Update `CLIENT_URL` to the deployed frontend origin.
- Never commit `.env` files or production secrets.

## Notes
This is a starter project for learning and assessment purposes. For production, add rate limiting, stronger password policy, email verification, refresh-token/session strategy, audit logging, pagination, and automated tests.
