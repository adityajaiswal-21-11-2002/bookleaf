/**
 * API E2E Test Script
 * Run: node scripts/test-api.js
 * Requires: MONGODB_URI, server running at localhost:3000
 */

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchApi(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });
  const data = res.ok ? await res.json().catch(() => ({})) : await res.text();
  return { ok: res.ok, status: res.status, data };
}

async function runTests() {
  console.log("\n=== BookLeaf API E2E Tests ===\n");

  let passed = 0;
  let failed = 0;

  // 1. Register author
  const reg = await fetchApi("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Test Author",
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      role: "author",
    }),
  });
  if (reg.ok && reg.data?.user) {
    console.log("✓ Register author");
    passed++;
  } else {
    console.log("✗ Register author", reg.status, reg.data);
    failed++;
  }

  // 2. Login author
  const loginAuth = await fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "priya.sharma@email.com",
      password: "password123",
    }),
  });
  if (loginAuth.ok && loginAuth.data?.user?.role === "author") {
    console.log("✓ Login author");
    passed++;
  } else {
    console.log("✗ Login author", loginAuth.status, loginAuth.data);
    failed++;
  }

  // 3. Login admin
  const loginAdmin = await fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@bookleaf.com",
      password: "admin123",
    }),
  });
  if (loginAdmin.ok && loginAdmin.data?.user?.role === "admin") {
    console.log("✓ Login admin");
    passed++;
  } else {
    console.log("✗ Login admin", loginAdmin.status, loginAdmin.data);
    failed++;
  }

  // 4. GET /api/auth/me (with author cookie from step 2)
  const me = await fetchApi("/api/auth/me");
  if (me.ok && me.data?.user) {
    console.log("✓ GET /api/auth/me");
    passed++;
  } else {
    console.log("✗ GET /api/auth/me", me.status);
    failed++;
  }

  // 5. GET /api/books (author)
  const books = await fetchApi("/api/books");
  if (books.ok && Array.isArray(books.data?.books)) {
    console.log("✓ GET /api/books");
    passed++;
  } else {
    console.log("✗ GET /api/books", books.status, books.data);
    failed++;
  }

  // 6. POST /api/tickets (author - need to login again for cookie)
  await fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "priya.sharma@email.com",
      password: "password123",
    }),
  });
  const firstBook = books.data?.books?.[0]?._id;
  const createTicket = await fetchApi("/api/tickets", {
    method: "POST",
    body: JSON.stringify({
      bookId: firstBook || "invalid",
      subject: "Test ticket",
      description: "Test description for E2E",
    }),
  });
  if (createTicket.ok && createTicket.data?.ticket) {
    console.log("✓ POST /api/tickets");
    passed++;
  } else if (!firstBook) {
    console.log("- POST /api/tickets (skipped - no books)");
  } else {
    console.log("✗ POST /api/tickets", createTicket.status, createTicket.data);
    failed++;
  }

  // 7. GET /api/tickets
  const tickets = await fetchApi("/api/tickets");
  if (tickets.ok && Array.isArray(tickets.data?.tickets)) {
    console.log("✓ GET /api/tickets");
    passed++;
  } else {
    console.log("✗ GET /api/tickets", tickets.status);
    failed++;
  }

  // 8. GET /api/admin/tickets (need admin login)
  await fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@bookleaf.com",
      password: "admin123",
    }),
  });
  const adminTickets = await fetchApi("/api/admin/tickets");
  if (adminTickets.ok && Array.isArray(adminTickets.data?.tickets)) {
    console.log("✓ GET /api/admin/tickets");
    passed++;
  } else {
    console.log("✗ GET /api/admin/tickets", adminTickets.status);
    failed++;
  }

  // 9. Author cannot access admin tickets (login as author, try admin)
  await fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "priya.sharma@email.com",
      password: "password123",
    }),
  });
  const authorAccessAdmin = await fetchApi("/api/admin/tickets");
  if (!authorAccessAdmin.ok && authorAccessAdmin.status === 403) {
    console.log("✓ Author blocked from admin routes");
    passed++;
  } else {
    console.log("✗ Author should be blocked from admin", authorAccessAdmin.status);
    failed++;
  }

  // 10. Unauthenticated cannot access /api/tickets
  await fetchApi("/api/auth/logout", { method: "POST" });
  const noAuth = await fetchApi("/api/tickets");
  if (!noAuth.ok && noAuth.status === 401) {
    console.log("✓ Unauthenticated blocked");
    passed++;
  } else {
    console.log("✗ Unauthenticated should be blocked", noAuth.status);
    failed++;
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test run failed:", err);
  process.exit(1);
});
