try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config({ path: ".env" });
} catch {}

const checks = [];
let hasError = false;

if (!process.env.MONGODB_URI) {
  checks.push({ name: "MONGODB_URI", ok: false, msg: "Missing" });
  hasError = true;
} else {
  checks.push({ name: "MONGODB_URI", ok: true, msg: "Set" });
}

if (!process.env.JWT_SECRET) {
  checks.push({ name: "JWT_SECRET", ok: false, msg: "Missing" });
  hasError = true;
} else {
  checks.push({ name: "JWT_SECRET", ok: true, msg: "Set" });
}

if (!process.env.GROQ_API_KEY) {
  checks.push({ name: "GROQ_API_KEY", ok: false, msg: "Missing (AI features will use fallbacks)" });
} else {
  checks.push({ name: "GROQ_API_KEY", ok: true, msg: "Set" });
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  checks.push({ name: "NEXT_PUBLIC_APP_URL", ok: false, msg: "Missing (defaults to localhost:3000)" });
} else {
  checks.push({ name: "NEXT_PUBLIC_APP_URL", ok: true, msg: "Set" });
}

console.log("\nEnvironment check:");
checks.forEach((c) => {
  const icon = c.ok ? "✓" : "✗";
  const color = c.ok ? "\x1b[32m" : "\x1b[31m";
  console.log(`  ${color}${icon}\x1b[0m ${c.name}: ${c.msg}`);
});

const fs = require("fs");
const path = require("path");
const dataPath = path.join(__dirname, "bookleaf_sample_data.json");
if (fs.existsSync(dataPath)) {
  console.log("\n  ✓ bookleaf_sample_data.json found");
} else {
  console.log("\n  ✗ bookleaf_sample_data.json NOT found at", dataPath);
  hasError = true;
}

if (hasError) {
  console.log("\nFix errors above and try again.\n");
  process.exit(1);
}
console.log("\nAll checks passed.\n");
