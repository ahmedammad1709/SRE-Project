import pool from "../api/db.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.argv[2];
  const plaintext = process.argv[3];
  if (!email || !plaintext) {
    console.error("Usage: node scripts/update-password.js <email> <password>");
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(plaintext, 10);
    const res = await pool.query(
      "UPDATE users SET password = $2 WHERE email = $1 RETURNING id, email, role, isblocked",
      [email, hash]
    );
    if (!res.rowCount) {
      console.error("No user found for email:", email);
      process.exit(2);
    }
    console.log(JSON.stringify({ updated: true, id: res.rows[0].id, email: res.rows[0].email }));
  } catch (err) {
    console.error("Error updating password:", err.message);
    process.exit(3);
  } finally {
    await pool.end().catch(() => {});
  }
}

main();
