import pool from "./db.js";

async function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJSON(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { rows } = await pool.query("SELECT id, name, email, created_at FROM users ORDER BY id ASC");
      return sendJSON(res, 200, { success: true, data: rows });
    }

    if (req.method === "POST") {
      const body = await parseJSON(req);
      const { name, email } = body;
      if (!name || !email) return sendJSON(res, 400, { success: false, error: "name and email are required" });
      const { rows } = await pool.query(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
        [name, email]
      );
      return sendJSON(res, 201, { success: true, data: rows[0] });
    }

    if (req.method === "PUT") {
      const body = await parseJSON(req);
      const { id, name, email } = body;
      if (!id) return sendJSON(res, 400, { success: false, error: "id is required" });
      const { rows } = await pool.query(
        "UPDATE users SET name = COALESCE($2, name), email = COALESCE($3, email) WHERE id = $1 RETURNING id, name, email, created_at",
        [id, name ?? null, email ?? null]
      );
      if (!rows.length) return sendJSON(res, 404, { success: false, error: "user not found" });
      return sendJSON(res, 200, { success: true, data: rows[0] });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url, "http://localhost");
      const idParam = url.searchParams.get("id");
      const id = idParam ? Number(idParam) : undefined;
      if (!id) return sendJSON(res, 400, { success: false, error: "id query param is required" });
      const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
      return sendJSON(res, 200, { success: true, deleted: result.rowCount });
    }

    return sendJSON(res, 405, { success: false, error: "Method Not Allowed" });
  } catch (error) {
    return sendJSON(res, 500, { success: false, error: error.message });
  }
}

/*
-- users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
