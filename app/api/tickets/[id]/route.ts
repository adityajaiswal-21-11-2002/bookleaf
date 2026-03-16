import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getTicketById } from "@/services/ticketService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ticket = await getTicketById(id, user);

    if (!ticket) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    return Response.json({ ticket });
  } catch (error) {
    console.error("[tickets/:id GET]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
