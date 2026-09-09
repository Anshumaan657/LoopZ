import type { ReactNode } from "react";

import { AuthGuard } from "../../features/auth/auth-guard";

export default function RunsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
