# Samadhan Setu (समाधान सेतु) MVP
> **Societal Challenges Crowdsourcing & Collaboration Platform**

Samadhan Setu is a full-stack crowdsourcing platform designed to bridge community problems with institutional solutions and transparent administrative governance.

---

## 🌟 Core Features & End-to-End Status Flow

The platform strictly enforces the 5-stage challenge lifecycle:

```
[Pending]  →  [Open]  →  [Under Review]  →  [In Progress]  →  [Resolved]
```

1. **Citizen Portal**: Report local issues with category, location details, and photo evidence. Track submission lifecycle in real time.
2. **Community Voting & Feedback**: One vote per registered user per challenge + interactive community discussion thread.
3. **Institutional Proposals**: Academic institutions & industry partners submit technical implementation plans, illustrative budget estimates (`₹18,000 (illustrative)`), and timelines.
4. **Admin Moderation & Assignment**: Moderate new challenges, evaluate submitted proposals, assign selected partners, and verify progress evidence to mark issues as **Resolved**.
5. **Execution Progress Updates**: Institutions post ongoing ground progress with photo evidence.

---

## 👥 Pre-seeded Demo Accounts

Use these one-click credentials on the login screen or sign in manually:

| Role | Email | Password | Organization / Details |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@samadhan.org` | `password123` | Samadhan Setu Core Administration |
| 🏫 **Institution** | `inst@nitdumka.edu.in` | `password123` | NIT Dumka Innovation & Rural Tech Cell |
| 👤 **Citizen** | `citizen@samadhan.org` | `password123` | Ramesh Kumar |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Local MongoDB running on `mongodb://127.0.0.1:27017/samadhan_setu` **OR** zero setup needed (automatically connects to embedded `MongoMemoryServer` if local MongoDB is offline).

### Installation & Launch

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   # Server runs at http://localhost:5000
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Web UI runs at http://localhost:3000
   ```

---

## 📂 Project Architecture

```
samadhan-setu/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection + MongoMemoryServer fallback
│   ├── controllers/
│   │   ├── authController.js     # JWT Registration & Login
│   │   ├── challengeController.js# Challenge CRUD, Voting, Comments
│   │   ├── proposalController.js # Institutional Proposals & Admin Selection
│   │   ├── progressController.js # Progress updates with file upload
│   │   └── adminController.js    # Metric counts & statistics
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── upload.js             # Multer disk storage config
│   ├── models/
│   │   ├── User.js               # User schema with roles (citizen, institution, admin)
│   │   ├── Challenge.js          # Challenge schema & status history audit log
│   │   ├── Proposal.js           # Institutional proposals schema
│   │   ├── Comment.js            # Challenge comments schema
│   │   ├── Vote.js               # Unique compound index voting schema
│   │   └── ProgressUpdate.js     # Progress updates & evidence schema
│   ├── routes/                   # Express API endpoints
│   ├── uploads/                  # Local storage directory for images
│   ├── seed.js                   # Pre-populates pilot challenge & demo accounts
│   ├── server.js                 # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar & user role badge
│   │   │   ├── ChallengeCard.jsx # Challenge card display
│   │   │   ├── StatusTimeline.jsx# 5-stage status progress timeline
│   │   │   └── ProtectedRoute.jsx# Role-based route guard
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Public challenge feed & filtering
│   │   │   ├── Login.jsx             # Authentication & demo quick login
│   │   │   ├── Register.jsx          # Role registration
│   │   │   ├── CreateChallenge.jsx   # Citizen problem reporting form
│   │   │   ├── ChallengeDetail.jsx   # Single challenge hub (Timeline, Proposals, Progress)
│   │   │   ├── AdminDashboard.jsx    # Moderation & stats dashboard
│   │   │   ├── InstitutionDashboard.jsx # Open opportunities & active progress
│   │   │   └── MyChallenges.jsx      # Citizen's reported submissions
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth context & JWT token management
│   │   ├── services/
│   │   │   └── api.js            # Axios client with bearer token interceptor
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🛠️ Verification & Test Flow

1. Open `http://localhost:3000` in your browser.
2. Click **One-Click Demo Logins** → **Citizen**.
3. Go to **Report Challenge** and submit a new issue.
4. Switch account → **Admin**. Open **Admin Dashboard** and click **Approve (Open)**.
5. Switch account → **Institution**. Open **Institution Portal**, select the open challenge, and submit a proposal (`₹18,000 (illustrative)`).
6. Switch account → **Admin**. View the challenge, click **Select & Assign Proposal** (moves status to **In Progress**).
7. Switch account → **Institution**. Post a progress update with photo evidence.
8. Switch account → **Admin**. Click **Verify & Mark Resolved** (moves status to **Resolved**).
9. View the visual **Status Lifecycle Timeline** on the challenge detail page to view the complete timestamped audit log!
