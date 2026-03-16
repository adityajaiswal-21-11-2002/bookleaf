try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config({ path: ".env" });
} catch {
  // dotenv optional - env vars may be set externally
}

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bookleaf";

if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not set in .env or .env.local");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: String,
  isbn: String,
  genre: String,
  publication_date: Date,
  status: String,
  mrp: Number,
  copies_sold: Number,
  royalty_earned: Number,
  royalty_paid: Number,
  royalty_pending: Number,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const ticketSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  subject: String,
  description: String,
  category: String,
  priority: String,
  status: { type: String, default: "Open" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messages: [messageSchema],
  internalNotes: [],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);
const Ticket = mongoose.model("Ticket", ticketSchema);

async function seed() {
  const dataPath = path.join(__dirname, "bookleaf_sample_data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("ERROR: bookleaf_sample_data.json not found at", dataPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, "utf8");
  let sampleData;
  try {
    sampleData = JSON.parse(rawData);
  } catch (e) {
    console.error("ERROR: Invalid JSON in bookleaf_sample_data.json", e.message);
    process.exit(1);
  }

  const { authors: jsonAuthors } = sampleData;
  if (!jsonAuthors || !Array.isArray(jsonAuthors)) {
    console.error("ERROR: bookleaf_sample_data.json must have an 'authors' array");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  await User.deleteMany({});
  await Book.deleteMany({});
  await Ticket.deleteMany({});

  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const authorMap = {};
  for (const a of jsonAuthors) {
    if (!a.email || !a.name) {
      console.warn("Skipping author with missing email/name:", a);
      continue;
    }
    const user = await User.create({
      name: a.name,
      email: a.email,
      password: hashedPassword,
      role: "author",
    });
    authorMap[a.author_id] = user;
  }

  const admin = await User.create({
    name: "Admin User",
    email: "admin@bookleaf.com",
    password: adminPassword,
    role: "admin",
  });

  const bookMap = {};
  const insertedBooks = [];

  for (const a of jsonAuthors) {
    const authorUser = authorMap[a.author_id];
    if (!authorUser || !a.books || !Array.isArray(a.books)) continue;

    for (const b of a.books) {
      const book = await Book.create({
        title: b.title || "Untitled",
        isbn: b.isbn || `978-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        genre: b.genre || "General",
        publication_date: b.publication_date ? new Date(b.publication_date) : undefined,
        status: b.status || "Draft",
        mrp: b.mrp != null ? b.mrp : undefined,
        copies_sold: b.total_copies_sold ?? 0,
        royalty_earned: b.total_royalty_earned ?? 0,
        royalty_paid: b.royalty_paid ?? 0,
        royalty_pending: b.royalty_pending ?? 0,
        authorId: authorUser._id,
      });
      bookMap[b.book_id] = book;
      insertedBooks.push(book);
    }
  }

  const ticketSubjects = [
    "Royalty payment delay for Q3",
    "ISBN not showing on Amazon",
    "Print quality issue - pages misaligned",
    "Book not available on Flipkart",
    "When will my book status change to Published?",
    "General inquiry about distribution",
    "Minimum payout threshold question",
    "Stock sync issue on Amazon",
  ];

  const categories = [
    "Royalty & Payments",
    "ISBN & Metadata Issues",
    "Printing & Quality",
    "Distribution & Availability",
    "Book Status & Production Updates",
    "General Inquiry",
  ];

  const priorities = ["Critical", "High", "Medium", "Low"];

  const authorUsers = Object.values(authorMap);
  const publishedBooks = insertedBooks.filter((b) => b.status && b.status.includes("Published"));

  for (let i = 0; i < 8; i++) {
    const author = authorUsers[i % authorUsers.length];
    const book = (publishedBooks.length ? publishedBooks : insertedBooks)[i % (publishedBooks.length || insertedBooks.length)];
    const status = ["Open", "Open", "In Progress", "Resolved", "Closed"][i % 5];
    await Ticket.create({
      authorId: author._id,
      bookId: book._id,
      subject: ticketSubjects[i % ticketSubjects.length],
      description: `Sample ticket description ${i + 1}. This is a test support ticket for the BookLeaf system.`,
      category: categories[i % categories.length],
      priority: priorities[i % 4],
      status,
      messages: [
        {
          sender: "author",
          message: `Sample ticket description ${i + 1}. This is a test support ticket for the BookLeaf system.`,
          createdAt: new Date(),
        },
        ...(status !== "Open" ? [{
          sender: "admin",
          message: "Thank you for reaching out. We are looking into this.",
          createdAt: new Date(),
        }] : []),
      ],
      internalNotes: status === "Resolved" ? [{ content: "Resolved via email", adminId: admin._id, createdAt: new Date() }] : [],
    });
  }

  console.log("\nSeed complete!");
  console.log("Authors:", authorUsers.length, "- e.g. priya.sharma@email.com (password: password123)");
  console.log("Admin: admin@bookleaf.com (password: admin123)");
  console.log("Books:", insertedBooks.length);
  console.log("Tickets: 8");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
