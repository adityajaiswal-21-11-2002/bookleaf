import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { generateDraftResponse } from "@/services/aiService";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, description, bookTitle } = await request.json();
    if (!subject || !description) {
      return Response.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    const result = await generateDraftResponse(subject, description, bookTitle);
    return Response.json({ draft: result.response, ...(result.error && { error: result.error }) });
  } catch (error) {
    console.error("[ai/generate-response]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
