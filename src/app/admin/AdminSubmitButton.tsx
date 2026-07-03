'use client';

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

  return (
    <button
      name={name}
      value={value}
      disabled={disabled || pending}
      aria-busy={pending}
      className={className}
    >
      <span className={pending ? 'opacity-70' : ''}>
        {pending ? pendingText : children}
      </span>
    </button>
  );
}
