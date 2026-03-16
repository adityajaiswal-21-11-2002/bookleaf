import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { getBookById } from "@/services/bookService";

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
    const book = await getBookById(id, user);

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    return Response.json({ book });
  } catch (error) {
    console.error("[books/:id GET]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
