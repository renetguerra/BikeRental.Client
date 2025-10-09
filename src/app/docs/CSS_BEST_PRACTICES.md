# CSS Best Practices - Avoiding ::ng-deep

## Overview
The `::ng-deep` pseudo-class modifier is deprecated and should be avoided. This document outlines better alternatives for common scenarios.

## ❌ Problems with ::ng-deep
- **Deprecated**: Will be removed in future Angular versions
- **Global pollution**: Can affect unintended components
- **Hard to maintain**: Creates unpredictable style inheritance
- **Performance**: Disables Angular's view encapsulation optimizations

## ✅ Better Alternatives

### 1. Use CSS Custom Properties (Variables)
**Instead of:**
```css
::ng-deep [data-theme="dark"] .my-component {
  background: #333;
}
```

**Use:**
```css
.my-component {
  background: var(--card-bg);
}
```

### 2. Use :host for Component Boundaries
**Instead of:**
```css
::ng-deep .child-component .element {
  color: red;
}
```

**Use:**
```css
:host .child-component .element {
  color: red;
}
```

### 3. Global Styles for Third-Party Components
**Instead of:**
```css
::ng-deep .external-lib-component {
  border-radius: 8px;
}
```

**Use global styles in `styles.css`:**
```css
.external-lib-component {
  border-radius: 8px;
}
```

### 4. Component Communication for Styling
**Instead of:**
```css
::ng-deep .child-component {
  color: blue;
}
```

**Use Input properties:**
```typescript
// Parent Component
@Component({
  template: '<child-component [theme]="currentTheme"></child-component>'
})

// Child Component
@Component({
  template: '<div [class]="themeClass">Content</div>'
})
export class ChildComponent {
  @Input() theme = 'light';
  
  get themeClass() {
    return `theme-${this.theme}`;
  }
}
```

### 5. ViewEncapsulation.None for Specific Cases
**For components that need global styling:**
```typescript
@Component({
  selector: 'app-global-component',
  styleUrls: ['./global-component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GlobalComponent { }
```

## 🎯 Migration Strategies

### Theme Variables Approach
Replace theme-specific selectors with CSS variables:

```css
/* Before */
::ng-deep [data-theme="dark"] .card {
  background: #333;
  color: #fff;
}

::ng-deep [data-theme="light"] .card {
  background: #fff;
  color: #333;
}

/* After */
.card {
  background: var(--card-bg);
  color: var(--text-primary);
}
```

### Component-Scoped Styling
Use :host for component-specific overrides:

```css
/* Before */
::ng-deep .external-component .button {
  padding: 1rem;
}

/* After */
:host .external-component .button {
  padding: 1rem;
}
```

### Global Style Coordination
Move global styles to `styles.css`:

```css
/* styles.css */
.mat-mdc-table {
  background-color: var(--card-bg);
  color: var(--text-primary);
}

.mat-mdc-cell {
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}
```

## 🔧 Implementation Checklist

- [ ] **Remove all ::ng-deep** from component styles
- [ ] **Use CSS variables** for theme-dependent styling
- [ ] **Move global styles** to styles.css
- [ ] **Use :host** for component-scoped overrides
- [ ] **Test theme switching** works correctly
- [ ] **Verify styles** don't leak to other components

## 🎨 Theme System Integration

### Variable Structure
```css
:root {
  /* Light theme */
  --card-bg: #ffffff;
  --text-primary: #212529;
  --border-color: #dee2e6;
}

.dark-theme {
  /* Dark theme */
  --card-bg: #1a252f;
  --text-primary: #e3e5e4;
  --border-color: #374151;
}
```

### Component Usage
```css
.component {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## 📋 Benefits of This Approach

1. **Future-proof**: No deprecated CSS features
2. **Maintainable**: Clear separation of concerns
3. **Performant**: Proper view encapsulation
4. **Flexible**: Easy theme customization
5. **Type-safe**: With CSS-in-TS approaches
6. **Consistent**: Unified styling system

## 🚫 Common Mistakes to Avoid

- Don't use `::ng-deep` for new components
- Don't override Material Design components with `::ng-deep`
- Don't use theme-specific selectors (`[data-theme="dark"]`) in components
- Don't disable view encapsulation unnecessarily

## ✅ Code Review Guidelines

When reviewing CSS code, check for:
- ❌ Presence of `::ng-deep`
- ❌ Hard-coded theme colors
- ❌ Theme-specific selectors in components
- ✅ CSS variables usage
- ✅ Proper :host usage
- ✅ Global styles in appropriate files
