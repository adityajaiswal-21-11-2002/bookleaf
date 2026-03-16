import { NextRequest } from "next/server";
import { register, AuthError } from "@/services/authService";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "author" } = await request.json();

    // Security: Only allow author registration via public API. Admin accounts via seed only.
    if (role !== "author") {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const result = await register(name, email, password, "author");

    const response = Response.json({
      user: result.user,
      token: result.token,
    });

    response.headers.set(
      "Set-Cookie",
      `auth-token=${result.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
    );

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[auth/register]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
