import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    isbn: { type: String, required: true },
    genre: { type: String, required: true },
    publication_date: { type: Date },
    status: { type: String, default: "Draft" },
    mrp: { type: Number },
    copies_sold: { type: Number, default: 0 },
    royalty_earned: { type: Number, default: 0 },
    royalty_paid: { type: Number, default: 0 },
    royalty_pending: { type: Number, default: 0 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Book || mongoose.model("Book", bookSchema);
