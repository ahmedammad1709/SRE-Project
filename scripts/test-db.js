import pool from "../api/db.js";

async function main() {
  try {
    const res = await pool.query("SELECT 1 AS ok");
    console.log({ connected: true, result: res.rows[0] });
  } catch (err) {
    console.error({ connected: false, error: err.message });
  } finally {
    await pool.end().catch(() => {});
  }
}

main();
