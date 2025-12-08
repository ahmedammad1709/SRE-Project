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
      const url = new URL(req.url, "http://localhost");
      const email = url.searchParams.get("email");
      
      let query = "SELECT id, name, description, summary, created_by, created_at FROM projects";
      let params = [];
      
      if (email) {
        query += " WHERE created_by = $1";
        params.push(email);
      }
      
      query += " ORDER BY created_at DESC";
      
      const { rows } = await pool.query(query, params);
      return sendJSON(res, 200, { success: true, data: rows });
    }

    if (req.method === "POST") {
      const body = await parseJSON(req);
      const { name, description, created_by } = body;
      if (!name) return sendJSON(res, 400, { success: false, error: "name is required" });
      const { rows } = await pool.query(
        "INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, description, summary, created_by, created_at",
        [name, description ?? null, created_by ?? null]
      );
      return sendJSON(res, 201, { success: true, data: rows[0] });
    }

    if (req.method === "PUT") {
      const body = await parseJSON(req);
      const { id, name, description, summary } = body;
      if (!id) return sendJSON(res, 400, { success: false, error: "id is required" });
      const { rows } = await pool.query(
        "UPDATE projects SET name = COALESCE($2, name), description = COALESCE($3, description), summary = COALESCE($4, summary) WHERE id = $1 RETURNING id, name, description, summary, created_by, created_at",
        [id, name ?? null, description ?? null, summary ?? null]
      );
      if (!rows.length) return sendJSON(res, 404, { success: false, error: "project not found" });
      return sendJSON(res, 200, { success: true, data: rows[0] });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url, "http://localhost");
      const idParam = url.searchParams.get("id");
      const id = idParam ? Number(idParam) : undefined;
      if (!id) return sendJSON(res, 400, { success: false, error: "id query param is required" });
      const result = await pool.query("DELETE FROM projects WHERE id = $1", [id]);
      return sendJSON(res, 200, { success: true, deleted: result.rowCount });
    }

    return sendJSON(res, 405, { success: false, error: "Method Not Allowed" });
  } catch (error) {
    return sendJSON(res, 500, { success: false, error: error.message });
  }
}

/*
-- projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
