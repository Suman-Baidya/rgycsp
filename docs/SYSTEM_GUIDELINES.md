# ABCD Edu Hub - System Guidelines & Standards

This document serves as the "common file" to maintain a consistent architecture, UI/UX, and development pattern across the entire ABCD Edu Hub platform.

## 1. Product Vision & UX Philosophy

*   **Aesthetics First**: The UI must be visually stunning, feeling "premium" and modern. Utilize subtle micro-animations (e.g., hover states, page transitions), glassmorphism where appropriate, and a cohesive typography system.
*   **Dual Landing Pages**:
    *   *Super Admin Landing Page*: Aimed at Institute / Coaching owners (B2B). Needs to explain pricing, features, and have clear calls to action.
    *   *Workspace Landing Page*: Aimed at Students / Parents (B2C). Hosted on subdomains. Needs to be customizable via the Workspace Admin dashboard.
*   **Token-Driven Actions**: Instead of traditional billing (Stripe/Razorpay), use the Token economy as the internal currency for AI operations and premium usage.

## 2. Tech Stack Definition

*   **Fullstack Framework**: Next.js (App Router). We are using a unified architecture where Next.js handles both frontend React components and backend API endpoints via Server Actions and Route Handlers.
*   **Language**: TypeScript (strict mode enabled).
*   **Styling**: Tailwind CSS + `shadcn/ui`. Both Light and Dark modes must be supported seamlessly.
*   **Database ORM**: Prisma.
*   **Database**: Neon PostgreSQL (utilizing the Serverless Driver `@neondatabase/serverless` and `@prisma/adapter-neon`).
*   **AI Integration**: Google Gemini API.
*   **Media Storage**: Local/Cloudinary initially, migrating to AWS S3.
*   **Mail Service**: Resend + standard SMTP configured.

## 3. UI/UX & Component Guidelines

### Styling Rules
*   Do not use arbitrary/inline Tailwind strings unless necessary. Rely on predefined utility classes and `shadcn/ui` components mapped via `globals.css` CSS variables.
*   **Colors**: Use semantic names (`bg-primary`, `text-muted-foreground`) mapped to CSS variables for uniform Light/Dark mode toggling. Avoid writing raw hex codes in component files.
*   **Animations**: Leverage Tailwind's `transition`, `animate-in`, and `fade-in` utilities. Interactive elements like buttons and cards must have active and hover states.

### Component Structure (`src/components/`)
*   `ui/`: Base generic `shadcn/ui` components.
*   `shared/`: Reusable complex components used across the app (e.g., `SectionHeader`, `DataTable`, `TokenBalance`).
*   `layout/`: Navbars, Sidebars, Footers.
*   `[feature]/`: Components specific to a single feature domain (e.g., `exams/`, `attendance/`).

## 4. Backend & API Patterns

### Server Actions vs API Routes
*   **Server Actions**: Use these for strict form submissions and lightweight client-to-server data mutations (e.g., creating a course, submitting an assignment). Placed in `src/lib/actions/`.
*   **Route Handlers (`app/api/...`)**: Use these for external integrations, webhooks, or dynamic data feeds that don't fit smoothly into React Server Components.

### Database & Prisma Rules
*   Use Prisma queries inside Server Components or Server Actions.
*   *Never* pass raw Prisma instances directly to the client. Always serialize data (or use `.select` to strip unnecessary/sensitive fields).
*   Use the `prisma.$transaction` API when deducting tokens during AI generation or payment approval to prevent race conditions.

## 5. Multi-Tenancy Strategy (Subdomains)

*   **Identification**: Use Next.js Middleware (`middleware.ts`) to intercept the `Host` header.
*   **Routing**: If the host is a recognized tenant (e.g., `institute1.abcdeduhub.com`), rewrite the request transparently to a dynamic route like `/app/[tenantId]/...`.
*   **Data Isolation**: Every Prisma query *must* include `where: { workspaceId: currentWorkspaceId }` unless it is a Super Admin operation.

## 6. Token Economy Rules

*   **Action Cost**: Every interaction with the Gemini API costs X tokens.
*   **Verification**: Before completing an AI request, check the Workspace's token wallet. If `tokens < required`, throw a `PaymentRequired` error.
*   **Top-ups**: Workspaces request top-ups manually. They submit a request (with an uploaded screenshot of their UPI/Bank transfer). The Super Admin approves, and tokens are manually minted to the workspace's wallet.

## 7. Security Best Practices

*   **OAuth**: Keep Google Auth secrets only on the server.
*   **Image Uploads**: Validate file types/sizes server-side before persisting to Cloudinary.
*   **Role-Based Access**: Implement a robust guard utility `requireRole(user, ['SUPER_ADMIN', 'WORKSPACE_ADMIN'])` to check on every Server Action or Route.
