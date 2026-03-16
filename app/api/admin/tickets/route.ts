import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAdminTickets } from "@/services/ticketService";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      category: searchParams.get("category") || undefined,
      date: searchParams.get("date") || undefined,
    };

    const tickets = await getAdminTickets(filters);
    return Response.json({ tickets });
  } catch (error) {
    console.error("[admin/tickets GET]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
