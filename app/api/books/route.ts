import { getAuthUser } from "@/lib/auth";
import { getBooksForUser } from "@/services/bookService";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const books = await getBooksForUser(user);
    return Response.json({ books });
  } catch (error) {
    console.error("[books GET]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
