"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const parsePage = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

/** 페이지 번호를 URL의 `page` 쿼리 파라미터와 동기화합니다. */
export const useUrlPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page");
  const page = parsePage(rawPage);

  const setPage = useCallback(
    (nextPage: number) => {
      const safePage =
        Number.isInteger(nextPage) && nextPage > 0 ? nextPage : 1;
      const params = new URLSearchParams(searchParams.toString());

      if (safePage === 1) {
        params.delete("page");
      } else {
        params.set("page", String(safePage));
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (rawPage !== null && rawPage !== String(page)) {
      setPage(page);
    }
  }, [page, rawPage, setPage]);

  return { page, setPage };
};
