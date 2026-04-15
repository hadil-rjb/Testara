import { ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './Label';

export interface FormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  /** Renders the child control. Receives an `id` from the field for a11y. */
  children: (ctx: { id: string; invalid: boolean }) => ReactNode;
}

/**
 * Wrap any input/textarea/select to pair it with a label, hint, and error in a
 * consistent, accessible layout.
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
  required,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const invalid = Boolean(error);
  const descriptionId = hint || error ? `${id}-desc` : undefined;

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children({ id, invalid })}
      {error ? (
        <p id={descriptionId} className="text-xs text-error mt-1.5">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-xs text-muted mt-1.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
