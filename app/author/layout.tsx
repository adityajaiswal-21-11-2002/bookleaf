import { AuthProvider } from "@/components/AuthProvider";

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider requiredRole="author">{children}</AuthProvider>;
}
