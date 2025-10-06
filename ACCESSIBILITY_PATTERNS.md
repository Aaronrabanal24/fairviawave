# Accessibility Patterns Reference

Quick reference guide for accessibility patterns used in Fairvia Wave.

## Button Patterns

### Standard Button
```tsx
<button
  className="px-4 py-2 bg-blue-600 text-white rounded-lg 
             hover:bg-blue-700 
             focus-visible:outline focus-visible:outline-2 
             focus-visible:outline-offset-2 focus-visible:outline-blue-600 
             transition-colors min-h-[44px]"
  aria-label="Descriptive action"
>
  Button Text
</button>
```

### Icon Button
```tsx
<button
  className="min-h-[44px] min-w-[44px] ..."
  aria-label="Close dialog"
>
  <span aria-hidden="true">✕</span>
</button>
```

## Link Patterns

### Skip to Content
```tsx
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 
             focus:left-2 focus:z-50 focus:px-4 focus:py-3 
             focus:bg-yellow-200 focus:text-black focus:font-semibold 
             rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
>
  Skip to main content
</a>
```

### Pagination Link
```tsx
<Link
  href="/page/2"
  aria-label="Go to next page"
  className="px-4 py-2.5 rounded-lg border 
             focus-visible:outline focus-visible:outline-2 
             focus-visible:outline-offset-2 
             min-h-[44px]"
>
  Next
</Link>
```

## Form Patterns

### Text Input with Label
```tsx
<label htmlFor="name" className="block text-sm font-medium mb-1">
  Name
</label>
<input
  id="name"
  type="text"
  className="w-full px-3 py-2 border rounded 
             focus-visible:outline focus-visible:outline-2"
  aria-required="true"
  aria-describedby="name-help"
/>
<p id="name-help" className="text-sm text-gray-600">
  Enter your full name
</p>
```

### Select Dropdown
```tsx
<label htmlFor="status" className="block text-sm font-medium mb-1">
  Status
</label>
<select
  id="status"
  className="w-full px-3 py-2 border rounded min-h-[44px]"
  aria-label="Select status"
>
  <option>Active</option>
  <option>Inactive</option>
</select>
```

## Loading States

### Spinner with Status
```tsx
<div role="status" aria-live="polite">
  <div 
    className="animate-spin rounded-full h-12 w-12 border-b-2" 
    aria-hidden="true"
  />
  <p className="mt-4">Loading...</p>
  <span className="sr-only">Please wait while content loads</span>
</div>
```

### Progress Bar
```tsx
<div 
  role="progressbar" 
  aria-label="Upload progress"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={progress}
  className="w-full h-2 bg-gray-200 rounded"
>
  <div 
    className="h-full bg-blue-600 rounded transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

## Alert Patterns

### Error Alert
```tsx
<div 
  role="alert" 
  aria-live="polite"
  className="p-4 bg-red-50 border border-red-200 rounded"
>
  <p className="font-semibold text-red-700">Error</p>
  <p className="text-red-600">Something went wrong</p>
</div>
```

### Success Message
```tsx
<div 
  role="status" 
  aria-live="polite"
  className="p-4 bg-green-50 border border-green-200 rounded"
>
  <p className="text-green-700">Successfully saved!</p>
</div>
```

## Navigation Patterns

### Tab List
```tsx
<div 
  role="tablist" 
  aria-label="Time range selection"
  className="flex gap-2"
>
  <button
    role="tab"
    aria-selected={selected === '1d'}
    aria-controls="panel-1d"
    className="px-3 py-2 min-h-[44px]"
  >
    24 hours
  </button>
  <button
    role="tab"
    aria-selected={selected === '7d'}
    aria-controls="panel-7d"
    className="px-3 py-2 min-h-[44px]"
  >
    7 days
  </button>
</div>
<div id="panel-1d" role="tabpanel" hidden={selected !== '1d'}>
  {/* Content */}
</div>
```

### Breadcrumb Navigation
```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex items-center gap-2">
    <li>
      <Link href="/" className="text-blue-600 hover:underline">
        Home
      </Link>
    </li>
    <li aria-hidden="true">/</li>
    <li aria-current="page" className="text-gray-900">
      Current Page
    </li>
  </ol>
</nav>
```

## Data Display Patterns

### Data Table
```tsx
<table className="w-full">
  <caption className="sr-only">List of units</caption>
  <thead>
    <tr>
      <th scope="col" className="text-left px-4 py-2">Name</th>
      <th scope="col" className="text-left px-4 py-2">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="px-4 py-2">Unit 001</td>
      <td className="px-4 py-2">
        <span className="sr-only">Status: </span>Active
      </td>
    </tr>
  </tbody>
</table>
```

### Timeline
```tsx
<section aria-label="Activity timeline">
  <ol role="list" className="relative border-l-2">
    {events.map(event => (
      <li key={event.id} className="mb-8">
        <article>
          <span 
            className="absolute -left-2 h-4 w-4 rounded-full" 
            aria-hidden="true"
          />
          <div className="flex items-center gap-2">
            <span role="status">{event.type}</span>
            <time dateTime={event.timestamp}>
              {formatDate(event.timestamp)}
            </time>
          </div>
          <p>{event.content}</p>
        </article>
      </li>
    ))}
  </ol>
</section>
```

## Modal/Dialog Patterns

### Modal Dialog
```tsx
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
  className="fixed inset-0 z-50 flex items-center justify-center"
>
  <div className="bg-white rounded-lg p-6 max-w-md">
    <h2 id="modal-title" className="text-xl font-bold">
      Confirm Action
    </h2>
    <p id="modal-description" className="mt-2">
      Are you sure you want to proceed?
    </p>
    <div className="mt-4 flex gap-3">
      <button className="min-h-[44px]">Cancel</button>
      <button className="min-h-[44px]">Confirm</button>
    </div>
  </div>
</div>
```

## Responsive Patterns

### Mobile-First Layout
```tsx
<div className="
  p-4 sm:p-6 md:p-8
  text-base sm:text-lg md:text-xl
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
  gap-4 sm:gap-6
">
  {/* Content */}
</div>
```

### Adaptive Components
```tsx
<div className="flex flex-col sm:flex-row gap-4">
  <button className="w-full sm:w-auto min-h-[44px]">
    <span className="hidden sm:inline">Full Text</span>
    <span className="sm:hidden">Short</span>
  </button>
</div>
```

## Screen Reader Patterns

### Visually Hidden Text
```tsx
<span className="sr-only">
  Additional context for screen readers
</span>
```

### Icon with Label
```tsx
<button aria-label="Close">
  <span aria-hidden="true">×</span>
</button>
```

### Decorative Images
```tsx
<img src="icon.svg" alt="" role="presentation" />
```

## Live Region Patterns

### Polite Announcement
```tsx
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### Assertive Announcement (Urgent)
```tsx
<div aria-live="assertive" role="alert">
  {urgentMessage}
</div>
```

## Focus Management

### Focus Trap in Modal
```tsx
useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current?.querySelector('button');
    firstFocusable?.focus();
  }
}, [isOpen]);
```

### Return Focus on Close
```tsx
const previousFocus = useRef<HTMLElement | null>(null);

const openModal = () => {
  previousFocus.current = document.activeElement as HTMLElement;
  setIsOpen(true);
};

const closeModal = () => {
  setIsOpen(false);
  previousFocus.current?.focus();
};
```

## Testing Patterns

### Keyboard Test
```typescript
test('component is keyboard accessible', async ({ page }) => {
  await page.goto('/page');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
});
```

### Axe Accessibility Test
```typescript
test('no critical a11y issues', async ({ page }) => {
  await page.goto('/page');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical).toEqual([]);
});
```

### Touch Target Test
```typescript
test('buttons meet minimum size', async ({ page }) => {
  await page.goto('/page');
  const buttons = page.getByRole('button');
  for (let i = 0; i < await buttons.count(); i++) {
    const box = await buttons.nth(i).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});
```

---

## Quick Checklist

When adding new components:

- [ ] Minimum 44×44px touch targets
- [ ] focus-visible:outline for keyboard navigation
- [ ] Proper ARIA labels on interactive elements
- [ ] Semantic HTML (section, article, nav, aside)
- [ ] aria-live for dynamic content
- [ ] role="alert" for error messages
- [ ] Mobile-responsive spacing and typography
- [ ] Screen reader text with sr-only
- [ ] Keyboard accessible (Tab, Enter, Space)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
