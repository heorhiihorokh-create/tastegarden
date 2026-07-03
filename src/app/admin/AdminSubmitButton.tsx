'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

export function AdminSubmitButton({
  children,
  pendingText = 'Bezig…',
  className = '',
  disabled = false,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  const [optimisticPending, setOptimisticPending] = useState(false);
  const busy = pending || optimisticPending;

  useEffect(() => {
    if (!optimisticPending || pending) return;
    const settleTimer = window.setTimeout(() => setOptimisticPending(false), 420);
    return () => window.clearTimeout(settleTimer);
  }, [optimisticPending, pending]);

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={disabled || pending}
      aria-busy={busy}
      onClick={() => {
        if (!disabled) setOptimisticPending(true);
      }}
      className={className}
    >
      <span className={`transition-opacity duration-150 ${busy ? 'opacity-70' : ''}`}>
        {busy ? pendingText : children}
      </span>
    </button>
  );
}
