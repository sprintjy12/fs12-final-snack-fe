"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/**
 * 초대 메일은 `/invite?token=` 으로 링크됩니다.
 * 실제 가입 UI는 `/signup?token=` 에 있으므로 리다이렉트합니다.
 * @see fs12-final-snack-be/src/utils/sendInvitationEmail.ts
 */
const InviteRedirectContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    router.replace(`/signup${query}`);
  }, [router, searchParams]);

  return null;
};

const InvitePage = () => (
  <Suspense fallback={null}>
    <InviteRedirectContent />
  </Suspense>
);

export default InvitePage;
