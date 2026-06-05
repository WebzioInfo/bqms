# BQMS Deployment Architecture

## Environments

### 1. Development
- **Local Runtime:** Node.js v20+, npm
- **Database:** Local PostgreSQL 15 via Docker or native installation
- **Search:** Local Meilisearch instance via Docker
- **Caching:** In-memory or local Redis container

### 2. Staging
- **Hosting:** AWS Elastic Beanstalk or Vercel
- **Database:** AWS RDS PostgreSQL (db.t4g.micro)
- **Search:** Managed Meilisearch instance (small tier)
- **Caching:** AWS ElastiCache for Redis
- **CI/CD:** GitHub Actions (Deploy on push to `staging` branch)

### 3. Production
- **Hosting:** Vercel (Enterprise Plan) or AWS EKS for full orchestration
- **Database:** AWS RDS PostgreSQL Multi-AZ (db.r6g.large)
- **Search:** Managed Meilisearch instance (High Availability cluster)
- **Caching:** AWS ElastiCache for Redis (Multi-AZ)
- **Object Storage:** AWS S3 for PDF Certificates and Laboratory Reports
- **CDN:** Cloudflare (for Edge caching of public verification routes)

## Resilience & Monitoring Strategy
- **Backups:** RDS Automated Backups (35-day retention) + Cross-Region Snapshots
- **Logging:** Datadog or AWS CloudWatch for structured application logs
- **Error Tracking:** Sentry integrated into Next.js Server Actions and React Error Boundaries
- **Uptime:** Pingdom or Datadog Synthetics monitoring public `/verify/*` endpoints
