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
      const projectIdParam = url.searchParams.get("projectId");
      const projectId = projectIdParam ? Number(projectIdParam) : undefined;
      if (!projectId) return sendJSON(res, 400, { success: false, error: "projectId query param is required" });
      const { rows } = await pool.query(
        "SELECT id, project_id, role, content, created_at FROM chat_messages WHERE project_id = $1 ORDER BY created_at ASC",
        [projectId]
      );
      return sendJSON(res, 200, { success: true, data: rows });
    }

    if (req.method === "POST") {
      const body = await parseJSON(req);
      const { projectId, role, content } = body;
      if (!projectId || !role || !content)
        return sendJSON(res, 400, { success: false, error: "projectId, role, and content are required" });
      const { rows } = await pool.query(
        "INSERT INTO chat_messages (project_id, role, content) VALUES ($1, $2, $3) RETURNING id, project_id, role, content, created_at",
        [projectId, role, content]
      );
      return sendJSON(res, 201, { success: true, data: rows[0] });
    }

    return sendJSON(res, 405, { success: false, error: "Method Not Allowed" });
  } catch (error) {
    return sendJSON(res, 500, { success: false, error: error.message });
  }
}

/*
-- chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','bot')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
