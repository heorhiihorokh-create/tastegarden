'use client';

import type { ReactNode } from 'react';

/** Submit button that asks for confirmation before its (server-action) form submits. */
export function ConfirmButton({
  children,
  className,
  message,
  name,
  value,
  formAction,
}: {
  children: ReactNode;
  className?: string;
  message: string;
  name?: string;
  value?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      formAction={formAction}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

/** Header checkbox that toggles every row checkbox (name="ids") in the same form. */
export function SelectAll({ className }: { className?: string }) {
  return (
    <input
      type="checkbox"
      aria-label="Select all"
      className={className}
      onChange={(e) => {
        const form = e.currentTarget.closest('form');
        form
          ?.querySelectorAll<HTMLInputElement>('input[name="ids"]')
          .forEach((el) => (el.checked = e.currentTarget.checked));
      }}
    />
  );
}
