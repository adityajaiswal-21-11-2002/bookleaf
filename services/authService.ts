import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  return secret || "fallback-secret-change-me";
}
const JWT_SECRET = getJwtSecret();
const TOKEN_EXPIRY = "7d";

export interface AuthUser {
  userId: string;
  email: string;
  role: "author" | "admin";
}

export interface LoginResult {
  user: { id: string; name: string; email: string; role: string };
  token: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  if (!email || !password) {
    throw new AuthError("Email and password are required", 400);
  }

  await dbConnect();
  const user = await User.findOne({ email });

  if (!user) {
    throw new AuthError("Invalid credentials", 401);
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new AuthError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: "author" | "admin" = "author"
): Promise<LoginResult> {
  if (!name || !email || !password) {
    throw new AuthError("Name, email and password are required", 400);
  }

  if (password.length < 6) {
    throw new AuthError("Password must be at least 6 characters", 400);
  }

  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AuthError("Email already registered", 400);
  }

  const user = await User.create({ name, email, password, role });
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as "author" | "admin",
    };
  } catch {
    return null;
  }
}

export async function getMe(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).select("-password");
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
