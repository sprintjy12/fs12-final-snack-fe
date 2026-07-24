import { Suspense, type ReactNode } from "react";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
