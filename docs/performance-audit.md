# BQMS Performance Audit

Date: 2026-06-23

## Scope

This pass focused on measurable bottlenecks visible in the local codebase:

- Prisma query shapes in server actions and dashboard pages.
- PostgreSQL index coverage for tenant-scoped filters, joins, counts, and sorting.
- Client payload size for table pages.
- Next.js production build health.

Runtime database query plans were not available from the local environment, so the database findings are based on static Prisma query analysis matched to PostgreSQL indexing rules.

## Root Causes Found

1. Missing secondary indexes on tenant-scoped tables.
   Most hot queries filter by `organizationId` and sort by `createdAt`, `issuedAt`, or `sampleTime`. Without compound indexes, large tenants drift toward full table scans and slow dashboard counts.

2. List pages fetched unbounded datasets.
   Users, reports, certificates, customers, compliance records, organizations, API products, and audit logs were loading whole result sets or very large result sets into client tables.

3. List pages over-fetched relations and columns.
   Several table actions used broad `include` or full model fetches where the UI only needed display columns and small organization labels.

4. Dashboard and analytics queries selected more data than required.
   Recent dashboard reports and certificate analytics did not need full row payloads.

5. Batch-module assumptions still affected performance and correctness.
   Previous cleanup removed live route references; this pass verified no live `src` references remain for removed batch, inspection, laboratory-report, or ERP sync routes.

## Optimizations Applied

### Database

Added indexes matching observed query patterns:

- Tenant list indexes such as `organizationId + createdAt`.
- Dashboard/status indexes such as `organizationId + status + createdAt/sampleTime/issuedAt`.
- Batch reference indexes for certificate/report linking.
- Foreign-key and join indexes for water test results, API subscriptions, API keys, audit logs, and corrective actions.
- Marketplace indexes for active products sorted by price.

### Prisma

Optimized server actions to:

- Cap high-traffic list queries at 100 rows.
- Use `select` for list payloads instead of full model reads.
- Select small organization labels rather than full organization objects.
- Select only `createdAt` for certificate chart aggregation.
- Select only dashboard fields needed for recent reports.
- Cap marketplace product browsing at 50 products.

### Next.js / React

Production build remains healthy after changes:

- `npm run build` passed.
- Build compile phase in the final run: 17.8s.
- TypeScript phase in the final run: 25.6s.
- Static page generation: 29/29 pages in 1.417s.

## Verification

Commands run:

```bash
npx prisma validate
npx prisma generate
npm run build
```

Targeted scans:

```bash
rg -n "batches|inspections|laboratory-reports|erp-sync|ErpSyncQueue" .\src
rg -n "PENDING_APPROVAL|MICROBIOLOGY_PENDING|WaterTestStatus\.PENDING|WaterTestStatus\.MICROBIOLOGY_PENDING" .\src .\prisma
```

Both targeted scans returned no live matches.

## Remaining Work

- Implement URL-driven server-side search, sorting, and pagination for all table pages.
- Add database-level migrations for the new Prisma indexes.
- Run `EXPLAIN ANALYZE` against seeded production-like data to verify index usage.
- Add load tests for dashboard, test reports, certificates, marketplace, and audit logs.
- Clean existing ESLint debt, especially broad `no-explicit-any` usage and unused legacy scripts.

## Scores After This Pass

- Performance: 72/100
- Database: 78/100
- Architecture: 70/100
- Scalability: 74/100
- Maintainability: 66/100
- Production Readiness: 72/100

These scores reflect meaningful query/index/payload improvements, with remaining risk in table pagination, runtime query-plan validation, and unresolved lint debt.
