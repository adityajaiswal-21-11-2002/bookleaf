import { NextRequest } from "next/server";
import { login, AuthError } from "@/services/authService";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const result = await login(email, password);

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
    console.error("[auth/login]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
