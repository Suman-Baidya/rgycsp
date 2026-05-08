# Dashboard Design System (Unified Style Guide)

This document defines the visual and structural rules for building all dashboard types within the ABCD Edu Hub platform.

## 1. Global Standards (All Dashboards)

- **Card Radius**: 
    - Standard Cards: `rounded-3xl` (24px)
    - Large Layout Containers: `rounded-[2.5rem]` (40px)
    - Small Inputs/Badges: `rounded-xl` (12px)
- **Borders**: Standardize on `border-2 border-slate-100/50` for premium cards or `border-border/40` for standard layouts.
- **Theming**: All dashboards MUST use dynamic primary/accent colors from the workspace's `siteSettings`.
- **Transitions**: Use `transition-all duration-300` for all interactive state changes.

---

## 2. Workspace Admin Dashboard
*Used by institute owners and administrators.*

### Page Structure & Spacing
- **Main Container**: `p-4 lg:p-10 max-w-7xl mx-auto space-y-10`
- **Section Spacing**: `space-y-10` between major functional blocks.
- **Card Padding**: Standard `p-8` for content cards.

### Page Header Standard
Always use the `AdminPageHeader` component.
- **Title**: `text-3xl font-bold tracking-tight text-slate-900 dark:text-white`
- **Description**: `text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed`
- **Margin Bottom**: `mb-10` (Enforced by component)

### Buttons & Actions
- **Primary Actions**: `Button` with `rounded-xl font-bold h-11 shadow-lg shadow-primary/20`
- **Secondary Actions**: `Button` with `variant="outline" rounded-xl font-bold h-11 border-2`
- **Icon Buttons**: `size="icon" h-9 w-9 rounded-xl`

### Tables & Data Display
- **Container**: Wrap `Table` in a `Card` with `rounded-3xl` and `p-0`.
- **Row Hover**: Use `hover:bg-slate-50/50 dark:hover:bg-white/5`.
- **Badges**: Use `rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider`.
- **Avatars**: `h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold`.

### Forms & Inputs
- **Input Style**: `rounded-xl border-2 border-slate-100 focus:border-primary transition-all`
- **Select Style**: Matching radius and border with the main inputs.
- **Dialogs**: `rounded-[2rem]` for the `DialogContent`.

---

## 3. Student Dashboard
*Used by learners.*

- **Layout**:
    - Header Height: `h-20` (Taller for a more premium feel)
    - Header Style: `bg-background/50 backdrop-blur-md border-b`
    - Navigation: `StudentSidebar` (Desktop) + `MobileBottomNav` (Mobile).
- **Aesthetics**:
    - High-visual impact.
    - Background: `bg-slate-50/50` (Light mode) for card contrast.
- **Component Patterns**:
    - Stats Cards: Large icons, bold numbers, colored low-opacity backgrounds.
    - Empty States: Large centered icons with dashed borders.

---

## 4. Super Admin Dashboard
*Used by platform developers and global managers.*

### Global Context
- **Layout**: Centered `max-w-7xl mx-auto` for all pages.
- **Background**: `bg-slate-50 dark:bg-slate-950` with subtle patterns.
- **Radius**: Heavy use of `rounded-[2.5rem]` (40px) for major cards and `rounded-2xl` for sub-components.

### Navigation & Header
- **Sidebar**: `AdminSidebar` (zinc-950/black based) for high-contrast global separation.
- **Page Header**: Always use `AdminPageHeader` with `font-black` titles.

### Visual Components
- **Stats Cards**: 
    - Container: `border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem]`
    - Labels: `text-[10px] font-black uppercase tracking-widest text-slate-400`
    - Values: `text-3xl font-black text-slate-900 dark:text-white tracking-tight`
- **Charts**: Use `ChartContainer` with `rounded-[2.5rem]` wrappers and large `p-8` padding.
- **Activity Logs**: 
    - Item Container: `p-6 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all`
    - Icons: `h-12 w-12 rounded-2xl bg-[Color]/10` with matching icon color.

---

## 5. Implementation Workflow

1.  **Routing Check**:
    - Server: `getServerTenantLink(path, tenant)`
    - Client: `getTenantLink(path, tenant, pathname)`
2.  **Mode Detection**:
    - Use `getRoutingConfig(pathname, hostname)` to detect Subdomain vs Subdirectory mode.
3.  **Active State**:
    - Use `isActivePath(pathname, href)` for sidebar/nav highlighting.
4.  **Hydration Pattern**:
    - ALWAYS place `if (!mounted) return null;` at the end of the client component logic to prevent React hydration mismatches while ensuring hooks remain in order.

---

## 6. Standard Component Snippets

### Admin Page Container
```tsx
<div className="space-y-10 pb-12 max-w-7xl mx-auto">
  <AdminPageHeader 
    title="Module Name" 
    description="Brief instruction about this module."
  >
    <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-white">
      Primary Action
    </Button>
  </AdminPageHeader>
  
  <div className="grid gap-10">
    {/* Page Content */}
  </div>
</div>
```

### Premium Metric Card (Super Admin)
```tsx
<Card className="relative overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] hover:border-primary/30 transition-all group">
  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
    <Icon className="h-12 w-12 text-primary" />
  </div>
  <CardHeader className="pb-2">
    <CardDescription className="text-[10px] uppercase tracking-widest font-black text-slate-400">
       {label}
    </CardDescription>
    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600">
        +12.5%
      </span>
      <span className="text-[10px] font-bold text-slate-400">vs last month</span>
    </div>
  </CardContent>
</Card>
```
