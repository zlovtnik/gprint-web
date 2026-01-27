// Toast notification store
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

const createToastStore = () => {
  let toasts = $state<Toast[]>([]);
  const timeoutMap = new Map<string, ReturnType<typeof setTimeout>>();

  const add = (type: ToastType, message: string, duration = 5000) => {
    const id = crypto.randomUUID();
    toasts = [...toasts, { id, type, message, duration }];

    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        dismiss(id);
      }, duration);
      timeoutMap.set(id, timeoutId);
    }

    return id;
  };

  const dismiss = (id: string) => {
    const timeoutId = timeoutMap.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutMap.delete(id);
    }
    toasts = toasts.filter((t) => t.id !== id);
  };

  const clear = () => {
    // Clear all pending timeouts
    for (const timeoutId of timeoutMap.values()) {
      clearTimeout(timeoutId);
    }
    timeoutMap.clear();
    toasts = [];
  };

  return {
    get toasts() {
      return toasts;
    },
    success: (msg: string, duration?: number) => add('success', msg, duration),
    error: (msg: string, duration?: number) => add('error', msg, duration ?? 8000),
    warning: (msg: string, duration?: number) => add('warning', msg, duration),
    info: (msg: string, duration?: number) => add('info', msg, duration),
    dismiss,
    clear
  };
};

export const toastStore = createToastStore();
