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

async function cleanupExpiredOtps() {
  await pool.query("DELETE FROM otp_storage WHERE expires_at <= NOW()");
}


export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJSON(res, 405, { success: false, error: "Method Not Allowed" });

    await cleanupExpiredOtps();

    const body = await parseJSON(req);
    const { email, otp } = body;
    if (!email || !otp) return sendJSON(res, 400, { success: false, error: "email and otp are required" });

    const { rows } = await pool.query(
      "SELECT id, email, otp, attempts, created_at, expires_at FROM otp_storage WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    if (!rows.length) return sendJSON(res, 400, { success: false, error: "No pending verification for this email" });

    const record = rows[0];
    if (record.otp !== otp) {
      await pool.query("UPDATE otp_storage SET attempts = COALESCE(attempts,0) + 1 WHERE id = $1", [record.id]);
      return sendJSON(res, 400, { success: false, error: "Invalid OTP" });
    }
    if (new Date(record.expires_at).getTime() < Date.now())
      return sendJSON(res, 400, { success: false, error: "OTP expired" });

    const updated = await pool.query(
      "UPDATE users SET isblocked = false WHERE email = $1 RETURNING id, name, email, created_at",
      [email]
    );
    await pool.query("DELETE FROM otp_storage WHERE email = $1", [email]);
    return sendJSON(res, 200, { success: true, data: updated.rows[0] });
  } catch (error) {
    return sendJSON(res, 500, { success: false, error: error.message });
  }
}

/*
-- users and otp_verifications tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_verifications (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
*/
