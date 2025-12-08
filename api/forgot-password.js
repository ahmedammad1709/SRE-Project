import pool from "./db.js";
import nodemailer from "nodemailer";

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
    const { email } = body;
    if (!email) return sendJSON(res, 400, { success: false, error: "email is required" });

    const userRes = await pool.query("SELECT id, email FROM users WHERE email = $1", [email]);
    if (!userRes.rowCount) {
      return sendJSON(res, 404, { success: false, error: "Email not found" });
    }

    const otp = generateOTP();
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
      subject: "Password Reset Code",
      text: `Your password reset code is: ${otp}`,
      html: `<p>Your password reset code is: <strong>${otp}</strong></p>`,
    });
    const previewUrl = useTest ? nodemailer.getTestMessageUrl(info) : undefined;

    return sendJSON(res, 200, { success: true, message: "OTP sent to email", previewUrl });
  } catch (error) {
    return sendJSON(res, 500, { success: false, error: error.message });
  }
}

