import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { assignTicket } from "@/services/ticketService";
import { TicketError } from "@/services/ticketService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ticket = await assignTicket(id, user.userId);
    return Response.json({ ticket });
  } catch (error) {
    if (error instanceof TicketError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[admin/assign]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
