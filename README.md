# Customer Management System (CMS)

A production-grade, full-stack Customer Management System built for the Assignment requirements. Features a public landing page with customer registration, separate customer login with self-profile management, and a dedicated Super Admin dashboard with real-time statistics, search, pagination, and account status toggling.

---

## 📋 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Project Architecture](#-project-architecture)
3. [Database Schema](#-database-schema)
4. [Quick Start & Setup Guide](#-quick-start--setup-guide)
   - [Prerequisites](#prerequisites)
   - [MongoDB Setup (Atlas or Local)](#mongodb-setup-atlas-or-local)
   - [Environment Configuration](#environment-configuration)
   - [Running the Application](#running-the-application)
5. [Default Credentials](#-default-credentials)
6. [API Documentation](#-api-documentation)
7. [Features & Acceptance Criteria Checklist](#-features--acceptance-criteria-checklist)

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), React Router DOM (v7), Tailwind CSS, Lucide React Icons, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication & Security**: JSON Web Tokens (JWT), Bcrypt.js (Password Hashing), Express Validator (Input Validation & Sanitization)
- **Architecture**: Decoupled Client-Server REST Architecture

---

## 🏗 Project Architecture

```
customer-management-system/
├── package.json               # Root scripts (concurrently run client & server)
├── README.md                  # Complete setup & API documentation
├── server/                    # Node.js / Express Backend
│   ├── config/
│   │   └── db.js              # Mongoose DB connection
│   ├── controllers/
│   │   ├── authController.js      # Customer Registration, Customer Login, Admin Login
│   │   ├── customerController.js  # Own profile view, profile update, change password
│   │   └── adminController.js     # Stats, paginated customer list, edit, status toggle
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect, adminOnly, customerOnly role guards
│   │   ├── validatorMiddleware.js # Express-validator request schemas
│   │   └── errorMiddleware.js     # Global 404 & error handlers
│   ├── models/
│   │   └── User.js                # Customer & Admin Schema with bcrypt hooks
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── customerRoutes.js      # /api/customer/*
│   │   └── adminRoutes.js         # /api/admin/*
│   ├── utils/
│   │   ├── generateToken.js       # JWT signer utility
│   │   └── seedAdmin.js           # Automated initial Super Admin seeder
│   ├── .env.example               # Backend environment template
│   ├── .env                       # Active environment configuration
│   └── server.js                  # Express application entrypoint
└── client/                    # React (Vite) Frontend
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Pre-configured Axios client with auth interceptors
    │   ├── components/
    │   │   ├── Alert.jsx          # Styled error/success dismissible alerts
    │   │   ├── Navbar.jsx         # Responsive global navigation bar
    │   │   └── ProtectedRoute.jsx # Role-based router guard
    │   ├── context/
    │   │   └── AuthContext.jsx    # User session, login, registration state
    │   ├── pages/
    │   │   ├── LandingPage.jsx        # Landing page with registration form & live validation
    │   │   ├── CustomerLoginPage.jsx  # Customer authentication portal
    │   │   ├── CustomerDashboard.jsx  # Customer profile view, edit, password change
    │   │   ├── AdminLoginPage.jsx     # Super Admin high-security login
    │   │   └── AdminDashboard.jsx     # Admin metrics, customer search, pagination, status toggle
    │   ├── App.jsx                # Route declarations
    │   ├── index.css              # Tailwind CSS directives
    │   └── main.jsx               # React DOM root
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🗄 Database Schema

The database model is defined in [`server/models/User.js`](server/models/User.js) using Mongoose:

| Field | Type | Required | Constraints / Description |
| :--- | :--- | :---: | :--- |
| `name` | String | Yes | Trimmed, 2–100 characters |
| `email` | String | Yes | Unique index, lowercase, trimmed, email regex validated |
| `phone` | String | Yes | Trimmed, phone regex validated |
| `password` | String | Yes | Hashed with Bcrypt (Salt rounds = 10), min 6 characters |
| `address` | String | Yes | Complete physical address |
| `role` | String | Yes | Enum: `'customer'` (default) or `'admin'` |
| `status` | String | Yes | Enum: `'active'` (default) or `'inactive'` |
| `created_at` | Date | Auto | Timestamp of registration (indexed) |
| `updated_at` | Date | Auto | Timestamp of last modification |

> **Security Note**: Password hashes are automatically excluded from all JSON serialized responses via the `toJSON` schema transform method.

---

## 🚀 Quick Start & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher installed)
- [MongoDB](https://www.mongodb.com/) (either a free MongoDB Atlas cloud cluster or local MongoDB)

### MongoDB Setup (Atlas or Local)

#### Option A: MongoDB Atlas (Recommended - Free Cloud DB)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Cluster**.
3. Under **Database Access**, create a database user (e.g., username `admin` and a password).
4. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere).
5. Click **Connect** -> **Drivers** and copy your connection string (format: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/customer_management?retryWrites=true&w=majority`).
6. Paste it into `server/.env` as `MONGO_URI`.

#### Option B: Local MongoDB Service
If you have MongoDB installed locally:
Ensure the service is started (`net start MongoDB` on Windows) and set:
```env
MONGO_URI=mongodb://127.0.0.1:27017/customer_management
```

### Environment Configuration
The file [`server/.env`](server/.env) contains:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/customer_management
JWT_SECRET=super_secret_jwt_token_cms_2026_xyz123
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345
```

### Running the Application

You can start both backend and frontend concurrently with one command from the project root:

```bash
# 1. Install all dependencies (if not already installed)
npm run install-all

# 2. Run both backend & frontend concurrently
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1 - Backend Server
cd server
npm run dev
# Server will run on http://localhost:5000

# Terminal 2 - Frontend Client
cd client
npm run dev
# Client will run on http://localhost:5173
```

---

## 🔑 Default Credentials

When the backend starts up, it automatically seeds an initial Super Admin account if one does not already exist:

| Role | Portal URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) | `admin@example.com` | `Admin@12345` |
| **Customer** | [http://localhost:5173/login](http://localhost:5173/login) | *(Self-register on landing page)* | *(Chosen during registration)* |

> **Tip for Evaluators**: On the Super Admin Login page, an **"Autofill"** button is provided to quickly populate the demo credentials.

---

## 📡 API Documentation

### 1. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register` (Public)
Registers a new customer.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123456",
    "password": "Password123",
    "confirmPassword": "Password123",
    "address": "456 Elm Street, Springfield"
  }
  ```
- **Response (201 Created)**: Returns `{ success: true, token, user }`.

#### `POST /api/auth/customer/login` (Public)
Authenticates a registered customer. Rejects admin accounts or deactivated accounts.
- **Request Body**: `{ "email": "john@example.com", "password": "Password123" }`
- **Response (200 OK)**: Returns `{ success: true, token, user }`.

#### `POST /api/auth/admin/login` (Public)
Authenticates a Super Admin. Rejects non-admin users.
- **Request Body**: `{ "email": "admin@example.com", "password": "Admin@12345" }`
- **Response (200 OK)**: Returns `{ success: true, token, user }`.

---

### 2. Customer Endpoints (`/api/customer`)
*Requires Bearer Token in `Authorization` header (`role: customer`).*

#### `GET /api/customer/profile`
Retrieves the logged-in customer's own profile. (Guaranteed isolation).

#### `PUT /api/customer/profile`
Updates allowed customer profile details (`name`, `phone`, `address`).

#### `PUT /api/customer/change-password`
Changes customer password.
- **Request Body**: `{ "currentPassword": "...", "newPassword": "...", "confirmNewPassword": "..." }`

---

### 3. Super Admin Endpoints (`/api/admin`)
*Requires Bearer Token in `Authorization` header (`role: admin`).*

#### `GET /api/admin/stats`
Returns counts for:
- `totalCustomers`
- `activeCustomers`
- `inactiveCustomers`
- `recentSignups` (last 7 days)

#### `GET /api/admin/customers`
Returns paginated and searchable customer list.
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (matches name, email, or phone)
  - `status` (`'all'`, `'active'`, or `'inactive'`)

#### `GET /api/admin/customers/:id`
Retrieves detailed information for a specific customer.

#### `PUT /api/admin/customers/:id`
Allows an administrator to edit customer details (`name`, `email`, `phone`, `address`, `status`).

#### `PATCH /api/admin/customers/:id/status`
Toggles or sets customer account status between `'active'` and `'inactive'`.

---

## ✅ Features & Acceptance Criteria Checklist

| Acceptance Criterion | Implementation Status | Evidence / Location |
| :--- | :---: | :--- |
| **Customer can register** | ✅ Complete | Landing page registration form (`LandingPage.jsx`) & `/api/auth/register` |
| **Form validation works** | ✅ Complete | Client regex & required checks + Express Validator server rules |
| **Data is saved in database** | ✅ Complete | MongoDB with Mongoose schema & pre-save Bcrypt hashing (`User.js`) |
| **Customer can login** | ✅ Complete | Customer login portal (`CustomerLoginPage.jsx`) & `/api/auth/customer/login` |
| **Customer can only see their own data** | ✅ Complete | JWT token ID resolution in `/api/customer/profile`, strictly scoped |
| **Customer can update allowed info** | ✅ Complete | Name, phone, and address editable; email protected (`CustomerDashboard.jsx`) |
| **Customer can change password** | ✅ Complete | Current password match check & bcrypt re-hashing (`CustomerDashboard.jsx`) |
| **Admin can login** | ✅ Complete | Dedicated Admin portal (`AdminLoginPage.jsx`) & `/api/auth/admin/login` |
| **Admin can see/manage all customers** | ✅ Complete | Interactive dashboard with cards & directory table (`AdminDashboard.jsx`) |
| **Search and pagination work** | ✅ Complete | Server-side query regex + pagination controls (`adminController.js`) |
| **Activate / Deactivate customers** | ✅ Complete | Real-time status switch + deactivated users barred from logging in |
| **Authentication & authorization** | ✅ Complete | JWT verification middleware + role guards (`authMiddleware.js`) |
| **Application is responsive** | ✅ Complete | Tailwind CSS fluid grid, mobile hamburger drawer & responsive tables |
