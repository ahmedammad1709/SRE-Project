import pool from "../api/db.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.argv[2];
  const plaintext = process.argv[3];
  if (!email || !plaintext) {
    console.error("Usage: node scripts/check-password.js <email> <password>");
    process.exit(1);
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );
    if (!rows.length) {
      console.error("No user found for email:", email);
      process.exit(2);
    }
    const ok = await bcrypt.compare(plaintext, rows[0].password);
    console.log(JSON.stringify({ email, match: ok }));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end().catch(() => {});
  }
}

main();
