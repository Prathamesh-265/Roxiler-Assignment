# Roxiler Store Ratings Platform (Full Stack)

A full-stack web application that enables users to submit ratings (1–5) for registered stores with a **single login system** and **role-based access** for:
- **System Administrator**
- **Normal User**
- **Store Owner**

---

## ✨ Features

###  Authentication 
- Secure login system for all users
- JWT-based authentication
- Role-based routing after login
- Update password feature for all roles

---

##  Roles & Functionalities

### System Administrator
- Add new **users** (admin/user/owner)
- Add new **stores**
- Dashboard with:
  - Total users
  - Total stores
  - Total ratings
- View & filter lists:
  - Users (name/email/address/role)
  - Stores (name/email/address/avg rating)
- Sorting supported in all tables
- View user details (+ owner average rating if role is owner)

###  Normal User
- Signup + login
- View all stores
- Search stores by name/address
- Submit rating (1–5) per store
- Modify rating
- Update password

###  Store Owner
- Dashboard:
  - Average store rating
  - Users who submitted ratings (raters list)
- Update password

---

##  Tech Stack

### Frontend
- React + Vite
- Tailwind CSS (premium UI)
- React Router DOM
- React Hook Form + Zod validations
- Axios (API integration)

### Backend
- Node.js + Express.js
- SQLite database
- JWT authentication
- bcrypt password hashing
- Role-based authorization middleware

---

##  Form Validations

| Field     | Rule |
|----------|------|
| Name     | 10–60 characters |
| Address  | Max 400 characters |
| Password | 8–16 characters, includes **1 uppercase** + **1 special character** |
| Email    | Standard email validation |

---

## Run backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend runs: `http://localhost:5000`

---

## Run frontend
Open new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs: `http://localhost:5173`

---

## Demo credentials (after seed)
- Admin: `admin@roxiler.com` / `Admin@123`
- Owner: `owner@roxiler.com` / `Owner@123`
- User : `user@roxiler.com` / `User@1234`
