# 🍲 Waste Food Management System

A full-stack MERN web application built to eliminate food waste by connecting surplus food donors (restaurants, hotels, events, canteens, households) with food receivers (NGOs, charities, shelters, and orphanages).

---

## 📌 Project Objective

Every day, massive amounts of fresh, edible food from restaurants, weddings, caterers, and college canteens end up in landfills, while millions suffer from hunger. 
The **Waste Food Management System** provides an automated digital bridge:
- **Donors** can list excess food with type, quantity, expiration window, and pickup coordinates.
- **Receivers (NGOs & Charities)** can discover active food listings in real time and send immediate claim requests.
- **Donors** review incoming claims, accept the best match, and verify collection upon delivery.
- **Admins** have platform-wide analytics and oversight across all transactions.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast, responsive Single Page Application (SPA) |
| **Routing** | React Router DOM v7 | Client-side declarative routing & protected pages |
| **API Client**| Axios | HTTP requests with Bearer JWT token interceptors |
| **Styling** | Vanilla CSS (Modern Green Theme) | Clean card layouts, accessible forms, responsive grid |
| **Backend** | Node.js + Express.js | REST API server with ES Modules (`import`/`export`) |
| **Database**| MongoDB + Mongoose | Document database with relational schemas & populate |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | Secure password hashing and token-based auth |
| **File Upload** | Multer + Cloudinary | Optional food photo upload with in-memory buffering |

---

## 📁 Project Structure

```
Food Management System/
│
├── backend/
│   ├── .env                      # Environment configurations (Port, DB URI, JWT)
│   ├── .gitignore                # Excludes node_modules and .env
│   ├── package.json              # Backend dependencies & ES module configuration
│   ├── server.js                 # Server entry point & DB startup
│   │
│   └── src/
│       ├── app.js                # Express app setup, CORS, and route mounting
│       │
│       ├── config/
│       │   ├── db.js             # MongoDB Mongoose connection handler
│       │   └── cloudinary.js     # Cloudinary media config & stream uploader
│       │
│       ├── controllers/
│       │   ├── auth.controller.js    # Register, login, credential validation
│       │   ├── food.controller.js    # Add food, available food, update, delete
│       │   ├── request.controller.js # Create claim, accept, reject, complete
│       │   └── admin.controller.js   # Analytics metrics, user & food records
│       │
│       ├── middleware/
│       │   ├── auth.middleware.js    # JWT Bearer verification -> req.user
│       │   ├── admin.middleware.js   # Admin role validation guard (403)
│       │   └── upload.middleware.js  # Multer 5MB image memory storage
│       │
│       ├── models/
│       │   ├── user.model.js         # User schema (donor / receiver / admin)
│       │   ├── food.model.js         # Food donation schema
│       │   └── request.model.js      # Food claim request schema
│       │
│       ├── routes/
│       │   ├── auth.routes.js        # /api/auth
│       │   ├── food.routes.js        # /api/food
│       │   ├── request.routes.js     # /api/requests
│       │   └── admin.routes.js       # /api/admin
│       │
│       └── utils/
│           └── generateToken.js      # Signed JWT helper (7-day expiry)
│
├── frontend/
│   ├── index.html                # HTML entry template
│   ├── vite.config.js            # Vite bundler configuration
│   ├── package.json              # Frontend dependencies
│   │
│   └── src/
│       ├── main.jsx              # React DOM root entry
│       ├── App.jsx               # App routing & context provider tree
│       ├── App.css               # Complete UI design & green-theme styles
│       ├── index.css             # Base reset & typography variables
│       │
│       ├── components/
│       │   ├── Navbar.jsx        # Role-aware responsive navigation bar
│       │   ├── ProtectedRoute.jsx# Auth & role redirect protection
│       │   └── FoodCard.jsx      # Reusable food card with tags & status
│       │
│       ├── context/
│       │   └── AuthContext.jsx   # Global user state, login, register, logout
│       │
│       ├── pages/
│       │   ├── Register.jsx      # Clean vertical registration with role selection
│       │   ├── Login.jsx         # Card-based login with error alerts
│       │   ├── Dashboard.jsx     # Role-specific dashboard (Donor / Receiver / Admin)
│       │   ├── AddFood.jsx       # Food listing form with validation & upload
│       │   ├── AvailableFood.jsx # Grid of available donations with claim modal
│       │   ├── Requests.jsx      # Donor management & Receiver tracking tabs
│       │   └── Admin.jsx         # Full admin metrics, users, donations & requests
│       │
│       └── services/
│           └── api.js            # Axios client with automatic Bearer token injection
│
└── README.md                     # Comprehensive project documentation
```

---

## 🔄 Application Workflow

```
[ FOOD DONOR ]                                         [ RECEIVER / NGO ]
      │                                                        │
      ├─ 1. Register / Login                                   ├─ 2. Register / Login
      │                                                        │
      ├─ 3. Adds Food Donation                                 │
      │    (title, type, qty, location, expiry)                │
      │    [Status: "available"]                               │
      │                                                        │
      │                                                        ├─ 4. Browses /food
      │                                                        │    (Sees only active & unexpired)
      │                                                        │
      │                                                        ├─ 5. Submits Food Request
      │                                                        │    [Status: "pending"]
      │                                                        │    [Food: "requested"]
      │                                                        │
      ├─ 6. Sees request in /requests                          │
      │                                                        │
      ├─ 7. Accepts Request ───────────────┬───────────────────┤
      │    [Status: "accepted"]            │                   │
      │    [Food: "claimed"]               │ (Food claimed!)   │
      │                                    │                   │
      ├─ 8. Food Collected / Delivered ────┘                   │
      │                                                        │
      └─ 9. Marks Request "Completed" ─────────────────────────┘
           [Status: "completed"]
           [Food: "completed"]
```

---

## ⚙️ Environment Variables

Create or inspect `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/waste_food_management
JWT_SECRET=waste_food_management_jwt_secret_key_2026_secure
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_secret=
```

> **Note on macOS Port 5000**:
> Modern macOS versions use Port 5000 for Apple AirPlay Receiver. If port 5000 is occupied, you can either turn off AirPlay Receiver in *System Settings → General → AirDrop & AirPlay*, or adjust `PORT=5001` in `backend/.env` and update the Axios base URL in `frontend/src/services/api.js`.

---

## 🚀 How to Run the Project

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
brew services start mongodb-community
# or
mongod --dbpath /path/to/data
```

### 2. Run the Backend Server
```bash
cd backend
npm install
npm run dev
```
The backend starts at `http://localhost:5000`. You will see:
```
MongoDB connected successfully: 127.0.0.1/waste_food_management
Server running on http://localhost:5000
```

### 3. Run the Frontend Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new donor, receiver, or admin |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT |

### Food Management (`/api/food`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/food` | Protected | Create food donation (Donor) |
| `GET` | `/api/food/available`| Protected | View all active, unexpired food |
| `GET` | `/api/food/my` | Protected | View food items posted by logged-in donor |
| `GET` | `/api/food/:id` | Protected | View single food item with donor details |
| `PUT` | `/api/food/:id` | Protected | Update food donation (Owner only) |
| `DELETE` | `/api/food/:id` | Protected | Delete food donation (Owner only) |

### Claim Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/requests` | Protected | Submit claim request for available food |
| `GET` | `/api/requests/my` | Protected | List requests made by logged-in receiver |
| `GET` | `/api/requests/received` | Protected | List requests received for donor's food |
| `PUT` | `/api/requests/:id/accept` | Protected | Donor accepts request (food -> claimed) |
| `PUT` | `/api/requests/:id/reject` | Protected | Donor rejects request (food -> available) |
| `PUT` | `/api/requests/:id/complete`| Protected | Donor marks claim delivered/collected |

### Admin Oversight (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin Only | System stats (users, food, requests) |
| `GET` | `/api/admin/users` | Admin Only | List all users (passwords omitted) |
| `GET` | `/api/admin/food` | Admin Only | List all food donations |
| `GET` | `/api/admin/requests` | Admin Only | List all food requests across platform |

---

## 🎓 College Viva Preparation (Q & A)

**Q1: Why did registration fail initially?**
- `backend/.env` was empty (no DB connection string or JWT secret).
- `package.json` was missing `"type": "module"`.
- On macOS, Port 5000 is intercepted by Apple AirPlay Receiver, returning `403 Forbidden` to Axios.
- Frontend unstyled form elements lacked CSS grid/flex classes, causing horizontal input rendering.

**Q2: How does authentication work?**
- User passwords are encrypted with `bcryptjs` using a salt before saving into MongoDB.
- On login, `bcrypt.compare` verifies the credentials.
- A JSON Web Token (JWT) is signed using `JWT_SECRET` with user `id` and `role` in the payload.
- Axios intercepts all outgoing frontend HTTP requests and adds `Authorization: Bearer <token>`.
- Express middleware verifies the token with `jwt.verify` and attaches `req.user`.

**Q3: How are unauthorized actions prevented?**
- Endpoints check ownership (`food.donor.toString() === req.user.id`).
- Receivers cannot delete or modify donor food items.
- Donors can only accept or reject requests submitted for their own food.
- Admin routes are gated with `adminOnly` middleware (`req.user.role === 'admin'`).

---

## 📄 License
ISC License — Created for Academic Minor Project.
