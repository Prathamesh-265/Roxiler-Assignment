# Roxiler Ratings UI (React + Tailwind + shadcn-style UI)

This is a **ready-to-run frontend UI package** for the Roxiler FullStack Intern Coding Challenge.

✅ Role-based UI routes (Admin / User / Owner)  
✅ Responsive layouts, premium design system, clean components  
✅ Tables with sorting + filters  
✅ Store rating (1-5) submit + modify  
✅ Accessibility: ARIA labels, focus-visible, keyboard-friendly  
✅ API-ready integration (Axios + JWT interceptor)

---

## Tech Stack

- React (Vite) + TypeScript
- Tailwind CSS + shadcn-style components (Radix UI primitives)
- React Router
- Axios
- React Hook Form + Zod
- Sonner Toasts
- lucide-react Icons

---

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure API URL
Create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env`:

```
VITE_API_URL=http://localhost:5000
```

### 3) Run locally
```bash
npm run dev
```

---

## Pages / Routes

### Public
- `/login`
- `/signup` (normal users only)

### Admin
- `/admin` (dashboard totals)
- `/admin/stores` (filters + sorting)
- `/admin/users` (filters + sorting)
- `/admin/users/:id` (view details, includes rating if role=owner)

### Normal User
- `/user/stores` (search + rate)
- `/user/update-password`

### Store Owner
- `/owner` (average rating + raters table)
- `/owner/update-password`

---

## Expected Backend API Response Shapes

### Login
`POST /api/auth/login`

```json
{
  "token": "jwt_token_here",
  "user": { "id": 1, "name": "....", "email": "...", "role": "admin" }
}
```

### Signup
`POST /api/auth/signup` (normal users only)

```json
{ "message": "created" }
```

### Admin Dashboard
`GET /api/admin/dashboard`
```json
{ "users": 10, "stores": 5, "ratings": 20 }
```

### Admin Stores
`GET /api/admin/stores`
```json
[
  { "id": 1, "name": "...", "email": "...", "address": "...", "rating": 4.2 }
]
```

### User Stores
`GET /api/user/stores`
```json
[
  { "id": 1, "name": "...", "address": "...", "overallRating": 4.2, "myRating": 5 }
]
```

### Owner Dashboard
`GET /api/owner/dashboard`
```json
{
  "averageRating": 4.1,
  "raters": [{ "id": 1, "name": "...", "email": "...", "rating": 5, "created_at": "..." }]
}
```

---

## Validation Checklist (UI)

- [ ] Login uses single auth screen for all roles
- [ ] Signup has fields: Name, Email, Address, Password
- [ ] Name validation: 20-60 characters
- [ ] Address validation: <= 400 characters
- [ ] Password validation: 8-16 length, uppercase + special
- [ ] Email validation: correct format
- [ ] Tables support sorting (click header)
- [ ] Admin listings support filtering by name/email/address/role
- [ ] User store list supports search by name/address
- [ ] Rating submit + modify (1-5)
- [ ] Owner dashboard shows avg rating + raters list
- [ ] Focus styles visible & keyboard friendly
- [ ] ARIA labels included

---

## Notes

This UI project is intentionally built to integrate cleanly with your Express + SQLite backend.
