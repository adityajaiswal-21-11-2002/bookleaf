import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { addAdminResponse } from "@/services/ticketService";
import { TicketError } from "@/services/ticketService";

// Dynamic require for socket emitter (only available with custom server)
const getEmitter = () => {
  try {
    return require("../../../../../../lib/socketEmitter");
  } catch {
    return null;
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await request.json();

    const ticket = await addAdminResponse(id, message, user.userId);

    // Emit Socket.io update for author (when custom server is used)
    const emitter = getEmitter();
    if (emitter?.emitTicketUpdate && ticket?.authorId) {
      const aid = ticket.authorId as { _id?: { toString?: () => string } } | string;
      const authorIdStr =
        typeof aid === "object" && aid !== null ? String(aid._id ?? aid) : String(aid);
      if (authorIdStr && authorIdStr !== "undefined") {
        emitter.emitTicketUpdate(authorIdStr, ticket);
      }
    }

    return Response.json({ ticket });
  } catch (error) {
    if (error instanceof TicketError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[admin/respond]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
