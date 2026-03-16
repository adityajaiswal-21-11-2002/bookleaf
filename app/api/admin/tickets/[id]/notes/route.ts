import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { addInternalNote } from "@/services/ticketService";
import { TicketError } from "@/services/ticketService";

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
    const { content } = await request.json();

    const ticket = await addInternalNote(id, content, user.userId);
    return Response.json({ ticket });
  } catch (error) {
    if (error instanceof TicketError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[admin/notes]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
