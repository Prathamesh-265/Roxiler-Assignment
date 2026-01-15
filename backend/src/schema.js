import { run } from "./db.js"

export async function ensureSchema(db) {
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      address TEXT,
      role TEXT NOT NULL CHECK(role IN ('admin','user','owner'))
    );`,
  )

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS Stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      address TEXT,
      owner_id INTEGER REFERENCES Users(id) ON DELETE CASCADE
    );`,
  )

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS Ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
      store_id INTEGER NOT NULL REFERENCES Stores(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, store_id)
    );`,
  )

  await run(db, `CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);`)
  await run(db, `CREATE INDEX IF NOT EXISTS idx_stores_name ON Stores(name);`)
  await run(db, `CREATE INDEX IF NOT EXISTS idx_ratings_store ON Ratings(store_id);`)
}
