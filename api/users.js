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
    if (req.method === "GET") {
      const { rows } = await pool.query(
        "SELECT id, name, email, created_at, COALESCE(isblocked, false) as isblocked FROM users WHERE COALESCE(role, 'user') != 'admin' ORDER BY id ASC"
      );
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
      const { email, name, password } = body;
      
      // Update name only (requires password verification)
      if (email && name && password !== undefined) {
        // Verify password
        const { rows: userRows } = await pool.query(
          "SELECT password FROM users WHERE email = $1",
          [email]
        );
        if (!userRows.length) return sendJSON(res, 404, { success: false, error: "user not found" });
        
        const passwordMatch = await bcrypt.compare(password, userRows[0].password);
        if (!passwordMatch) return sendJSON(res, 401, { success: false, error: "Invalid password" });
        
        // Update name
        const { rows } = await pool.query(
          "UPDATE users SET name = $1 WHERE email = $2 RETURNING id, name, email, created_at",
          [name, email]
        );
        return sendJSON(res, 200, { success: true, data: rows[0] });
      }
      
      // Change password
      if (email && body.currentPassword && body.newPassword) {
        const { newPassword, confirmPassword } = body;
        if (newPassword !== confirmPassword) {
          return sendJSON(res, 400, { success: false, error: "New password and confirmation do not match" });
        }
        if (newPassword.length < 8) {
          return sendJSON(res, 400, { success: false, error: "Password must be at least 8 characters" });
        }
        
        // Verify current password
        const { rows: userRows } = await pool.query(
          "SELECT password FROM users WHERE email = $1",
          [email]
        );
        if (!userRows.length) return sendJSON(res, 404, { success: false, error: "user not found" });
        
        const passwordMatch = await bcrypt.compare(body.currentPassword, userRows[0].password);
        if (!passwordMatch) return sendJSON(res, 401, { success: false, error: "Current password is incorrect" });
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        const { rows } = await pool.query(
          "UPDATE users SET password = $1 WHERE email = $2 RETURNING id, name, email, created_at",
          [hashedPassword, email]
        );
        return sendJSON(res, 200, { success: true, data: rows[0] });
      }
      
      // Update name and/or email (requires password verification)
      if (email && body.password) {
        // Verify password
        const { rows: userRows } = await pool.query(
          "SELECT password FROM users WHERE email = $1",
          [email]
        );
        if (!userRows.length) return sendJSON(res, 404, { success: false, error: "user not found" });
        
        const passwordMatch = await bcrypt.compare(body.password, userRows[0].password);
        if (!passwordMatch) return sendJSON(res, 401, { success: false, error: "Invalid password" });
        
        // If newEmail is provided and different, update email
        if (body.newEmail && body.newEmail !== email) {
          // Check if new email already exists
          const { rows: emailCheck } = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [body.newEmail]
          );
          if (emailCheck.length > 0) {
            return sendJSON(res, 400, { success: false, error: "Email already exists" });
          }
          
          // Update both name and email
          const updateQuery = name
            ? "UPDATE users SET name = $1, email = $2 WHERE email = $3 RETURNING id, name, email, created_at"
            : "UPDATE users SET email = $1 WHERE email = $2 RETURNING id, name, email, created_at";
          const updateParams = name ? [name, body.newEmail, email] : [body.newEmail, email];
          
          const { rows } = await pool.query(updateQuery, updateParams);
          return sendJSON(res, 200, { success: true, data: rows[0] });
        } else if (name) {
          // Only update name
          const { rows } = await pool.query(
            "UPDATE users SET name = $1 WHERE email = $2 RETURNING id, name, email, created_at",
            [name, email]
          );
          return sendJSON(res, 200, { success: true, data: rows[0] });
        }
      }
      
      return sendJSON(res, 400, { success: false, error: "Invalid request parameters" });
    }

    if (req.method === "PATCH") {
      const body = await parseJSON(req);
      const { userId, isblocked } = body;
      
      if (userId === undefined || isblocked === undefined) {
        return sendJSON(res, 400, { success: false, error: "userId and isblocked are required" });
      }
      
      // Toggle ban status
      const { rows } = await pool.query(
        "UPDATE users SET isblocked = $1 WHERE id = $2 RETURNING id, name, email, created_at, COALESCE(isblocked, false) as isblocked",
        [isblocked, userId]
      );
      
      if (!rows.length) return sendJSON(res, 404, { success: false, error: "user not found" });
      
      return sendJSON(res, 200, { success: true, data: rows[0] });
    }

    if (req.method === "DELETE") {
      const body = await parseJSON(req);
      const { email, password } = body;
      
      if (!email || !password) {
        return sendJSON(res, 400, { success: false, error: "email and password are required" });
      }
      
      // Verify password
      const { rows: userRows } = await pool.query(
        "SELECT password FROM users WHERE email = $1",
        [email]
      );
      if (!userRows.length) return sendJSON(res, 404, { success: false, error: "user not found" });
      
      const passwordMatch = await bcrypt.compare(password, userRows[0].password);
      if (!passwordMatch) return sendJSON(res, 401, { success: false, error: "Invalid password" });
      
      // Delete user's projects first (CASCADE should handle this, but being explicit)
      await pool.query("DELETE FROM projects WHERE created_by = $1", [email]);
      
      // Delete user
      const result = await pool.query("DELETE FROM users WHERE email = $1", [email]);
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
