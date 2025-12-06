import pool from "../api/db.js";

async function main() {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, isblocked, password, created_at FROM users ORDER BY id ASC"
    );
    for (const r of rows) {
      console.log({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        isblocked: r.isblocked,
        password: "[hashed]", // stored securely as a hash; plaintext is not retrievable
        created_at: r.created_at,
      });
    }
  } catch (err) {
    console.error("Error fetching users:", err.message);
  } finally {
    await pool.end().catch(() => {});
  }
}

main();
