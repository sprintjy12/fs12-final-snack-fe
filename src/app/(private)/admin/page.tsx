"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import axios from "axios";

import { AdminInviteButton } from "@/app/(private)/admin/AdminInviteButton";
import {
  AdminMemberList,
  mapUserToAdminMember,
} from "@/app/(private)/admin/AdminMemberList";
import { EmptyState, Icon, type PaginationItem } from "@/components/ui";
import { useUsers } from "@/hooks/queries/useUsers";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

/** 시안용 페이지 번호 배열을 API totalPages 기준으로 만듭니다. */
const buildPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 0) {
    return ["1"];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => String(index + 1));
  }

  const items: PaginationItem[] = ["1", "2", "3", "4", "5", "more"];
  items.push(String(totalPages));
  return items;
};

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const [nameInput, setNameInput] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextName = nameInput.trim();
      if (nextName === name) {
        return;
      }
      setPage(1);
      setName(nextName);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameInput, name]);

  const { data, isPending, isError, error } = useUsers({
    page,
    limit: PAGE_SIZE,
    ...(name ? { name } : {}),
  });

  const members = useMemo(
    () => (data?.data ?? []).map(mapUserToAdminMember),
    [data?.data],
  );
  const pagination = data?.pagination;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 0;
  const hasNextPage = currentPage < totalPages;
  const hasMembers = members.length > 0;

  // 마지막 페이지에서 전원 탈퇴 등으로 totalPages가 줄면 유효 페이지로 보정
  useEffect(() => {
    if (isPending || !pagination) {
      return;
    }

    if (pagination.totalPages <= 0) {
      if (page !== 1) {
        setPage(1);
      }
      return;
    }

    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [isPending, page, pagination]);

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = nameInput.trim();
    if (nextName === name) {
      return;
    }
    setPage(1);
    setName(nextName);
  };

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      {/* 관리 하위 탭 */}
      <nav
        aria-label="관리 메뉴"
        className="border-b border-solid border-border bg-surface-muted"
      >
        <div className="mx-auto flex max-w-[1680px] items-center gap-3 px-6 xl:h-16 xl:px-[120px]">
          <Link
            href="/admin"
            aria-current="page"
            className="flex items-center justify-center border-b-2 border-accent px-2.5 py-3.5 text-sm leading-6 font-bold text-accent xl:h-16 xl:px-2.5 xl:text-lg xl:leading-[26px]"
          >
            회원 관리
          </Link>
          <Link
            href="/budget"
            className="flex items-center justify-center px-2.5 py-3.5 text-sm leading-6 font-medium text-snack-gray-400 xl:h-16 xl:px-4 xl:text-lg xl:leading-[26px]"
          >
            예산 관리
          </Link>
        </div>
      </nav>

      {/* 타이틀 + 초대 버튼 (Mobile/Tablet) */}
      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between xl:h-24 xl:py-4">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-[32px] xl:leading-[42px]">
            회원 관리
          </h1>

          <AdminInviteButton className="flex cursor-pointer items-center justify-center gap-0 rounded-2xl bg-transparent py-1 text-sm leading-6 font-semibold text-accent xl:hidden">
            <Icon name="plus" size="sm" className="text-accent" />
            회원 초대
          </AdminInviteButton>
        </div>
      </section>

      <div className="mx-auto max-w-[1680px] px-6 pt-4 md:pt-6 xl:px-[120px] xl:pt-0">
        {/* 검색 + Desktop 초대 */}
        <div className="flex items-center gap-6 xl:justify-end">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex w-full items-center xl:w-[402px]"
          >
            <label className="relative flex w-full items-center">
              <span className="pointer-events-none absolute left-4 flex items-center text-snack-gray-500 xl:left-6">
                <span className="xl:hidden">
                  <Icon name="search" size="sm" />
                </span>
                <span className="hidden xl:inline-flex">
                  <Icon name="search" size="md" />
                </span>
              </span>
              <input
                type="search"
                inputMode="search"
                aria-label="이름으로 검색"
                placeholder="이름으로 검색하세요"
                value={nameInput}
                onChange={handleSearchChange}
                className="h-[54px] w-full rounded-2xl border border-border bg-surface py-3.5 pr-4 pl-11 text-sm leading-6 text-foreground outline-none placeholder:text-snack-gray-500 xl:h-16 xl:pr-6 xl:pl-[68px] xl:text-xl xl:leading-8"
              />
            </label>
          </form>

          <AdminInviteButton className="hidden h-16 w-[213px] shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-accent p-4 text-xl leading-8 font-semibold text-surface xl:flex">
            회원 초대하기
          </AdminInviteButton>
        </div>

        {isPending ? (
          <p className="py-16 text-center text-foreground-muted">
            회원 목록을 불러오는 중…
          </p>
        ) : null}

        {isError ? (
          <p className="py-16 text-center text-snack-state-100">
            {getErrorMessage(error, "회원 목록을 불러오지 못했습니다.")}
          </p>
        ) : null}

        {!isPending && !isError ? (
          <>
            {hasMembers ? (
              <>
                {/* Desktop 테이블 헤더 */}
                <div className="mt-6 hidden xl:block">
                  <div className="flex h-20 w-full items-center justify-center rounded-full border border-snack-gray-200 bg-surface px-20">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-10">
                        <div className="flex h-20 w-[250px] items-center justify-center px-10 text-xl leading-8 font-medium text-snack-black-100">
                          이름
                        </div>
                        <div className="flex h-20 w-[300px] items-center justify-center text-xl leading-8 font-medium text-snack-black-100">
                          메일
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex h-20 w-[250px] items-center justify-center text-xl leading-8 font-medium text-snack-black-100">
                          권한
                        </div>
                        <div className="flex h-20 w-[250px] items-center justify-center text-xl leading-8 font-medium text-snack-black-100">
                          비고
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <AdminMemberList
                  members={members}
                  paginationItems={paginationItems}
                  currentPage={String(currentPage)}
                  previousDisabled={currentPage <= 1}
                  nextDisabled={!hasNextPage}
                  onPrevious={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  onNext={() =>
                    setPage((current) => (hasNextPage ? current + 1 : current))
                  }
                  onPageSelect={(selected) => {
                    const nextPage = Number(selected);
                    if (Number.isInteger(nextPage) && nextPage > 0) {
                      setPage(nextPage);
                    }
                  }}
                />
              </>
            ) : (
              <EmptyState
                aria-label="회원 없음"
                image="empty-members"
                title="아직 회원이 없어요"
                className="pt-[64px] md:pt-[104px] xl:pt-[155px]"
                contentClassName="w-[375px] xl:w-[388px]"
                description={
                  <>
                    <span className="block">함께 이용할 회원을 초대하고</span>
                    <span className="block">간식 구매를 통합 관리하세요</span>
                  </>
                }
              />
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
