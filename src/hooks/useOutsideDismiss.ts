"use client";

import { useEffect, useRef, type RefObject } from "react";

type UseOutsideDismissOptions = {
  enabled: boolean;
  onDismiss: () => void;
  /**
   * true면 Escape에서 전파를 막아 상위(ModalShell 등) 닫힘을 방지합니다.
   * 모달 안 드롭다운에서 사용합니다.
   */
  stopEscapePropagation?: boolean;
};

/**
 * 영역 밖 클릭/터치와 Escape로 닫는 공통 훅입니다.
 * 메뉴·드롭다운처럼 같은 닫힘 패턴을 쓰는 곳에서 재사용합니다.
 */
export const useOutsideDismiss = (
  ref: RefObject<HTMLElement | null>,
  {
    enabled,
    onDismiss,
    stopEscapePropagation = false,
  }: UseOutsideDismissOptions,
) => {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && !ref.current?.contains(target)) {
        onDismissRef.current();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (stopEscapePropagation) {
        event.preventDefault();
        event.stopPropagation();
      }

      onDismissRef.current();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener(
      "keydown",
      handleKeyDown,
      stopEscapePropagation,
    );

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener(
        "keydown",
        handleKeyDown,
        stopEscapePropagation,
      );
    };
  }, [enabled, ref, stopEscapePropagation]);
};
