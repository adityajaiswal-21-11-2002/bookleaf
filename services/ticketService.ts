import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Book from "@/models/Book";
import { classifyTicket } from "./aiService";
import type { AuthUser } from "./authService";

export interface CreateTicketInput {
  authorId: string;
  bookId: string;
  subject: string;
  description: string;
  attachmentUrl?: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  date?: string;
}

export class TicketError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "TicketError";
  }
}

export async function createTicket(input: CreateTicketInput) {
  const { authorId, bookId, subject, description, attachmentUrl } = input;

  if (!authorId || !bookId || !subject || !description) {
    throw new TicketError("Book, subject and description are required", 400);
  }

  await dbConnect();

  // Validate book belongs to author (security: prevent ticket for other's books)
  const book = await Book.findById(bookId).select("authorId").lean();
  if (!book) {
    throw new TicketError("Book not found", 404);
  }
  const bookAuthorId = String(book.authorId);
  if (bookAuthorId !== authorId) {
    throw new TicketError("Book does not belong to you", 403);
  }

  let category = "General Inquiry";
  let priority = "Medium";

  try {
    const classification = await classifyTicket(subject, description);
    category = classification.category;
    priority = classification.priority;
  } catch (err) {
    console.error("[ticketService] AI classification failed, using defaults:", err);
    // Ticket still gets created - admin can manually adjust
  }

  const ticket = await Ticket.create({
    authorId,
    bookId,
    subject,
    description,
    category,
    priority,
    attachmentUrl: attachmentUrl || undefined,
    messages: [{ sender: "author", message: description }],
  });

  return Ticket.findById(ticket._id)
    .populate("bookId", "title isbn")
    .populate("authorId", "name email")
    .lean();
}

export async function getTicketsForUser(user: AuthUser) {
  await dbConnect();
  const filter = user.role === "author" ? { authorId: user.userId } : {};
  return Ticket.find(filter)
    .populate("bookId", "title isbn")
    .populate("authorId", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getTicketById(id: string, user: AuthUser) {
  await dbConnect();
  const ticket = await Ticket.findById(id)
    .populate("bookId", "title isbn genre")
    .populate("authorId", "name email")
    .populate("assignedTo", "name email")
    .lean();

  if (!ticket) return null;

  const authorIdStr = String(
    (ticket.authorId as { _id?: string })?._id ?? ticket.authorId
  );
  if (user.role === "author" && authorIdStr !== user.userId) {
    return null;
  }

  const result = ticket as Record<string, unknown>;
  if (user.role === "author") {
    delete result.internalNotes;
  }
  return result;
}

export async function getAdminTickets(filters: TicketFilters) {
  await dbConnect();

  const filter: Record<string, unknown> = {};
  if (filters.status) filter.status = filters.status;
  if (filters.priority) filter.priority = filters.priority;
  if (filters.category) filter.category = filters.category;
  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }

  return Ticket.find(filter)
    .populate("bookId", "title isbn")
    .populate("authorId", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function updateTicketStatus(id: string, status: string) {
  await dbConnect();
  const valid = ["Open", "In Progress", "Resolved", "Closed"];
  if (!valid.includes(status)) {
    throw new TicketError("Invalid status", 400);
  }
  return Ticket.findByIdAndUpdate(id, { status }, { new: true })
    .populate("bookId", "title isbn")
    .populate("authorId", "name email")
    .populate("assignedTo", "name email")
    .lean();
}

export async function addAdminResponse(
  id: string,
  message: string,
  adminId: string
) {
  await dbConnect();
  if (!message?.trim()) {
    throw new TicketError("Message is required", 400);
  }

  const ticket = await Ticket.findByIdAndUpdate(
    id,
    {
      $push: { messages: { sender: "admin", message: message.trim() } },
      status: "In Progress",
    },
    { new: true }
  )
    .populate("bookId", "title isbn")
    .populate("authorId", "name email")
    .populate("assignedTo", "name email")
    .lean();

  if (!ticket) throw new TicketError("Ticket not found", 404);
  return ticket;
}

export async function addInternalNote(
  id: string,
  content: string,
  adminId: string
) {
  await dbConnect();
  if (!content?.trim()) {
    throw new TicketError("Content is required", 400);
  }

  const ticket = await Ticket.findByIdAndUpdate(
    id,
    { $push: { internalNotes: { content: content.trim(), adminId } } },
    { new: true }
  )
    .populate("bookId", "title isbn")
    .populate("authorId", "name email")
    .populate("assignedTo", "name email")
    .lean();

  if (!ticket) throw new TicketError("Ticket not found", 404);
  return ticket;
}

export async function assignTicket(id: string, adminId: string) {
  await dbConnect();
  const ticket = await Ticket.findByIdAndUpdate(
    id,
    { assignedTo: adminId },
    { new: true }
  )
    .populate("bookId", "title isbn")
    .populate("authorId", "name email")
    .populate("assignedTo", "name email")
    .lean();

  if (!ticket) throw new TicketError("Ticket not found", 404);
  return ticket;
}
