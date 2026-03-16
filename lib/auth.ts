import { cookies } from "next/headers";
import { verifyToken, type AuthUser } from "@/services/authService";

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(
  handler: (req: Request, user: AuthUser) => Promise<Response>
) {
  return async (req: Request) => {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, user);
  };
}

export function requireAdmin(
  handler: (req: Request, user: AuthUser) => Promise<Response>
) {
  return async (req: Request) => {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(req, user);
  };
}
