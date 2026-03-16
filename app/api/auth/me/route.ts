import { getAuthUser } from "@/lib/auth";
import { getMe } from "@/services/authService";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getMe(authUser.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("[auth/me]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
