import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { openDb, run, get } from "./db.js"
import { ensureSchema } from "./schema.js"

dotenv.config()

const DB_PATH = process.env.DB_PATH || "./data/roxiler.db"
const db = openDb(DB_PATH)
await ensureSchema(db)

/* ---------------- helpers ---------------- */
async function upsertUser({ name, email, password, address, role }) {
  const exists = await get(db, "SELECT id FROM Users WHERE email = ?", [email])
  if (exists) return exists.id

  const hash = await bcrypt.hash(password, 10)
  const r = await run(
    db,
    "INSERT INTO Users(name,email,password,address,role) VALUES (?,?,?,?,?)",
    [name, email, hash, address, role],
  )
  return r.lastID
}

async function upsertStore({ name, email, address, ownerId }) {
  const exists = await get(db, "SELECT id FROM Stores WHERE email = ?", [email])
  if (exists) return exists.id

  const r = await run(
    db,
    "INSERT INTO Stores(name,email,address,owner_id) VALUES (?,?,?,?)",
    [name, email, address, ownerId ?? null],
  )
  return r.lastID
}

async function upsertRating({ userId, storeId, rating }) {
  // prevent duplicates for user-store pair (insert or update)
  const exists = await get(
    db,
    "SELECT id FROM Ratings WHERE user_id = ? AND store_id = ?",
    [userId, storeId],
  )

  if (exists?.id) {
    await run(db, "UPDATE Ratings SET rating = ? WHERE id = ?", [rating, exists.id])
    return exists.id
  }

  const r = await run(
    db,
    "INSERT INTO Ratings(user_id, store_id, rating) VALUES (?,?,?)",
    [userId, storeId, rating],
  )
  return r.lastID
}

/* ---------------- seed ---------------- */
const credentials = {
  admin: { email: "admin@roxiler.com", password: "Admin@123" },
  owners: [
    { email: "owner1@roxiler.com", password: "Owner@123" },
    { email: "owner2@roxiler.com", password: "Owner@123" },
    { email: "owner3@roxiler.com", password: "Owner@123" },
  ],
  users: [
    { email: "user1@roxiler.com", password: "User@123" },
    { email: "user2@roxiler.com", password: "User@123" },
    { email: "user3@roxiler.com", password: "User@123" },
    { email: "user4@roxiler.com", password: "User@123" },
    { email: "user5@roxiler.com", password: "User@123" },
  ],
}

//  Admin
await upsertUser({
  name: "System Administrator Roxiler",
  email: credentials.admin.email,
  password: credentials.admin.password,
  address: "Roxiler HQ, Bangalore, India",
  role: "admin",
})

//  Owners
const owner1Id = await upsertUser({
  name: "Roxiler Store Owner One",
  email: credentials.owners[0].email,
  password: credentials.owners[0].password,
  address: "MG Road, Bangalore",
  role: "owner",
})

const owner2Id = await upsertUser({
  name: "Roxiler Store Owner Two",
  email: credentials.owners[1].email,
  password: credentials.owners[1].password,
  address: "Andheri East, Mumbai",
  role: "owner",
})

const owner3Id = await upsertUser({
  name: "Roxiler Store Owner Three",
  email: credentials.owners[2].email,
  password: credentials.owners[2].password,
  address: "New Town, Kolkata",
  role: "owner",
})

//  Users
const userIds = []
for (let i = 0; i < credentials.users.length; i++) {
  const id = await upsertUser({
    name: `Roxiler Normal User Number ${i + 1}`,
    email: credentials.users[i].email,
    password: credentials.users[i].password,
    address: `User Address ${i + 1}, India`,
    role: "user",
  })
  userIds.push(id)
}

//  Stores
const store1Id = await upsertStore({
  name: "Roxiler Fresh Mart And Grocery Store",
  email: "freshmart@roxiler.com",
  address: "Whitefield, Bangalore",
  ownerId: owner1Id,
})

const store2Id = await upsertStore({
  name: "Roxiler Electronics Mega Retail Hub",
  email: "electronics@roxiler.com",
  address: "Powai, Mumbai",
  ownerId: owner2Id,
})

const store3Id = await upsertStore({
  name: "Roxiler Fashion And Lifestyle Center",
  email: "fashion@roxiler.com",
  address: "Salt Lake, Kolkata",
  ownerId: owner3Id,
})

// One extra store without owner (optional demo)
await upsertStore({
  name: "Roxiler Bakery And Cafe Premium Corner",
  email: "bakery@roxiler.com",
  address: "Koregaon Park, Pune",
  ownerId: null,
})


const ratings = [
  // store1 avg ~4.25
  { userId: userIds[0], storeId: store1Id, rating: 4 },
  { userId: userIds[1], storeId: store1Id, rating: 5 },
  { userId: userIds[2], storeId: store1Id, rating: 4 },
  { userId: userIds[3], storeId: store1Id, rating: 4 },

  // store2 avg ~3.5
  { userId: userIds[0], storeId: store2Id, rating: 3 },
  { userId: userIds[1], storeId: store2Id, rating: 4 },
  { userId: userIds[2], storeId: store2Id, rating: 3 },
  { userId: userIds[4], storeId: store2Id, rating: 4 },

  // store3 avg ~4.75
  { userId: userIds[1], storeId: store3Id, rating: 5 },
  { userId: userIds[2], storeId: store3Id, rating: 4 },
  { userId: userIds[3], storeId: store3Id, rating: 5 },
  { userId: userIds[4], storeId: store3Id, rating: 5 },
]

for (const r of ratings) {
  await upsertRating(r)
}

console.log("Seed done.")

console.log("\nDemo logins:")
console.log(`Admin: ${credentials.admin.email} / ${credentials.admin.password}`)
console.log(`Owner1: ${credentials.owners[0].email} / ${credentials.owners[0].password}`)
console.log(`Owner2: ${credentials.owners[1].email} / ${credentials.owners[1].password}`)
console.log(`Owner3: ${credentials.owners[2].email} / ${credentials.owners[2].password}`)
console.log(`User1 : ${credentials.users[0].email} / ${credentials.users[0].password}`)
console.log(`User2 : ${credentials.users[1].email} / ${credentials.users[1].password}`)
console.log(`User3 : ${credentials.users[2].email} / ${credentials.users[2].password}`)
console.log(`User4 : ${credentials.users[3].email} / ${credentials.users[3].password}`)
console.log(`User5 : ${credentials.users[4].email} / ${credentials.users[4].password}`)

process.exit(0)
