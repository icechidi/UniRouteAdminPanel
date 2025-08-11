import "dotenv/config"
import { hashPassword } from "../lib/auth"
import { getSql } from "../lib/db"

async function setAdminPassword(email: string, password: string) {
  const sql = getSql()
  const passwordHash = await hashPassword(password)
  const result = await sql.query(
    `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING user_id` ,
    [passwordHash, email]
  )
  if (result.rows.length > 0) {
    console.log(`Admin password updated for ${email}`)
  } else {
    console.log(`No user found with email ${email}`)
  }
}

// Usage: npx ts-node scripts/set-admin-password.ts admin@uniroute.edu newpassword123
const [,, email, password] = process.argv
if (!email || !password) {
  console.error("Usage: npx ts-node scripts/set-admin-password.ts <admin_email> <new_password>")
  process.exit(1)
}
setAdminPassword(email, password).then(() => process.exit(0))
