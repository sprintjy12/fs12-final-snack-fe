"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/Icon";

export type ToastOptions = {
  /** 자동 닫힘 시간(ms). 0이면 수동으로만 닫습니다. 기본값 3000 */
  duration?: number;
};

export type ToastProps = {
  open: boolean;
  message: string;
  /** 제어형 Toast는 닫기 상태를 부모가 관리하므로 onClose가 필요합니다. */
  onClose: () => void;
  duration?: number;
};

type ToastItem = {
  id: number;
  message: string;
  duration: number;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
  dismissToast: () => void;
};

const DEFAULT_DURATION = 3000;

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;
let externalShowToast: ToastContextValue["showToast"] | null = null;
let externalDismissToast: ToastContextValue["dismissToast"] | null = null;

/** Provider 밖에서 호출할 때 사용. ToastProvider가 마운트되어 있어야 합니다. */
export function showToast(message: string, options?: ToastOptions) {
  if (!externalShowToast) {
    console.warn(
      "showToast: ToastProvider가 마운트되지 않았습니다. Providers에 ToastProvider를 추가하세요.",
    );
    return;
  }

  externalShowToast(message, options);
}

export function dismissToast() {
  externalDismissToast?.();
}

function ToastBanner({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const messageId = useId();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={messageId}
      className="flex min-h-16 w-full items-start justify-between gap-3 rounded-lg bg-snack-background-500 px-[30px] py-[19px] md:w-[524px]"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon name="completed" size="sm" className="mt-0.5 text-accent" />
        <p
          id={messageId}
          className="min-w-0 flex-1 text-base leading-[26px] tracking-[-0.16px] break-all text-accent"
        >
          {message}
        </p>
      </div>

      <button
        type="button"
        aria-label="토스트 닫기"
        onClick={onClose}
        className="mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center bg-transparent text-snack-orange-300"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}

function ToastPortal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-[54px] z-[60] flex justify-center md:top-16 xl:top-[88px]">
      <div className="pointer-events-auto w-full md:w-auto">
        <ToastBanner message={message} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}

/**
 * 제어형 토스트.
 * open / message / onClose로 직접 제어할 때 사용합니다.
 */
export function Toast({
  open,
  message,
  onClose,
  duration = DEFAULT_DURATION,
}: ToastProps) {
  useEffect(() => {
    if (!open || duration <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [open, duration, onClose, message]);

  if (!open || !message) {
    return null;
  }

  return <ToastPortal message={message} onClose={onClose} />;
}

/**
 * 전역 토스트 Provider.
 * `showToast("메시지")` 또는 `useToast().showToast("메시지")`로 호출합니다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  const show = useCallback((message: string, options?: ToastOptions) => {
    toastId += 1;
    setToast({
      id: toastId,
      message,
      duration: options?.duration ?? DEFAULT_DURATION,
    });
  }, []);

  useEffect(() => {
    externalShowToast = show;
    externalDismissToast = dismiss;

    return () => {
      externalShowToast = null;
      externalDismissToast = null;
    };
  }, [show, dismiss]);

  return (
    <ToastContext.Provider value={{ showToast: show, dismissToast: dismiss }}>
      {children}
      {toast ? (
        <Toast
          key={toast.id}
          open
          message={toast.message}
          duration={toast.duration}
          onClose={dismiss}
        />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
