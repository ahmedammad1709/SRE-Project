import pool from "./db.js";
import bcrypt from "bcryptjs";

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
    if (req.method !== "POST") return sendJSON(res, 405, { success: false, error: "Method Not Allowed" });

    const body = await parseJSON(req);
    const { email, password } = body;
    if (!email || !password) return sendJSON(res, 400, { success: false, error: "email and password are required" });

    const { rows } = await pool.query(
      "SELECT id, name, email, password, isblocked, role, created_at FROM users WHERE email = $1",
      [email]
    );
    if (!rows.length) return sendJSON(res, 401, { success: false, error: "Invalid credentials" });

    const user = rows[0];
    if (user.isblocked) return sendJSON(res, 403, { success: false, error: "Account not verified" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return sendJSON(res, 401, { success: false, error: "Invalid credentials" });

    return sendJSON(res, 200, { success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return sendJSON(res, 500, { success: false, error: error.message });
  }
}
