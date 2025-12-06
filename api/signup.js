import pool from "./db.js";
import nodemailer from "nodemailer";
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

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function cleanupExpiredOtps() {
  await pool.query("DELETE FROM otp_storage WHERE expires_at <= NOW()");
}


async function createTransporter() {
  const useTest = !process.env.SMTP_USER || !process.env.SMTP_PASS;
  if (useTest) {
    const account = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      }),
      useTest,
    };
  }
  return {
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
    useTest,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJSON(res, 405, { success: false, error: "Method Not Allowed" });

    await cleanupExpiredOtps();

    const body = await parseJSON(req);
    const { name, email, password, confirmPassword } = body;
    if (!name || !email || !password || !confirmPassword)
      return sendJSON(res, 400, { success: false, error: "name, email, password, confirmPassword are required" });
    if (password !== confirmPassword)
      return sendJSON(res, 400, { success: false, error: "Passwords do not match" });

    const existing = await pool.query("SELECT id, isblocked FROM users WHERE email = $1", [email]);
    if (existing.rowCount && existing.rows[0].isblocked === false) {
      return sendJSON(res, 409, { success: false, error: "Email already registered" });
    }

    const otp = generateOTP();
    const passwordHash = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await pool.query("DELETE FROM otp_storage WHERE email = $1", [email]);
    await pool.query(
      `INSERT INTO otp_storage (email, otp, attempts, created_at, expires_at)
       VALUES ($1, $2, $3, NOW(), $4)`,
      [email, otp, 0, expiresAt]
    );

    const { transporter, useTest } = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your verification code",
      text: `Your verification code is: ${otp}`,
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });
    const previewUrl = useTest ? nodemailer.getTestMessageUrl(info) : undefined;

    if (!existing.rowCount) {
      await pool.query(
        "INSERT INTO users (name, email, password, isblocked, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
        [name, email, passwordHash, true, "user"]
      );
    } else {
      await pool.query(
        "UPDATE users SET name = $2, password = $3 WHERE id = $1",
        [existing.rows[0].id, name, passwordHash]
      );
    }

    return sendJSON(res, 200, { success: true, message: "OTP sent to email", previewUrl });
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
