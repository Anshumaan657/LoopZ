import { AuthForm } from "../../features/auth/auth-form";

function safeRedirect(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith("/") && !candidate.startsWith("//") ? candidate : "/history";
}

export default async function AuthPage({ searchParams }: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const query = await searchParams;
  return <AuthForm redirectTo={safeRedirect(query.next)} />;
}
