import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["author", "admin"], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const internalNoteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ticketSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "General Inquiry" },
    priority: { type: String, default: "Medium" },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    messages: [messageSchema],
    internalNotes: [internalNoteSchema],
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
