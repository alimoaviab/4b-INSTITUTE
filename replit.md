# Student Admission & Entry Test Management System

A full-stack SaaS platform for managing student admissions, entry tests with anti-cheating monitoring, and results.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/admission-system run dev` — run the frontend (port 20003, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Wouter, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod validation schemas
- `lib/db/src/schema/` — Drizzle ORM database schema files
- `artifacts/api-server/src/routes/` — Express route handlers (one file per domain)
- `artifacts/admission-system/src/pages/` — React pages (student/ and admin/ subdirectories)

## Architecture decisions

- **Contract-first API**: OpenAPI spec written first, then Orval generates hooks + Zod schemas. Never manually edit generated files.
- **Simulated face verification**: Face matching is client-side simulation (random score 85–99%) — no ML library integrated.
- **Admin auth**: SHA-256 password hash with salt `admission_salt_2024`. Token = base64(`adminId:timestamp:randomHex`), stored in `localStorage` as `admin_token`.
- **Route ordering**: Specific routes like `/students/bulk-import` registered before parametric `/students/:id` in each router file.
- **Anti-cheating**: Violations logged server-side; camera captures tab-switch events and face-absence events during test.

## Product

- **Student flow**: Face verification → multi-step registration form → test instructions → proctored MCQ test (60 min, 50 questions) → result page
- **Admin portal**: Dashboard with charts, student management (CRUD + bulk import + block), application processing, question bank, test configuration, results & merit list, interview scheduling, violation review, verification audit log
- **Demo credentials**: `admin@admission.edu.pk` / `admin123`
- **Demo students**: Roll numbers `2024-001` through `2024-006`, CNIC format `XXXXX-XXXXXXX-X`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`.
- Run `pnpm --filter @workspace/db run push` after editing schema files.
- Do not import from `@workspace/api-client-react/src/...` deep paths — use the barrel import `@workspace/api-client-react` only.
- The shared reverse proxy routes `/api` to port 8080 and `/` to port 20003.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
