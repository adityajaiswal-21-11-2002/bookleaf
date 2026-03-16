import dbConnect from "@/lib/mongodb";
import Book from "@/models/Book";
import type { AuthUser } from "./authService";

export async function getBooksForUser(user: AuthUser) {
  await dbConnect();
  const filter = user.role === "author" ? { authorId: user.userId } : {};
  return Book.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getBookById(id: string, user: AuthUser) {
  await dbConnect();
  const book = await Book.findById(id).lean();
  if (!book) return null;

  if (user.role === "author") {
    const authorIdStr = String(
      (book.authorId as { _id?: string })?._id ?? book.authorId
    );
    if (authorIdStr !== user.userId) return null;
  }

  return book;
}
