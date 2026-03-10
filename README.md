<div align="center">

<img src="frontend/public/logo192.png" alt="RescueNet Logo" width="120" height="120" style="border-radius: 24px;" />

<br/>

# 🥗 RescueNet

### *Smart Surplus Food Redistribution System*

<p align="center">
  <strong>Connecting food donors with those in need — reducing waste, fighting hunger.</strong>
</p>

<br/>

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)](https://github.com/)

</div>

---

## 📌 Table of Contents

- [✨ About](#-about)
- [🚀 Features](#-features)
- [🖼️ Screenshots](#️-screenshots)
- [🏗️ Architecture](#️-architecture)
- [⚙️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [🔑 Environment Variables](#-environment-variables)
- [📁 Project Structure](#-project-structure)
- [👥 User Roles](#-user-roles)
- [🛣️ API Routes](#️-api-routes)
- [🤝 Contributing](#-contributing)

---

## ✨ About

> **One-third of all food produced globally is wasted — while 800 million people go hungry every day.**

**RescueNet** is a full-stack web platform that bridges the gap between food surplus and food insecurity. Restaurants, bakeries, supermarkets, and individuals can list surplus food in seconds. Recipients and volunteers coordinate real-time pickups powered by live maps, instant notifications, and intelligent matching.

```
🍱 Donor lists surplus food
        ↓
🔔 Volunteers & recipients get notified instantly
        ↓
🚗 Volunteer accepts & delivers to recipient
        ↓
✅ Impact tracked — zero waste, maximum good
```

---

## 🚀 Features

### 🧑‍🍳 For Donors
| Feature | Description |
|---|---|
| 📸 **Smart Listings** | Multi-step form with photo upload, category tags & allergen flags |
| ⏱️ **Expiry Tracking** | Set best-before windows; listings auto-expire |
| 📊 **Impact Analytics** | Dashboard with real-time stats — meals donated, people helped |
| 🗺️ **Location Picker** | GPS, address search, or manual coordinate entry |

### 🙋 For Recipients
| Feature | Description |
|---|---|
| 🔍 **Browse Listings** | Filter by food type, distance, urgency |
| 🔔 **Live Notifications** | Socket.io-powered real-time alerts for new food nearby |
| 📍 **Interactive Map** | Google Maps integration with pickup point markers |
| ⚡ **One-click Claim** | Reserve food before it's gone |

### 🚴 For Volunteers
| Feature | Description |
|---|---|
| 📋 **Delivery Queue** | Available / Active / Completed tabs with live counts |
| 🚦 **Urgency Triage** | Color-coded priority (Urgent / Soon / Flexible) |
| 🗺️ **Navigation** | Direct Google Maps routing to pickup location |
| 🏆 **Impact Tracking** | Personal stats — deliveries, food weight, people helped |

### 🛡️ For Admins
| Feature | Description |
|---|---|
| 📈 **Analytics Modal** | Animated charts — donations over time, top categories |
| 👤 **User Management** | Role assignment, account moderation |
| 🔧 **System Health** | Monitor listings, deliveries, and volunteer activity |

---

## 🖼️ Screenshots

<div align="center">

| Home Page | Donor Dashboard |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Donor](docs/screenshots/donor.png) |

| Volunteer Dashboard | Food Listing Form |
|---|---|
| ![Volunteer](docs/screenshots/volunteer.png) | ![Form](docs/screenshots/form.png) |

</div>

> 📸 *Add your screenshots to `docs/screenshots/` to display them here.*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + TS)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │  Donor   │  │Recipient │  │ Volunteer │  │   Admin   │  │
│  │Dashboard │  │  Portal  │  │ Dashboard │  │  Panel    │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────┘  │
│           │           │             │               │        │
│  ┌────────▼───────────▼─────────────▼───────────────▼────┐  │
│  │              Redux Store + React Query                  │  │
│  └────────────────────────┬────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP + WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                    SERVER (Node.js + Express)                 │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │  REST API    │  │  Socket.io    │  │   Auth (JWT)     │  │
│  │  /api/v1/    │  │  Real-time    │  │   Middleware     │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  │
│                            │                                  │
│  ┌─────────────────────────▼────────────────────────────┐    │
│  │              MongoDB (Mongoose ODM)                    │    │
│  │   Users │ FoodDonations │ Deliveries │ Reviews        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │      External Services      │
              │  Google Maps API  │  Multer │
              └────────────────────────────┘
```

---

## ⚙️ Tech Stack

### Frontend
```yaml
Framework:    React 18 + TypeScript
Styling:      Tailwind CSS + inline styles
State:        Redux Toolkit + React Query
Routing:      React Router DOM v6
Maps:         @react-google-maps/api
Realtime:     Socket.io Client
Forms:        Custom multi-step wizard
Icons:        Lucide React
Fonts:        Plus Jakarta Sans, DM Sans
```

### Backend
```yaml
Runtime:      Node.js 20
Framework:    Express.js 4
Database:     MongoDB + Mongoose
Auth:         JWT (jsonwebtoken) + bcrypt
Realtime:     Socket.io
File Upload:  Multer
Scheduling:   node-cron
HTTP Client:  Axios
```

---

## 📦 Installation

### Prerequisites
- Node.js `≥ 18.x`
- MongoDB (local or Atlas)
- Google Maps API key (with Maps JS, Places, Geocoding, Distance Matrix APIs enabled)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/rescuenet.git
cd rescuenet
```

### 2. Install backend dependencies
```bash
cd backend1
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Set up environment variables
```bash
# Backend
cp backend1/.env.example backend1/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 5. Start development servers

**Backend** (in one terminal):
```bash
cd backend1
npm run dev
```

**Frontend** (in another terminal):
```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔑 Environment Variables

### `backend1/.env`
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/rescuenet

# Auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...

# File Upload
MAX_FILE_SIZE=7340032
```

### `frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSy...
```

> ⚠️ **Never commit `.env` files to version control.** Add them to `.gitignore`.

---

## 📁 Project Structure

```
rescuenet/
├── 📁 backend1/
│   ├── 📁 config/
│   │   └── db.js                    # MongoDB connection
│   ├── 📁 controllers/
│   │   ├── authController.js
│   │   ├── foodDonationController.js
│   │   └── userController.js
│   ├── 📁 middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── upload.js                # Multer config
│   ├── 📁 models/
│   │   ├── User.js
│   │   ├── FoodDonation.js
│   │   └── Review.js
│   ├── 📁 routes/
│   │   ├── auth.js
│   │   ├── foodDonations.js
│   │   └── users.js
│   ├── socketServer.js              # Socket.io events
│   └── server.js                    # Entry point
│
└── 📁 frontend/
    ├── 📁 public/
    │   ├── logo192.png              # App logo
    │   └── index.html
    └── 📁 src/
        ├── 📁 components/
        │   ├── 📁 auth/             # Register forms
        │   ├── 📁 common/           # Shared components
        │   │   ├── Header.tsx
        │   │   ├── FoodListingVisibility.tsx
        │   │   └── CountdownTimer.tsx
        │   ├── 📁 donor/            # Donor dashboard & forms
        │   │   ├── DonorDashboard.tsx
        │   │   ├── FoodListingForm.tsx
        │   │   └── DetailedAnalyticsModal.tsx
        │   ├── 📁 maps/             # Map components
        │   │   ├── InteractiveMap.js
        │   │   └── LocationPicker.js
        │   └── 📁 volunteer/        # Volunteer dashboard
        │       └── FoodListDashboard.tsx
        ├── 📁 hooks/                # Custom React hooks
        ├── 📁 pages/                # Route-level pages
        │   ├── HomePage.tsx
        │   ├── LoginPage.tsx
        │   └── RegisterPage.tsx
        ├── 📁 services/             # API service layer
        │   ├── api.ts
        │   ├── authService.ts
        │   └── foodDonationService.ts
        ├── 📁 store/                # Redux store
        ├── 📁 types/                # TypeScript interfaces
        └── App.tsx                  # Routes & providers
```

---

## 👥 User Roles

```
┌─────────────────────────────────────────────────────────┐
│  Role          │  Access                                  │
├────────────────┼──────────────────────────────────────────┤
│  🧑‍🍳 Donor      │  List food, view analytics, manage own  │
│                │  listings, track impact                   │
├────────────────┼──────────────────────────────────────────┤
│  🙋 Recipient   │  Browse & claim available food,          │
│                │  view nearby listings on map              │
├────────────────┼──────────────────────────────────────────┤
│  🚴 Volunteer   │  Accept & complete deliveries,           │
│                │  navigate to pickup points                │
├────────────────┼──────────────────────────────────────────┤
│  🛡️ Admin       │  Full access, user management,           │
│                │  system analytics                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛣️ API Routes

### Auth
```http
POST   /api/auth/register         Register new user
POST   /api/auth/login            Login & get JWT
GET    /api/auth/me               Get current user
```

### Food Donations
```http
GET    /api/food-donations        Get all listings
POST   /api/food-donations        Create new listing
GET    /api/food-donations/:id    Get single listing
PUT    /api/food-donations/:id    Update listing
DELETE /api/food-donations/:id    Delete listing
GET    /api/food-donations/my-donations  Get user's listings
```

### Users
```http
GET    /api/users/profile         Get user profile
PUT    /api/users/profile         Update profile
GET    /api/users/:id             Get user by ID
```

---

## 🤝 Contributing

Contributions are what make open source amazing! 💪

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: add AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a **Pull Request** 🎉

### Commit Convention
```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, missing semicolons
refactor: Code restructuring
test:     Adding tests
chore:    Maintenance tasks
```

---

<div align="center">

### 🌍 Together, let's end food waste — one pickup at a time.

<br/>

⭐ **Star this repo** if RescueNet inspired you!

<br/>

Made with ❤️ and a mission to feed the world.

<br/>

[![GitHub stars](https://img.shields.io/github/stars/yourusername/rescuenet?style=social)](https://github.com/yourusername/rescuenet)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/rescuenet?style=social)](https://github.com/yourusername/rescuenet)

</div>