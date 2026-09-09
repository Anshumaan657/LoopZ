import type { ReactNode } from "react";

import { AuthGuard } from "../../features/auth/auth-guard";

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
