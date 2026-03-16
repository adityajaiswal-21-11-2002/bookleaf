import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", userId: authUser.userId });

      const poll = async () => {
        try {
          await dbConnect();
          const filter =
            authUser.role === "author"
              ? { authorId: authUser.userId }
              : {};
          const tickets = await Ticket.find(filter)
            .populate("bookId", "title isbn")
            .populate("authorId", "name email")
            .sort({ updatedAt: -1 })
            .lean();

          send({ type: "tickets", tickets });
        } catch (err) {
          console.error("SSE poll error:", err);
          send({ type: "error", message: "Poll failed" });
        }
      };

      await poll();
      const interval = setInterval(poll, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
