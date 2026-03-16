import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createTicket, getTicketsForUser } from "@/services/ticketService";
import { TicketError } from "@/services/ticketService";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await getTicketsForUser(user);
    return Response.json({ tickets });
  } catch (error) {
    console.error("[tickets GET]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "author") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { bookId?: string; subject?: string; description?: string; attachmentUrl?: string };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { bookId, subject, description, attachmentUrl } = body;

    const ticket = await createTicket({
      authorId: user.userId,
      bookId,
      subject,
      description,
      attachmentUrl,
    });

    return Response.json({ ticket });
  } catch (error) {
    if (error instanceof TicketError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[tickets POST]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
