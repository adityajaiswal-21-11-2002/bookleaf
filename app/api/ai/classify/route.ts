import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { classifyTicket } from "@/services/aiService";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, description } = await request.json();
    if (!subject || !description) {
      return Response.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    const result = await classifyTicket(subject, description);
    return Response.json(result);
  } catch (error) {
    console.error("[ai/classify]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
