import { ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './Label';

export interface FormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Show a success message below the field (e.g. after async validation). */
  success?: ReactNode;
  required?: boolean;
  className?: string;
  /**
   * Renders the child control. Receives an `id` (for a11y), `invalid`, and
   * `valid` booleans so the control can style itself accordingly.
   */
  children: (ctx: { id: string; invalid: boolean; valid: boolean }) => ReactNode;
}

/**
 * Wrap any input/textarea/select to pair it with a label, hint, error, and
 * success message in a consistent, accessible layout.
 *
 * @example
 * <FormField label="Email" hint="We'll never share." required error={emailErr}>
 *   {({ id, invalid }) => <Input id={id} invalid={invalid} value={email} ... />}
 * </FormField>
 */
export function FormField({
  label,
  hint,
  error,
  success,
  required,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const invalid = Boolean(error);
  const valid = !invalid && Boolean(success);
  const descriptionId = hint || error || success ? `${id}-desc` : undefined;

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children({ id, invalid, valid })}
      {error ? (
        <p id={descriptionId} role="alert" className="text-xs text-error mt-1.5 flex items-center gap-1">
          {error}
        </p>
      ) : success ? (
        <p id={descriptionId} className="text-xs text-[var(--alert-success-text)] mt-1.5 flex items-center gap-1">
          {success}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-xs text-muted mt-1.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
