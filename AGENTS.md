# Workspace Development Rules (AGENTS.md)

This file defines the strict rules for developing within the multi-tenant ABCD Edu Hub platform. Follow these rules to avoid breaking navigation and context.

## 1. Multi-Tenant Routing Architecture
The platform supports two concurrent routing modes. Your code MUST support both:
- **Subdirectory Mode**: `domain.com/app/[tenant]/...`
- **Subdomain Mode**: `[tenant].domain.com/...`

### How to detect routing mode:
Always use `usePathname()` to check the starting segment:
```tsx
const pathname = usePathname();
const isSubdirectoryMode = pathname.startsWith('/app/');
```

### How to generate Workspace Links (GOLD RULE):
#### In Client Components:
Use `getTenantLink` with the current `pathname` from `usePathname()`.
```tsx
import { getTenantLink, isActivePath } from "@/lib/routing";
const href = getTenantLink("/student/dashboard", tenant, pathname);
const isActive = isActivePath(pathname, href);
```

#### Sidebars & Navigation:
Always use `getTenantLink` for item `href` and `isActivePath(pathname, item.href)` for the active state. This ensures nested routes (e.g., `/admin/students/123`) correctly highlight the parent menu item.

#### In Server Components (Layouts/Pages):
Use `getServerTenantLink` from `@/lib/routing-server`. This helper automatically detects the routing mode via internal headers.
```tsx
import { getServerTenantLink } from "@/lib/routing-server";
const href = await getServerTenantLink("/student/dashboard", tenant);
```

#### Redirects (Server-side):
NEVER use raw strings like `redirect("/")`. Always wrap them in `getServerTenantLink` to maintain context in Subdirectory mode.
```tsx
const target = await getServerTenantLink("/", tenant);
redirect(target);
```

> [!CAUTION]
> Hardcoding `/app/${tenant}/...` in redirects or links will BREAK subdomain mode. Conversely, using `/` without a prefix will BREAK subdirectory mode. The `getServerTenantLink` utility is the ONLY safe way to handle this project-wide.

## 2. Context Separation
- **Global Admin**: Routes starting with `/super-admin`. Data stored in `SiteSettings` with `workspaceId: null`.
- **Workspace Admin**: Routes starting with `.../admin`. Data stored in `SiteSettings` with a specific `workspaceId`.
- **Public Workspace**: Routes for students/guests. Data separate from the main landing page.

## 3. Data Integrity
- **Legal Pages**: Global legal pages (`/legal/[slug]`) and Workspace legal pages (`/app/[tenant]/legal/[slug]`) are separate entities. DO NOT mix them.
- **Help Center**: Workspaces have their own help center at `/help`. Global site uses `/support`.
- **Student Routes**: 
    - Public Info/Placeholder: `/students` (Plural)
    - Private Portal/Dashboard: `/student/dashboard` (Singular)
    - **Rule**: Navigation menus should link to `/student/dashboard` (Portal) for logged-in students to avoid the "Coming Soon" landing page.

## 4. UI/UX Standards
- **Workspace Footer**: MUST remain high-contrast (Black background, White text) unless specifically asked to change.
- **Dynamic Menus**: Always fetch navigation items from the `SiteSettings` of the current workspace context.

## 5. Defensive Programming
- **Tenant Detection**: Always provide fallbacks for `tenant` detection from `useParams()`, `usePathname()`, and props.
- **404 Prevention**: Before applying a prefix to a link, verify if it's already absolute or prefixed.

## 6. Prohibited Actions
- DO NOT use `window.location` for navigation; use `next/link` or `useRouter`.
- **Middleware Convention**: Next.js 16+ uses `src/proxy.ts` instead of `middleware.ts`. DO NOT create a `middleware.ts` file; all routing rewrites and auth protection must reside in `src/proxy.ts`.
- DO NOT use global styles that could bleed into the workspace isolation.

## 7. Dashboard & Admin UI/UX Design System Standards
> [!IMPORTANT]
> **Scope**: These rules apply STRICTLY to **Dashboard and Admin Management Pages** (Super Admin Dashboard, Franchise/Workspace Admin Dashboard, and Student Portal Dashboards: Users, Courses, Products, System Log, Settings, Profile, etc.).
> **Public Pages Exclusion**: Public-facing pages (Landing page, Franchise Public Sites, Public Course Showcase, Admission Application, Legal, Public Help Center) have their own already-defined public design system and MUST NOT use these compact dashboard management rules.

All Super Admin and Workspace Admin dashboard management pages MUST adhere strictly to the following spacing, typography, component, and layout tokens:

### 1. Page Shell & Vertical Rhythm
- **Root Container**: `<div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">`
- **Header (`AdminPageHeader`)**:
  - Title: `text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white`
  - Description: `text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400`
  - Top Action Buttons: `h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5`

### 2. Metric / Stat Cards Grid (`StatCard`)
- **Grid Container**: `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">`
- **Card**: `<Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">`
- **Padding**: `<CardContent className="p-3.5">` (NEVER use `p-6` or `p-8`)
- **Icon Badge**: `p-2.5 rounded-lg bg-[color]/10` with `h-5 w-5 [color]` icon
- **Label**: `text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5`
- **Metric Value**: `text-2xl font-bold tracking-tight text-slate-900 dark:text-white` (NEVER `text-4xl` or `text-3xl`)

### 3. Horizontal Navigation Tabs
- **Tabs Pill Container**: `<div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">`
- **Tab Buttons**:
  - Base: `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all`
  - Active: `bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner`
  - Inactive: `text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50`
  - Icons: `w-3.5 h-3.5`

### 4. Main Content Card & Filter Toolbar
- **Card Container**: `<Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">`
- **CardHeader (Toolbar)**: `<CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">`
- **Search Input**:
  - Container: `<div className="relative w-full md:max-w-[300px] group">`
  - Icon: `absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none` with `h-3.5 w-3.5 text-slate-400`
  - Input: `h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400`
- **Select Dropdowns & Filter Buttons**:
  - `SelectTrigger`: `h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60`
  - Filter Buttons: `h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-lg`

### 5. Table / List Items & Data Density
- **Divider**: `<div className="divide-y divide-slate-50 dark:divide-slate-800/50">`
- **Row Item**: `<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px] border-[statusColor]">`
- **Primary Info (Avatar + Text)**:
  - Avatar: `h-10 w-10 sm:h-11 sm:w-11 rounded-xl`
  - Title / Name: `font-semibold text-xs sm:text-sm text-slate-900 dark:text-white`
  - Subtitle / Meta: `text-[10px] font-medium text-slate-500`
- **Badges**: `text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none`
- **Metadata Column Group**:
  - Container: `<div className="flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-4 md:gap-5 w-full md:w-auto bg-slate-50/70 dark:bg-slate-800/30 lg:bg-transparent p-2 md:p-0 rounded-lg text-xs">`
  - Items: All columns must use `text-left shrink-0` (NEVER mix right-align on single columns to prevent artificial voids)
  - Long text containers: `max-w-[130px] sm:max-w-[150px] min-w-0 shrink-0` with `truncate block` and `<TooltipTrigger>` with `<TooltipContent>` (Clean name/title only, no redundant IDs/codes)
  - Sub-label: `text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5`
- **Action Buttons**:
  - Icon buttons: `h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors` with `h-3.5 w-3.5` icons
  - Text CTA buttons: `h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold`

### 6. Standardized Pagination System
- **Container**: `<div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">`
- **Counter**: `text-xs font-medium text-slate-500` ("Page {page} of {totalPages}" or "Showing X to Y of Z")
- **Buttons**:
  - Prev / Next: `h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm` with `h-3.5 w-3.5` icons
  - Numeric Buttons: `h-7 w-7 rounded-md font-semibold text-xs` (`variant={current ? "default" : "ghost"}`)
  - Ellipsis: `<span className="px-1 text-slate-400 text-xs select-none">...</span>`
  - Generation: Always use `getPageNumbers()` logic (7 pages or fewer -> full range; otherwise `1, 2, 3, 4, 5, '...', N` or `1, '...', N-4, ..., N` or `1, '...', p-1, p, p+1, '...', N`).

### 7. Dialogs & Modals
- **Size**: `max-w-2xl` (content forms) or `max-w-md` (confirmation/prompt), `rounded-2xl`
- **Padding**: `p-4 sm:p-5` or `p-4 sm:p-6` (NEVER `p-8`)
- **Inputs**: `h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700`
- **Buttons**: `h-8 sm:h-9 text-xs rounded-lg font-semibold`

