# Testara — UI Primitives

A small, opinionated set of design-system components that sit on top of
Tailwind CSS v4 and the design tokens declared in `tailwind.config.ts` and
`src/styles/themes.css`.

```tsx
import { Button, Input, Card, Alert } from '@/components/ui';
```

## Design principles

1. **Tokens first.** Every color, radius, shadow and font size resolves to a
   CSS custom property or a Tailwind token. Never hard-code hex values.
2. **Theme-aware.** The app swaps themes at runtime via
   `document.documentElement.dataset.theme`. Every primitive reads its colors
   through `var(--…)` so theme changes are instant and flicker-free.
3. **Composable.** Primitives accept `className` and forward refs where it
   matters. Utility classes always win over component defaults — use `cn()`
   from `@/lib/utils` to merge them safely.
4. **Accessible by default.** Focus rings, `aria-*` attributes, correct roles,
   keyboard support. When a label is not obvious from context, primitives
   accept `aria-label`.
5. **Minimal API.** Each primitive has a small set of variants and sizes.
   Reach for `className` before adding a new prop.

## Components

| Component            | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `Alert`              | Inline feedback — info / success / warning / error   |
| `Avatar`             | User initials or image, with size variants           |
| `Badge`              | Status / category tag                                |
| `Button`             | Primary / secondary / ghost / destructive actions    |
| `Card` *(family)*    | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter` |
| `FormField`          | Label + Input + helper/error text wrapper            |
| `IconButton`         | Square button optimized for a single icon            |
| `Input`              | Single-line text input                               |
| `Label`              | Semantic `<label>` with consistent typography        |
| `Separator`          | Horizontal / vertical divider                        |
| `Skeleton`           | Content placeholder while loading                    |
| `Spinner`            | Indeterminate loading indicator                      |
| `Switch`             | Accessible on/off toggle                             |
| `Textarea`           | Multi-line text input                                |

## Usage examples

### Button

```tsx
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

<Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
  New project
</Button>
```

### Form field

```tsx
import { FormField, Input } from '@/components/ui';

<FormField label="Email" helper="We'll never share it." error={errors.email}>
  <Input type="email" {...register('email')} />
</FormField>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Usage this month</CardTitle>
  </CardHeader>
  <CardBody>…</CardBody>
</Card>
```

### Alert

```tsx
<Alert variant="success" title="Project created" onDismiss={() => setOpen(false)}>
  You can find it in the dashboard.
</Alert>
```

### Switch

```tsx
<Switch
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
  aria-label="Enable notifications"
/>
```

## Adding a new primitive

1. Create `src/components/ui/MyThing.tsx`. Export a named component and its
   props type (`MyThingProps`).
2. Keep styling in Tailwind utilities and component classes from
   `tailwind.config.ts`. Do not reach into `globals.css`.
3. Forward the ref when the primitive wraps a single DOM element.
4. Re-export the component and its types from `src/components/ui/index.ts`.
5. Add an entry to the table above with a one-line description.

## Related files

- `tailwind.config.ts` — tokens, component classes, animations
- `src/styles/themes.css` — light/dark CSS custom properties
- `src/styles/base.css` — element resets and typography
- `src/lib/utils/cn.ts` — the `cn()` class-merging helper
