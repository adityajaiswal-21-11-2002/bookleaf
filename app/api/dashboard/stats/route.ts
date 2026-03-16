import dbConnect from "@/lib/mongodb";
import Book from "@/models/Book";
import Ticket from "@/models/Ticket";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    if (user.role === "author") {
      const [books, tickets] = await Promise.all([
        Book.find({ authorId: user.userId }).select("royalty_earned royalty_pending").lean(),
        Ticket.find({ authorId: user.userId, status: { $in: ["Open", "In Progress"] } })
          .select("_id")
          .lean(),
      ]);

      const totalBooks = books.length;
      const totalRoyalties = books.reduce((s, b) => s + (b.royalty_earned || 0), 0);
      const pendingRoyalties = books.reduce((s, b) => s + (b.royalty_pending || 0), 0);
      const openTickets = tickets.length;

      return Response.json({
        totalBooks,
        totalRoyalties,
        pendingRoyalties,
        openTickets,
      });
    }

    const [totalTickets, openTickets] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $in: ["Open", "In Progress"] } }),
    ]);

    return Response.json({
      totalTickets,
      openTickets,
    });
  } catch (error) {
    console.error("[dashboard/stats]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
