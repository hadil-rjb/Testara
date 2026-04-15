/**
 * Testara — shared UI primitives (design system).
 *
 *   import { Button, Input, Card } from '@/components/ui';
 *
 * All primitives:
 *   - honor the design tokens in `tailwind.config.ts` and `src/styles/`
 *   - respond to `[data-theme="dark"]` via CSS custom properties
 *   - expose a forwarded ref (where applicable) for composition
 *   - accept `className` + are safe to extend with any Tailwind utility
 *
 * See `./README.md` for usage examples and design principles.
 */

export { Alert } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';

export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from './Card';
export type { CardProps } from './Card';

export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { IconButton } from './IconButton';
export type {
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
} from './IconButton';

export { Input } from './Input';
export type { InputProps, InputSize } from './Input';

export { Label } from './Label';
export type { LabelProps } from './Label';

export { Separator } from './Separator';
export type { SeparatorProps } from './Separator';

export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { Switch } from './Switch';
export type { SwitchProps } from './Switch';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';
