import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

import { openDb, run, get, all } from "./db.js"
import { ensureSchema } from "./schema.js"
import { signToken, authMiddleware, requireRole } from "./auth.js"
import { validateUserPayload, assert, passwordRegex, validateEmail } from "./validators.js"
import { parseSort, like } from "./query.js"

dotenv.config()

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret"
const DB_PATH = process.env.DB_PATH || "./data/roxiler.db"
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173"

const app = express()
app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())

const db = openDb(DB_PATH)
await ensureSchema(db)

// ✅ Root route (prevents "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Roxiler Ratings Backend Running. Use /api/health for status.")
})


app.get("/api", (req, res) => {
  res.json({
    ok: true,
    message: "Roxiler Ratings API",
    routes: {
      health: "/api/health",
      login: "/api/auth/login",
      signup: "/api/auth/signup",
    },
  })
})

app.get("/api/health", (req, res) => res.json({ ok: true }))


// ---------- AUTH ----------
app.post("/api/auth/signup", async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body
    validateUserPayload({ name, email, address, password })

    const exists = await get(db, "SELECT id FROM Users WHERE email = ?", [email])
    assert(!exists, "Email already registered")

    const hash = await bcrypt.hash(password, 10)
    const result = await run(
      db,
      "INSERT INTO Users(name,email,password,address,role) VALUES (?,?,?,?,?)",
      [name, email, hash, address, "user"],
    )
    res.status(201).json({ message: "created", id: result.lastID })
  } catch (e) {
    next(e)
  }
})

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    assert(typeof email === "string" && validateEmail(email), "Invalid email")
    assert(typeof password === "string" && password.length > 0, "Password required")

    const user = await get(db, "SELECT id,name,email,password,role FROM Users WHERE email = ?", [email])
    assert(user, "Invalid credentials")

    const ok = await bcrypt.compare(password, user.password)
    assert(ok, "Invalid credentials")

    const token = signToken({ id: user.id, role: user.role, email: user.email }, JWT_SECRET)
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (e) {
    next(e)
  }
})

app.patch("/api/auth/update-password", authMiddleware(JWT_SECRET), async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    assert(typeof oldPassword === "string" && oldPassword.length > 0, "Old password required")
    assert(typeof newPassword === "string" && passwordRegex.test(newPassword), "New password invalid")

    const user = await get(db, "SELECT id,password FROM Users WHERE id = ?", [req.user.id])
    assert(user, "User not found")

    const ok = await bcrypt.compare(oldPassword, user.password)
    assert(ok, "Old password incorrect")

    const hash = await bcrypt.hash(newPassword, 10)
    await run(db, "UPDATE Users SET password = ? WHERE id = ?", [hash, req.user.id])
    res.json({ message: "updated" })
  } catch (e) {
    next(e)
  }
})

// ---------- ADMIN ----------
app.get("/api/admin/dashboard", authMiddleware(JWT_SECRET), requireRole("admin"), async (req, res, next) => {
  try {
    const users = await get(db, "SELECT COUNT(*) as c FROM Users")
    const stores = await get(db, "SELECT COUNT(*) as c FROM Stores")
    const ratings = await get(db, "SELECT COUNT(*) as c FROM Ratings")
    res.json({ users: users.c, stores: stores.c, ratings: ratings.c })
  } catch (e) {
    next(e)
  }
})

// create user (any role)
app.post("/api/admin/users", authMiddleware(JWT_SECRET), requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body
    validateUserPayload({ name, email, address, password })
    assert(["admin", "user", "owner"].includes(role), "Invalid role")

    const exists = await get(db, "SELECT id FROM Users WHERE email = ?", [email])
    assert(!exists, "Email already exists")

    const hash = await bcrypt.hash(password, 10)
    const result = await run(
      db,
      "INSERT INTO Users(name,email,password,address,role) VALUES (?,?,?,?,?)",
      [name, email, hash, address, role],
    )
    res.status(201).json({ message: "created", id: result.lastID })
  } catch (e) {
    next(e)
  }
})

// list users with filters
app.get("/api/admin/users", authMiddleware(JWT_SECRET), requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, address, role, q, sort } = req.query
    const sortMeta = parseSort(sort, ["name", "email", "address", "role"], "name")

    const where = []
    const params = []

    const query = q ? String(q).trim() : ""
    if (query) {
      where.push("(name LIKE ? OR email LIKE ? OR address LIKE ? OR role LIKE ?)")
      params.push(like(query), like(query), like(query), like(query))
    }
    if (name) { where.push("name LIKE ?"); params.push(like(name)) }
    if (email) { where.push("email LIKE ?"); params.push(like(email)) }
    if (address) { where.push("address LIKE ?"); params.push(like(address)) }
    if (role) { where.push("role = ?"); params.push(String(role)) }

    const sql = `
      SELECT id,name,email,address,role
      FROM Users
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY ${sortMeta.key} ${sortMeta.dir.toUpperCase()}
      LIMIT 500
    `
    const rows = await all(db, sql, params)
    res.json(rows)
  } catch (e) {
    next(e)
  }
})

app.get("/api/admin/users/:id", authMiddleware(JWT_SECRET), requireRole("admin"), async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    assert(Number.isFinite(userId), "Invalid user id")
    const user = await get(db, "SELECT id,name,email,address,role FROM Users WHERE id = ?", [userId])
    assert(user, "User not found")

    if (user.role === "owner") {
      // show owner store avg rating
      const store = await get(db, "SELECT id FROM Stores WHERE owner_id = ?", [userId])
      if (store) {
        const avg = await get(db, "SELECT AVG(rating) as r FROM Ratings WHERE store_id = ?", [store.id])
        user.rating = avg?.r ?? null
      } else {
        user.rating = null
      }
    }

    res.json(user)
  } catch (e) {
    next(e)
  }
})

app.get("/api/admin/stores", authMiddleware(JWT_SECRET), requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, address, q, sort } = req.query
    const sortMeta = parseSort(sort, ["name", "email", "address", "rating"], "name")

    const where = []
    const params = []
    const query = q ? String(q).trim() : ""
    if (query) {
      where.push("(s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)")
      params.push(like(query), like(query), like(query))
    }
    if (name) { where.push("s.name LIKE ?"); params.push(like(name)) }
    if (email) { where.push("s.email LIKE ?"); params.push(like(email)) }
    if (address) { where.push("s.address LIKE ?"); params.push(like(address)) }

    const sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        (SELECT AVG(r.rating) FROM Ratings r WHERE r.store_id = s.id) as rating
      FROM Stores s
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY ${sortMeta.key === "rating" ? "rating" : "s." + sortMeta.key} ${sortMeta.dir.toUpperCase()}
      LIMIT 500
    `
    const rows = await all(db, sql, params)
    res.json(rows)
  } catch (e) {
    next(e)
  }
})

app.post("/api/admin/stores", authMiddleware(JWT_SECRET), requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body
    assert(typeof name === "string" && name.length >= 20 && name.length <= 60, "Store name must be 20-60 chars")
    assert(typeof address === "string" && address.length <= 400, "Address must be <= 400 characters")
    assert(typeof email === "string" && validateEmail(email), "Invalid email")
    assert(ownerId === null || ownerId === undefined || Number.isFinite(Number(ownerId)), "Invalid ownerId")

    const exists = await get(db, "SELECT id FROM Stores WHERE email = ?", [email])
    assert(!exists, "Store email already exists")

    if (ownerId) {
      const owner = await get(db, "SELECT id,role FROM Users WHERE id = ?", [Number(ownerId)])
      assert(owner && owner.role === "owner", "OwnerId must be a user with role owner")
    }

    const result = await run(
      db,
      "INSERT INTO Stores(name,email,address,owner_id) VALUES (?,?,?,?)",
      [name, email, address, ownerId ? Number(ownerId) : null],
    )
    res.status(201).json({ message: "created", id: result.lastID })
  } catch (e) {
    next(e)
  }
})

// ---------- USER ----------
app.get("/api/user/stores", authMiddleware(JWT_SECRET), requireRole("user"), async (req, res, next) => {
  try {
    const { q } = req.query
    const query = q ? String(q).trim() : ""
    const where = []
    const params = []

    if (query) {
      where.push("(s.name LIKE ? OR s.address LIKE ?)")
      params.push(like(query), like(query))
    }

    const sql = `
      SELECT
        s.id,
        s.name,
        s.address,
        (SELECT AVG(r.rating) FROM Ratings r WHERE r.store_id = s.id) as overallRating,
        (SELECT rating FROM Ratings WHERE store_id = s.id AND user_id = ?) as myRating
      FROM Stores s
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY s.name ASC
      LIMIT 500
    `
    const rows = await all(db, sql, [req.user.id, ...params])
    res.json(rows)
  } catch (e) {
    next(e)
  }
})

app.post("/api/user/ratings", authMiddleware(JWT_SECRET), requireRole("user"), async (req, res, next) => {
  try {
    const { storeId, rating } = req.body
    const sid = Number(storeId)
    const r = Number(rating)
    assert(Number.isFinite(sid), "Invalid storeId")
    assert(Number.isFinite(r) && r >= 1 && r <= 5, "Rating must be 1-5")

    const store = await get(db, "SELECT id FROM Stores WHERE id = ?", [sid])
    assert(store, "Store not found")

    const exists = await get(db, "SELECT id FROM Ratings WHERE user_id = ? AND store_id = ?", [req.user.id, sid])
    assert(!exists, "Rating already exists. Use modify endpoint.")

    await run(db, "INSERT INTO Ratings(user_id,store_id,rating) VALUES (?,?,?)", [req.user.id, sid, r])
    res.status(201).json({ message: "created" })
  } catch (e) {
    next(e)
  }
})

app.patch("/api/user/ratings/:storeId", authMiddleware(JWT_SECRET), requireRole("user"), async (req, res, next) => {
  try {
    const sid = Number(req.params.storeId)
    const r = Number(req.body.rating)
    assert(Number.isFinite(sid), "Invalid storeId")
    assert(Number.isFinite(r) && r >= 1 && r <= 5, "Rating must be 1-5")

    const exists = await get(db, "SELECT id FROM Ratings WHERE user_id = ? AND store_id = ?", [req.user.id, sid])
    assert(exists, "No previous rating found. Use submit endpoint.")

    await run(db, "UPDATE Ratings SET rating = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?", [r, req.user.id, sid])
    res.json({ message: "updated" })
  } catch (e) {
    next(e)
  }
})

// ---------- OWNER ----------
app.get("/api/owner/dashboard", authMiddleware(JWT_SECRET), requireRole("owner"), async (req, res, next) => {
  try {
    const store = await get(db, "SELECT id FROM Stores WHERE owner_id = ?", [req.user.id])
    assert(store, "No store assigned to this owner.")

    const avg = await get(db, "SELECT AVG(rating) as averageRating FROM Ratings WHERE store_id = ?", [store.id])
    const raters = await all(
      db,
      `SELECT u.id, u.name, u.email, r.rating, r.created_at
       FROM Ratings r
       JOIN Users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC
       LIMIT 500`,
      [store.id],
    )

    res.json({ averageRating: avg?.averageRating ?? null, raters })
  } catch (e) {
    next(e)
  }
})

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({ message: err.message || "Server error" })
})

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
