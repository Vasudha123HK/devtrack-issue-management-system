# DevTrack — Software Issue & Task Management System

![DevTrack Banner](https://raw.githubusercontent.com/antigravity/assets/main/devtrack-banner.png)

> **DevTrack** is a production-ready, full-stack MERN software issue and task management platform designed for modern agile engineering teams. It provides robust JWT authentication, role-based authorization (Admin & Developer), real-time aggregated MongoDB analytics, dynamic issue workflows with priority & status triaging, debounced search & multi-filtering, and collaborative discussion threads.

---

## 🌟 Key Features

* 🔐 **Authentication & Security**
  * Secure user registration and login with **JWT (JSON Web Tokens)** and **bcrypt** password hashing.
  * Role-Based Access Control (**RBAC**): Separate permissions for **Admin** and **Developer** roles.
  * Server-side route guards and authorization middleware protecting sensitive operations.
  * Security headers via **Helmet** and cross-origin resource sharing configured with **CORS**.
* 📋 **Issue & Task Lifecycle Management**
  * Complete CRUD (Create, Read, Update, Delete) capabilities for software issues.
  * Status workflow: `Open` ➔ `In Progress` ➔ `Resolved`.
  * Priority severity levels: `Low`, `Medium`, `High`.
  * Developer assignment and re-assignment workflows.
* 💬 **Collaborative Discussion Threads**
  * Real-time threaded comments with author metadata and relative timestamps.
  * Permission-controlled comment deletion (comment author or Admin).
* 🔍 **Multi-Filter & Debounced Search**
  * Instant debounced search querying issue titles and descriptions on the backend.
  * Multi-dimensional filtering by Status, Priority, and Assigned Developer.
  * Grid and Table layout toggles.
* 📊 **MongoDB-Powered Analytics Dashboard**
  * Dynamic statistics calculated directly via MongoDB aggregations: Total Issues, Open, In Progress, Resolved, and High Priority counts.
  * Visual progress bars for status and priority distributions.
  * Developer workload monitoring (personal assigned tasks overview).
* 👥 **Team Directory & Role Administration**
  * Admin workspace to view all engineering staff and monitor individual workloads.
  * In-place role promotion/demotion (Developer ⇄ Admin).
* 🎨 **Clean SaaS UI / UX**
  * Tailored with Tailwind CSS using an Indigo/Slate design palette, micro-interactions, responsive mobile drawers, and accessible confirmation modals.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, JavaScript (ES6+), Tailwind CSS, React Router v6, Axios, Lucide React |
| **Backend** | Node.js, Express.js, express-validator, Helmet, CORS, Morgan |
| **Database** | MongoDB, Mongoose ODM |
| **Auth & Security** | JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`) |
| **API Architecture** | RESTful API |
| **Build & Tooling** | Vite, Concurrently, Nodemon |

---

## 📁 Project Structure

```text
devtrack-issue-management-system/
│
├── client/                               # Frontend React Application
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── AdminRoute.jsx            # Admin role route guard
│   │   │   ├── CommentSection.jsx        # Issue discussion comments
│   │   │   ├── ConfirmModal.jsx          # Deletion confirmation dialog
│   │   │   ├── DashboardCard.jsx         # Metric summary card
│   │   │   ├── EmptyState.jsx            # Empty list placeholder
│   │   │   ├── ErrorMessage.jsx          # Error banner alert
│   │   │   ├── IssueCard.jsx             # Grid card view
│   │   │   ├── IssueForm.jsx             # Create/Edit issue form
│   │   │   ├── IssueTable.jsx            # Data table view
│   │   │   ├── LoadingSpinner.jsx        # Skeletons and spinners
│   │   │   ├── Navbar.jsx                # Top navigation header
│   │   │   ├── PriorityBadge.jsx         # Priority pill badge
│   │   │   ├── ProtectedRoute.jsx        # Authentication route guard
│   │   │   ├── Sidebar.jsx               # Left workspace navigation
│   │   │   └── StatusBadge.jsx           # Status indicator badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global authentication state
│   │   ├── hooks/
│   │   │   ├── useAuth.js                # Auth context hook
│   │   │   └── useDebounce.js            # Debounce hook for searches
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx             # Authenticated workspace layout
│   │   │   └── AuthLayout.jsx            # Login/Register layout
│   │   ├── pages/
│   │   │   ├── CreateIssue.jsx           # Ticket creation view
│   │   │   ├── Dashboard.jsx             # Analytics dashboard view
│   │   │   ├── EditIssue.jsx             # Ticket modification view
│   │   │   ├── IssueDetails.jsx          # Single ticket details & comments
│   │   │   ├── Issues.jsx                # Ticket list with filters & search
│   │   │   ├── Login.jsx                 # User sign-in
│   │   │   ├── NotFound.jsx              # 404 page
│   │   │   ├── Profile.jsx               # User profile & my assigned tasks
│   │   │   ├── Register.jsx              # User registration
│   │   │   └── Users.jsx                 # Admin team directory
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance with interceptors
│   │   │   ├── authService.js            # Auth API calls
│   │   │   ├── commentService.js         # Comment API calls
│   │   │   ├── dashboardService.js       # Dashboard stats API calls
│   │   │   ├── issueService.js           # Issue API calls
│   │   │   └── userService.js            # User management API calls
│   │   ├── utils/
│   │   │   ├── constants.js              # Enums and styling configs
│   │   │   └── formatters.js             # Date and string formatters
│   │   ├── App.jsx                       # Route tree
│   │   ├── index.css                     # Tailwind CSS entry
│   │   └── main.jsx                      # React DOM mount point
│   ├── index.html                        # HTML template
│   ├── package.json                      # Frontend dependencies
│   ├── tailwind.config.js                # Tailwind configuration
│   ├── vite.config.js                    # Vite configuration & API proxy
│   └── .env.example                      # Client environment variables
│
├── server/                               # Backend Express & Node REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB connection via Mongoose
│   │   ├── controllers/
│   │   │   ├── authController.js         # Register, login, getMe
│   │   │   ├── commentController.js      # Add, list, delete comments
│   │   │   ├── dashboardController.js    # Aggregated MongoDB metrics
│   │   │   ├── issueController.js        # Issue CRUD, search & filters
│   │   │   └── userController.js         # Team directory & role updates
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js         # JWT verification middleware
│   │   │   ├── errorMiddleware.js        # Centralized 404 and error handler
│   │   │   ├── roleMiddleware.js         # Role authorization middleware
│   │   │   └── validateMiddleware.js     # express-validator rules
│   │   ├── models/
│   │   │   ├── Comment.js                # Mongoose Comment model
│   │   │   ├── Issue.js                  # Mongoose Issue model
│   │   │   └── User.js                   # Mongoose User model with bcrypt
│   │   ├── routes/
│   │   │   ├── authRoutes.js             # /api/auth endpoints
│   │   │   ├── commentRoutes.js          # /api/comments endpoints
│   │   │   ├── dashboardRoutes.js        # /api/dashboard endpoints
│   │   │   ├── issueRoutes.js            # /api/issues endpoints
│   │   │   └── userRoutes.js             # /api/users endpoints
│   │   ├── utils/
│   │   │   ├── generateToken.js          # JWT signing utility
│   │   │   └── seeder.js                 # Realistic seed database script
│   │   ├── app.js                        # Express app setup & middleware
│   │   └── server.js                     # HTTP server entry point
│   ├── package.json                      # Backend dependencies
│   └── .env.example                      # Server environment variables
│
├── .gitignore                            # Git ignore configuration
├── package.json                          # Root scripts orchestrator
└── README.md                             # Comprehensive documentation
```

---

## 🖼️ Application Screenshots

> *Add screenshots of your running instance below:*

| Dashboard Analytics | Issue Management & Filters |
| :---: | :---: |
| ![Dashboard Overview](https://raw.githubusercontent.com/antigravity/assets/main/devtrack-dashboard-placeholder.png) | ![Issues List](https://raw.githubusercontent.com/antigravity/assets/main/devtrack-issues-placeholder.png) |

| Issue Details & Comments | Team Member Administration |
| :---: | :---: |
| ![Issue Details](https://raw.githubusercontent.com/antigravity/assets/main/devtrack-details-placeholder.png) | ![Team Management](https://raw.githubusercontent.com/antigravity/assets/main/devtrack-users-placeholder.png) |

---

## ⚙️ Environment Variables

### Backend Configuration (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/devtrack_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min32chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

| Variable | Description |
| :--- | :--- |
| `PORT` | Port number on which the Express server listens (default: `5000`). |
| `MONGODB_URI` | MongoDB connection string (Local MongoDB URI or MongoDB Atlas URI). |
| `JWT_SECRET` | Secret key used for signing and verifying JSON Web Tokens. |
| `JWT_EXPIRES_IN` | Token lifespan duration (e.g., `7d`, `24h`). |
| `CLIENT_URL` | Frontend origin URL allowed by CORS policies. |
| `NODE_ENV` | Environment mode (`development` or `production`). |

### Frontend Configuration (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Base REST API endpoint URL consumed by the Axios client. |

---

## 🚀 Running Locally

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/devtrack-issue-management-system.git
cd devtrack-issue-management-system

# Install all dependencies (root, backend, and frontend)
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment Files

```bash
# Backend environment setup
cp server/.env.example server/.env

# Frontend environment setup
cp client/.env.example client/.env
```

### 3. Seed Demo Data (Optional but Recommended)

Populate the database with sample users (Admin and Developers), categorized issues, and discussion comments:

```bash
npm run seed
```

**Pre-configured Seed Accounts:**
* **Admin Account:** `admin@devtrack.io` / `Password123!`
* **Developer Account 1:** `alex@devtrack.io` / `Password123!`
* **Developer Account 2:** `elena@devtrack.io` / `Password123!`
* **Developer Account 3:** `marcus@devtrack.io` / `Password123!`

### 4. Start the Application

Run both frontend and backend concurrently with a single command:

```bash
npm run dev
```

* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`
* **API Health Check:** `http://localhost:5000/api/health`

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |

### Issues (`/api/issues`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/issues` | Private | Get issues with search, filter (`status`, `priority`, `assignedTo`), and pagination |
| `POST` | `/api/issues` | Private | Create a new issue |
| `GET` | `/api/issues/:id` | Private | Get detailed issue information by ID |
| `PUT` | `/api/issues/:id` | Private | Update issue status, priority, description, or assignee |
| `DELETE` | `/api/issues/:id` | Private | Delete issue and associated comments (Admin or Creator) |

### Comments (`/api/comments` & nested)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/issues/:id/comments` | Private | List all comments for an issue |
| `POST` | `/api/issues/:id/comments` | Private | Add a comment to an issue |
| `DELETE` | `/api/comments/:id` | Private | Delete a comment (Author or Admin) |

### Users & Administration (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Private | List all team members with issue workload counts |
| `GET` | `/api/users/:id` | Private | Get user details and assigned/created issue lists |
| `PUT` | `/api/users/:id/role` | Admin | Update user role (`Admin` ⇄ `Developer`) |

### Dashboard Analytics (`/api/dashboard`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Private | Return live MongoDB aggregated project metrics |

---

## 🔒 Role Authorization Matrix

| Capability | Admin | Developer |
| :--- | :---: | :---: |
| View Dashboard & Live Analytics | ✅ | ✅ |
| View All Issues | ✅ | ✅ |
| Search & Filter Issues | ✅ | ✅ |
| Create New Issues | ✅ | ✅ |
| Update Any Issue Field | ✅ | ⚠️ (Own/Assigned) |
| Change Issue Status | ✅ | ✅ |
| Delete Issues | ✅ | ⚠️ (Creator only) |
| Post Discussion Comments | ✅ | ✅ |
| Delete Any Comment | ✅ | ❌ (Own only) |
| View Team Directory | ✅ | ❌ |
| Change Member Roles | ✅ | ❌ |

---

## 🚀 Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write privileges.
3. Allow network access (`0.0.0.0/0` or deployment server IP).
4. Copy the connection URI: `mongodb+srv://<username>:<password>@cluster.mongodb.net/devtrack_db?retryWrites=true&w=majority`.

### 2. Backend: Render / Railway
1. Push repository to GitHub.
2. Create a new **Web Service** on Render/Railway.
3. Configure settings:
   * **Root Directory:** `server`
   * **Build Command:** `npm install`
   * **Start Command:** `node src/server.js`
4. Set Environment Variables:
   * `PORT=5000`
   * `MONGODB_URI=<Your MongoDB Atlas URI>`
   * `JWT_SECRET=<Random 32+ character string>`
   * `CLIENT_URL=<Your Vercel Frontend URL>`
   * `NODE_ENV=production`

### 3. Frontend: Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Configure settings:
   * **Root Directory:** `client`
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. Set Environment Variable:
   * `VITE_API_URL=https://<your-render-service>.onrender.com/api`
4. Deploy!

---

## 🔮 Future Enhancements

- 📎 File attachments & screenshot uploads for issue reports (S3 / Cloudinary).
- 🏷️ Custom project tags, milestones, and sprint boards.
- 🔔 Real-time email / webhook notifications for issue assignments.
- 📊 Advanced Gantt chart and burndown velocity metrics.
- 📥 Export issue audit reports to PDF and CSV formats.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
